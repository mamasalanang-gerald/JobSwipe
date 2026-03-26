<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\HRSwipeRequest;
use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\ApplicantProfile;
use App\Models\PostgreSQL\Application;
use App\Models\PostgreSQL\JobPosting;
use App\Repositories\PostgreSQL\ApplicationRepository;
use App\Services\SwipeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantReviewController extends Controller
{
    public function __construct(
        private ApplicationRepository $applications,
        private SwipeService $swipe,
    ) {}

    public function getApplicants(Request $request, string $jobId): JsonResponse
    {
        $this->authorizeJobAccess($request, $jobId);

        // Get prioritized applicants (5-tier algorithm)
        $applicants = $this->applications->getPrioritizedApplicants($jobId, perPage: 20);

        // Load MongoDB profile data
        foreach ($applicants as $application) {
            $mongoProfile = ApplicantProfileDocument::where('user_id', $application->applicant->user_id)->first();
            $application->applicant->profile_data = $mongoProfile;
        }

        return $this->success(data: $applicants);
    }

    public function getApplicantDetail(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $this->authorizeJobAccess($request, $jobId);

        $application = Application::where('job_posting_id', $jobId)
            ->where('applicant_id', $applicantId)
            ->with('applicant')
            ->firstOrFail();

        // Load full MongoDB profile
        $mongoProfile = ApplicantProfileDocument::where('user_id', $application->applicant->user_id)->first();
        $application->applicant->profile_data = $mongoProfile;

        return $this->success(data: $application);
    }

    public function swipeRight(HRSwipeRequest $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = $this->authorizeJobAccess($request, $jobId);

        // Process interview template message
        $message = $this->processMessageTemplate(
            $request->message ?? $job->interview_template,
            $applicantId,
            $job
        );

        $result = $this->swipe->hrSwipeRight(
            $request->user()->id,
            $jobId,
            $applicantId,
            $message
        );

        return match ($result['status']) {
            'invited' => $this->success(message: 'Interview invitation sent'),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this applicant', 409),
        };
    }

    public function swipeLeft(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $this->authorizeJobAccess($request, $jobId);

        $result = $this->swipe->hrSwipeLeft(
            $request->user()->id,
            $jobId,
            $applicantId
        );

        return match ($result['status']) {
            'dismissed' => $this->success(message: 'Applicant dismissed'),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this applicant', 409),
        };
    }

    private function authorizeJobAccess(Request $request, string $jobId): JobPosting
    {
        $job = JobPosting::findOrFail($jobId);

        if ($job->company_id !== $request->user()->companyProfile->id) {
            abort(403, 'Not authorized');
        }

        return $job;
    }

    private function processMessageTemplate(string $template, string $applicantId, JobPosting $job): string
    {
        $applicant = ApplicantProfile::findOrFail($applicantId);
        $mongoProfile = ApplicantProfileDocument::where('user_id', $applicant->user_id)->first();

        $replacements = [
            '{{applicant_name}}' => $mongoProfile->first_name.' '.$mongoProfile->last_name,
            '{{job_title}}' => $job->title,
            '{{company_name}}' => $job->company->company_name,
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}

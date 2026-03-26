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
        $job = JobPosting::with('skills')->findOrFail($jobId);

        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }

        $applicants = $this->applications->getPrioritizedApplicants($jobId, perPage: 20);

        foreach ($applicants as $application) {
            $mongoProfile = ApplicantProfileDocument::where('user_id', $application->applicant->user_id)->first();
            $application->applicant->profile_data = $mongoProfile;
            $application->applicant->skill_match_percentage = $this->calculateSkillMatchPercentage($job, $mongoProfile);
        }

        return $this->success(data: $applicants);
    }

    public function getApplicantDetail(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = JobPosting::with('skills')->findOrFail($jobId);

        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }

        $application = Application::where('job_posting_id', $jobId)
            ->where('applicant_id', $applicantId)
            ->with('applicant')
            ->firstOrFail();

        $mongoProfile = ApplicantProfileDocument::where('user_id', $application->applicant->user_id)->first();

        if (! $this->isApplicantProfileComplete($mongoProfile)) {
            return $this->error(
                'INCOMPLETE_PROFILE',
                'Applicant profile is missing required information.',
                400
            );
        }

        $application->applicant->profile_data = $mongoProfile;
        $application->applicant->skill_match_percentage = $this->calculateSkillMatchPercentage($job, $mongoProfile);

        return $this->success(data: $application);
    }

    public function swipeRight(HRSwipeRequest $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);

        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }

        $message = $this->processMessageTemplate(
            (string) ($request->message ?? $job->interview_template),
            $applicantId,
            $jobId
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
            default => $this->error('SWIPE_FAILED', 'Unable to process swipe.', 500),
        };
    }

    public function swipeLeft(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);

        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }

        $result = $this->swipe->hrSwipeLeft(
            $request->user()->id,
            $jobId,
            $applicantId
        );

        return match ($result['status']) {
            'dismissed' => $this->success(message: 'Applicant dismissed'),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this applicant', 409),
            default => $this->error('SWIPE_FAILED', 'Unable to process swipe.', 500),
        };
    }

    private function processMessageTemplate(string $template, string $applicantId, string $jobId): string
    {
        $applicant = ApplicantProfile::findOrFail($applicantId);
        $mongoProfile = ApplicantProfileDocument::where('user_id', $applicant->user_id)->first();
        $job = JobPosting::findOrFail($jobId);

        $fullName = trim((string) ($mongoProfile?->first_name.' '.$mongoProfile?->last_name));

        $replacements = [
            '{{applicant_name}}' => $fullName !== '' ? $fullName : 'Applicant',
            '{{job_title}}' => $job->title,
            '{{company_name}}' => $job->company->company_name,
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    private function isApplicantProfileComplete(?ApplicantProfileDocument $profile): bool
    {
        if (! $profile) {
            return false;
        }

        return ! empty(trim((string) $profile->first_name))
            && ! empty(trim((string) $profile->last_name))
            && ! empty(trim((string) $profile->location))
            && ! empty(trim((string) $profile->resume_url))
            && is_array($profile->skills)
            && count($profile->skills) > 0;
    }

    private function calculateSkillMatchPercentage(JobPosting $job, ?ApplicantProfileDocument $profile): int
    {
        if (! $profile || ! is_array($profile->skills)) {
            return 0;
        }

        $jobSkills = $job->skills
            ->pluck('skill_name')
            ->map(fn ($skill) => strtolower(trim((string) $skill)))
            ->filter()
            ->unique()
            ->values();

        if ($jobSkills->count() === 0) {
            return 0;
        }

        $applicantSkills = collect($profile->skills)
            ->map(function ($skill) {
                if (is_array($skill)) {
                    return strtolower(trim((string) ($skill['name'] ?? '')));
                }

                if (is_object($skill)) {
                    return strtolower(trim((string) ($skill->name ?? '')));
                }

                return '';
            })
            ->filter()
            ->unique();

        $matched = $jobSkills->filter(fn ($skill) => $applicantSkills->contains($skill))->count();

        return (int) round(($matched / $jobSkills->count()) * 100);
    }
}

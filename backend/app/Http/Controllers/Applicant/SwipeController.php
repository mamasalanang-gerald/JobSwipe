<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Services\DeckService;
use App\Services\SwipeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SwipeController extends Controller
{
    public function __construct(
        private SwipeService $swipe,
        private DeckService $deck,
    ) {}

    /**
     * Get the job swipe deck for the authenticated applicant
     *
     * GET /api/v1/applicant/swipe/deck
     */
    public function getDeck(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $perPage = (int) $request->input('per_page', 20);
        $cursor = $request->input('cursor');

        $deck = $this->deck->getJobDeck($userId, $perPage, is_string($cursor) ? $cursor : null);

        return $this->success(data: $deck);
    }

    /**
     * Swipe right on a job (apply)
     *
     * POST /api/v1/applicant/swipe/right/{job_id}
     */
    public function swipeRight(Request $request, string $jobId): JsonResponse
    {
        $result = $this->swipe->applicantSwipeRight($request->user()->id, $jobId);

        return match ($result['status']) {
            'applied' => $this->success(
                message: 'Application submitted successfully'
            ),
            'limit_reached' => $this->error(
                'SWIPE_LIMIT_REACHED',
                'Daily swipe limit reached. Upgrade or purchase swipe packs.',
                429
            ),
            'already_swiped' => $this->error(
                'ALREADY_SWIPED',
                'You have already swiped on this job',
                409
            ),
            default => $this->error(
                'SWIPE_FAILED',
                'Failed to process swipe',
                500
            ),
        };
    }

    /**
     * Swipe left on a job (dismiss)
     *
     * POST /api/v1/applicant/swipe/left/{job_id}
     */
    public function swipeLeft(Request $request, string $jobId): JsonResponse
    {
        $result = $this->swipe->applicantSwipeLeft($request->user()->id, $jobId);

        return match ($result['status']) {
            'dismissed' => $this->success(
                message: 'Job dismissed'
            ),
            'limit_reached' => $this->error(
                'SWIPE_LIMIT_REACHED',
                'Daily swipe limit reached. Upgrade or purchase swipe packs.',
                429
            ),
            'already_swiped' => $this->error(
                'ALREADY_SWIPED',
                'You have already swiped on this job',
                409
            ),
            default => $this->error(
                'SWIPE_FAILED',
                'Failed to process swipe',
                500
            ),
        };
    }

    /**
     * Get swipe limits and usage for the authenticated applicant
     *
     * GET /api/v1/applicant/swipe/limits
     */
    public function getLimits(Request $request): JsonResponse
    {
        $applicant = $request->user()->applicantProfile;

        if (! $applicant) {
            return $this->error(
                'PROFILE_NOT_FOUND',
                'Applicant profile not found',
                404
            );
        }

        return $this->success(data: [
            'daily_swipes_used' => $applicant->daily_swipes_used,
            'daily_swipe_limit' => $applicant->daily_swipe_limit,
            'extra_swipe_balance' => $applicant->extra_swipe_balance,
            'has_swipes_remaining' => $applicant->hasSwipesRemaining(),
            'swipe_reset_at' => $applicant->swipe_reset_at,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\PostgreSQL\CompanyReviewRepository;
use App\Services\ReviewService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService,
        private CompanyReviewRepository $companyReviewRepository,
    ) {}

    /**
     * Get flagged reviews for moderation
     */
    public function getFlaggedReviews(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 20);
            $flaggedReviews = $this->companyReviewRepository->getFlaggedReviews($perPage);

            return $this->success($flaggedReviews, 'Flagged reviews retrieved successfully.');

        } catch (Exception $e) {
            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }

    /**
     * Unflag a review (dismiss false flag)
     */
    public function unflag(string $id, Request $request): JsonResponse
    {
        try {
            $this->reviewService->unflagReview($id);

            return $this->success(null, 'Review unflagged successfully.');

        } catch (Exception $e) {
            if (str_contains($e->getMessage(), 'not found')) {
                return $this->error('REVIEW_NOT_FOUND', 'Review not found.', 404);
            }

            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }

    /**
     * Remove a review (hide from public)
     */
    public function remove(string $id, Request $request): JsonResponse
    {
        try {
            $moderatorId = $request->user()->id;
            $this->reviewService->removeReview($id, $moderatorId);

            return $this->success(null, 'Review removed successfully.');

        } catch (Exception $e) {
            if (str_contains($e->getMessage(), 'not found')) {
                return $this->error('REVIEW_NOT_FOUND', 'Review not found.', 404);
            }

            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use App\Services\AdminService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCompanyVerificationController extends Controller
{
    public function __construct(
        private AdminService $adminService,
        private CompanyProfileRepository $companyProfileRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $status = $request->input('status', 'pending');

            if (! in_array($status, ['pending', 'approved', 'rejected'], true)) {
                return $this->error('VALIDATION_ERROR', 'Invalid status filter.', 422);
            }

            $perPage = (int) $request->input('per_page', 20);
            $results = $this->companyProfileRepository->paginateByVerificationStatus($status, $perPage);

            return $this->success($results, 'Company verifications retrieved successfully.');
        } catch (Exception $e) {
            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }

    public function show(string $companyId): JsonResponse
    {
        try {
            $detail = $this->adminService->getCompanyVerificationDetail($companyId);

            return $this->success($detail, 'Company verification detail retrieved successfully.');
        } catch (Exception $e) {
            if (str_contains($e->getMessage(), 'not found')) {
                return $this->error('COMPANY_NOT_FOUND', 'Company not found.', 404);
            }

            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }

    public function approve(string $companyId, Request $request): JsonResponse
    {
        try {
            $company = $this->adminService->approveCompanyVerification($companyId, $request->user()->id);

            return $this->success($company, 'Company verification approved.');
        } catch (Exception $e) {
            $message = $e->getMessage();

            if (str_contains($message, 'not found')) {
                return $this->error('COMPANY_NOT_FOUND', 'Company not found.', 404);
            }

            if (str_contains($message, 'already approved')) {
                return $this->error('ALREADY_VERIFIED', $message, 409);
            }

            return $this->error('ERROR', $message, 500);
        }
    }

    public function reject(string $companyId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:3|max:1000',
        ]);

        try {
            $company = $this->adminService->rejectCompanyVerification(
                $companyId,
                $request->user()->id,
                $validated['reason'],
            );

            return $this->success($company, 'Company verification rejected.');
        } catch (Exception $e) {
            $message = $e->getMessage();

            if (str_contains($message, 'not found')) {
                return $this->error('COMPANY_NOT_FOUND', 'Company not found.', 404);
            }

            if (str_contains($message, 'already rejected')) {
                return $this->error('ALREADY_REJECTED', $message, 409);
            }

            return $this->error('ERROR', $message, 500);
        }
    }
}

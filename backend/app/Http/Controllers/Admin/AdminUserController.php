<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\PostgreSQL\UserRepository;
use App\Services\AdminService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(
        private AdminService $adminService,
        private UserRepository $userRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'role' => $request->input('role'),
                'is_banned' => $request->has('is_banned') ? $request->boolean('is_banned') : null,
                'search' => $request->input('search'),
            ];

            $perPage = (int) $request->input('per_page', 20);
            $users = $this->userRepository->searchAdmin($filters, $perPage);

            return $this->success($users, 'Users retrieved successfully.');
        } catch (Exception $e) {
            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            return $this->error('USER_NOT_FOUND', 'User not found.', 404);
        }

        return $this->success($user, 'User retrieved successfully.');
    }

    public function ban(string $id, Request $request): JsonResponse
    {
        try {
            $user = $this->adminService->banUser($id, $request->user()->id);

            return $this->success($user, 'User banned successfully.');
        } catch (Exception $e) {
            $message = $e->getMessage();

            if (str_contains($message, 'not found')) {
                return $this->error('USER_NOT_FOUND', 'User not found.', 404);
            }

            if (str_contains($message, 'yourself')) {
                return $this->error('CANNOT_BAN_SELF', $message, 422);
            }

            if (str_contains($message, 'super admin')) {
                return $this->error('CANNOT_BAN_ADMIN', $message, 403);
            }

            return $this->error('ERROR', $message, 500);
        }
    }

    public function unban(string $id): JsonResponse
    {
        try {
            $user = $this->adminService->unbanUser($id);

            return $this->success($user, 'User unbanned successfully.');
        } catch (Exception $e) {
            if (str_contains($e->getMessage(), 'not found')) {
                return $this->error('USER_NOT_FOUND', 'User not found.', 404);
            }

            return $this->error('ERROR', $e->getMessage(), 500);
        }
    }
}

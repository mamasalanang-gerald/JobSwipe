<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Services\CompanyInvitationService;
use App\Services\CompanyMembershipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;

class CompanyInviteController extends Controller
{
    public function __construct(
        private CompanyInvitationService $invitations,
        private CompanyMembershipService $memberships,
    ) {}

    /**
     * Create a new company invite
     *
     * POST /api/v1/company/invites
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'role' => 'required|in:company_admin,hr',
        ]);

        if ($validator->fails()) {
            return $this->error('VALIDATION_FAILED', $validator->errors()->first(), 422);
        }

        $user = $request->user();
        $company = $this->memberships->getPrimaryCompanyForUser($user->id);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found.', 403);
        }

        try {
            $result = $this->invitations->createInvite(
                companyId: $company->id,
                inviterUserId: $user->id,
                email: $request->input('email'),
                inviteRole: $request->input('role')
            );

            return $this->success([
                'invite' => [
                    'id' => $result['invite']->id,
                    'email' => $result['invite']->email,
                    'role' => $result['invite']->invite_role,
                    'expires_at' => $result['invite']->expires_at,
                    'created_at' => $result['invite']->created_at,
                ],
                'token' => $result['token'],
            ], 'Invite created successfully.');
        } catch (InvalidArgumentException $e) {
            return match ($e->getMessage()) {
                'INVITE_FORBIDDEN' => $this->error('INVITE_FORBIDDEN', 'Only company admins can create invites.', 403),
                'INVITE_ROLE_INVALID' => $this->error('INVITE_ROLE_INVALID', 'Invalid invite role.', 422),
                'INVITE_EMAIL_INVALID' => $this->error('INVITE_EMAIL_INVALID', 'Invalid email address.', 422),
                default => $this->error('INVITE_FAILED', $e->getMessage(), 400),
            };
        }
    }

    /**
     * Create multiple invites at once
     *
     * POST /api/v1/company/invites/bulk
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'emails' => 'required|array|max:20',
            'emails.*' => 'required|email|max:255',
            'role' => 'required|in:company_admin,hr',
        ]);

        if ($validator->fails()) {
            return $this->error('VALIDATION_FAILED', $validator->errors()->first(), 422);
        }

        $user = $request->user();
        $company = $this->memberships->getPrimaryCompanyForUser($user->id);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found.', 403);
        }

        try {
            $result = $this->invitations->createBulkInvites(
                companyId: $company->id,
                inviterUserId: $user->id,
                emails: $request->input('emails'),
                inviteRole: $request->input('role')
            );

            return $this->success($result, 'Bulk invites processed.');
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 'Bulk invite failed.', 403);
        }
    }

    /**
     * Resend an invite email
     *
     * POST /api/v1/company/invites/{inviteId}/resend
     */
    public function resend(Request $request, string $inviteId): JsonResponse
    {
        $user = $request->user();
        $company = $this->memberships->getPrimaryCompanyForUser($user->id);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found.', 403);
        }

        try {
            $result = $this->invitations->resendInvite($company->id, $user->id, $inviteId);

            return $this->success([
                'invite' => [
                    'id' => $result['invite']->id,
                    'email' => $result['invite']->email,
                    'invite_email_sent_at' => $result['invite']->invite_email_sent_at,
                ],
            ], 'Invite resent successfully.');
        } catch (InvalidArgumentException $e) {
            return match ($e->getMessage()) {
                'INVITE_FORBIDDEN' => $this->error('INVITE_FORBIDDEN', 'Only company admins can resend invites.', 403),
                'INVITE_NOT_FOUND' => $this->error('INVITE_NOT_FOUND', 'Invite not found.', 404),
                'INVITE_ALREADY_ACCEPTED' => $this->error('INVITE_ALREADY_ACCEPTED', 'Cannot resend an accepted invite.', 400),
                default => $this->error('RESEND_FAILED', $e->getMessage(), 400),
            };
        }
    }

    /**
     * List all invites for the company
     *
     * GET /api/v1/company/invites
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $this->memberships->getPrimaryCompanyForUser($user->id);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found.', 403);
        }

        try {
            $invites = $this->invitations->listInvites($company->id, $user->id);

            return $this->success([
                'invites' => $invites->map(fn ($invite) => [
                    'id' => $invite->id,
                    'email' => $invite->email,
                    'role' => $invite->invite_role,
                    'status' => $this->getInviteStatus($invite),
                    'expires_at' => $invite->expires_at,
                    'accepted_at' => $invite->accepted_at,
                    'revoked_at' => $invite->revoked_at,
                    'created_at' => $invite->created_at,
                ]),
            ]);
        } catch (InvalidArgumentException $e) {
            return $this->error('INVITE_FORBIDDEN', 'Only company admins can view invites.', 403);
        }
    }

    /**
     * Revoke an invite
     *
     * DELETE /api/v1/company/invites/{inviteId}
     */
    public function destroy(Request $request, string $inviteId): JsonResponse
    {
        $user = $request->user();
        $company = $this->memberships->getPrimaryCompanyForUser($user->id);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found.', 403);
        }

        try {
            $invite = $this->invitations->revokeInvite($company->id, $user->id, $inviteId);

            return $this->success([
                'invite' => [
                    'id' => $invite->id,
                    'email' => $invite->email,
                    'revoked_at' => $invite->revoked_at,
                ],
            ], 'Invite revoked successfully.');
        } catch (InvalidArgumentException $e) {
            return match ($e->getMessage()) {
                'INVITE_FORBIDDEN' => $this->error('INVITE_FORBIDDEN', 'Only company admins can revoke invites.', 403),
                'INVITE_NOT_FOUND' => $this->error('INVITE_NOT_FOUND', 'Invite not found.', 404),
                'INVITE_ALREADY_ACCEPTED' => $this->error('INVITE_ALREADY_ACCEPTED', 'Cannot revoke an accepted invite.', 400),
                default => $this->error('REVOKE_FAILED', $e->getMessage(), 400),
            };
        }
    }

    /**
     * Validate an invite token (public endpoint for registration flow)
     *
     * POST /api/v1/company/invites/validate
     */
    public function validate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->error('VALIDATION_FAILED', $validator->errors()->first(), 422);
        }

        $invite = $this->invitations->resolvePendingInvite(
            $request->input('email'),
            $request->input('token')
        );

        if (! $invite) {
            return $this->error('INVITE_INVALID', 'Invalid or expired invite token.', 400);
        }

        return $this->success([
            'valid' => true,
            'company_name' => $invite->company->company_name ?? 'Unknown Company',
            'role' => $invite->invite_role,
            'expires_at' => $invite->expires_at,
        ]);
    }

    private function getInviteStatus($invite): string
    {
        if ($invite->accepted_at !== null) {
            return 'accepted';
        }

        if ($invite->revoked_at !== null) {
            return 'revoked';
        }

        if ($invite->expires_at < now()) {
            return 'expired';
        }

        return 'pending';
    }
}

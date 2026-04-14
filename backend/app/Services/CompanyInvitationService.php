<?php

namespace App\Services;

use App\Models\PostgreSQL\CompanyInvite;
use App\Models\PostgreSQL\CompanyMembership;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CompanyInvitationService
{
    public function __construct(
        private CompanyMembershipService $memberships,
        private CompanyEmailValidator $emailValidator,
    ) {}

    public function createInvite(
        string $companyId,
        string $inviterUserId,
        string $email,
        string $inviteRole
    ): array {
        if (! $this->memberships->isAdmin($companyId, $inviterUserId)) {
            throw new InvalidArgumentException('INVITE_FORBIDDEN');
        }

        if (! in_array($inviteRole, ['company_admin', 'hr'], true)) {
            throw new InvalidArgumentException('INVITE_ROLE_INVALID');
        }

        $normalizedEmail = $this->normalizeEmail($email);
        $domain = $this->emailValidator->extractDomain($normalizedEmail);

        if ($domain === '') {
            throw new InvalidArgumentException('INVITE_EMAIL_INVALID');
        }

        CompanyInvite::query()
            ->where('company_id', $companyId)
            ->where('email', $normalizedEmail)
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        $token = bin2hex(random_bytes(32));

        $invite = CompanyInvite::create([
            'company_id' => $companyId,
            'email' => $normalizedEmail,
            'email_domain' => $domain,
            'invite_role' => $inviteRole,
            'token_hash' => $this->hashToken($token),
            'invited_by_user_id' => $inviterUserId,
            'expires_at' => now()->addDays(7),
        ]);

        return [
            'invite' => $invite->fresh(),
            'token' => $token,
        ];
    }

    public function listInvites(string $companyId, string $requesterUserId): Collection
    {
        if (! $this->memberships->isAdmin($companyId, $requesterUserId)) {
            throw new InvalidArgumentException('INVITE_FORBIDDEN');
        }

        return CompanyInvite::query()
            ->where('company_id', $companyId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function revokeInvite(string $companyId, string $requesterUserId, string $inviteId): CompanyInvite
    {
        if (! $this->memberships->isAdmin($companyId, $requesterUserId)) {
            throw new InvalidArgumentException('INVITE_FORBIDDEN');
        }

        $invite = CompanyInvite::query()
            ->where('id', $inviteId)
            ->where('company_id', $companyId)
            ->first();

        if (! $invite) {
            throw new InvalidArgumentException('INVITE_NOT_FOUND');
        }

        if ($invite->accepted_at !== null) {
            throw new InvalidArgumentException('INVITE_ALREADY_ACCEPTED');
        }

        $invite->update(['revoked_at' => now()]);

        return $invite->fresh();
    }

    public function resolvePendingInvite(string $email, string $token): ?CompanyInvite
    {
        $normalizedEmail = $this->normalizeEmail($email);

        return CompanyInvite::query()
            ->where('email', $normalizedEmail)
            ->where('token_hash', $this->hashToken($token))
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    public function acceptInviteForUser(string $email, string $token, string $userId, string $userRole): CompanyInvite
    {
        return DB::transaction(function () use ($email, $token, $userId, $userRole) {
            $normalizedEmail = $this->normalizeEmail($email);

            $invite = CompanyInvite::query()
                ->where('email', $normalizedEmail)
                ->where('token_hash', $this->hashToken($token))
                ->whereNull('accepted_at')
                ->whereNull('revoked_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (! $invite) {
                throw new InvalidArgumentException('COMPANY_INVITE_REQUIRED');
            }

            if ($invite->invite_role !== $userRole) {
                throw new InvalidArgumentException('COMPANY_INVITE_ROLE_MISMATCH');
            }

            $membership = CompanyMembership::query()
                ->where('company_id', $invite->company_id)
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->first();

            if (! $membership) {
                $this->memberships->addMember(
                    companyId: (string) $invite->company_id,
                    userId: $userId,
                    role: (string) $invite->invite_role,
                    invitedByUserId: (string) $invite->invited_by_user_id,
                );
            }

            $invite->update(['accepted_at' => now()]);

            return $invite->fresh();
        });
    }

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', trim($token));
    }
}

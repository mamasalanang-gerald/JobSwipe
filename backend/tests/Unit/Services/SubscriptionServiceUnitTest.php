<?php

namespace Tests\Unit\Services;

use App\Exceptions\SubscriptionException;
use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\User;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use App\Services\SubscriptionService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SubscriptionServiceUnitTest extends TestCase
{
    public function test_create_checkout_session_rejects_non_company_user(): void
    {
        /** @var CompanyProfileRepository&MockObject $repo */
        $repo = $this->createMock(CompanyProfileRepository::class);
        $repo->expects($this->never())->method('findByUserId');

        $service = new SubscriptionService($repo);

        $user = new User;
        $user->role = 'applicant';
        $user->id = 'user-1';

        $this->expectException(SubscriptionException::class);
        $this->expectExceptionMessage('Only company users');

        $service->createCheckoutSession($user, 'https://app.test/success', 'https://app.test/cancel');
    }

    public function test_get_subscription_status_returns_expected_payload(): void
    {
        /** @var CompanyProfileRepository&MockObject $repo */
        $repo = $this->createMock(CompanyProfileRepository::class);

        $companyProfile = new CompanyProfile;
        $companyProfile->subscription_tier = 'basic';
        $companyProfile->subscription_status = 'active';

        $repo->expects($this->once())
            ->method('findByUserId')
            ->with('user-1')
            ->willReturn($companyProfile);

        $service = new SubscriptionService($repo);

        $user = new User;
        $user->id = 'user-1';
        $user->role = 'company_admin';

        $status = $service->getSubscriptionStatus($user);

        $this->assertSame('basic', $status['tier']);
        $this->assertSame('active', $status['status']);
        $this->assertTrue($status['can_post_jobs']);
    }

    public function test_can_post_jobs_returns_false_for_inactive_company(): void
    {
        /** @var CompanyProfileRepository&MockObject $repo */
        $repo = $this->createMock(CompanyProfileRepository::class);

        $companyProfile = new CompanyProfile;
        $companyProfile->subscription_status = 'inactive';

        $repo->expects($this->once())
            ->method('findByUserId')
            ->willReturn($companyProfile);

        $service = new SubscriptionService($repo);

        $user = new User;
        $user->id = 'user-1';

        $this->assertFalse($service->canPostJobs($user));
    }
}

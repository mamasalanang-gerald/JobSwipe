<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\Profile\ProfileController;
use App\Services\FileUploadService;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use InvalidArgumentException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class OnboardingControllerUnitTest extends TestCase
{
    public function test_complete_onboarding_step_advances_applicant_step(): void
    {
        /** @var ProfileService&MockObject $profileService */
        $profileService = $this->createMock(ProfileService::class);
        /** @var FileUploadService&MockObject $fileService */
        $fileService = $this->createMock(FileUploadService::class);

        $profileService->expects($this->once())
            ->method('completeOnboardingStep')
            ->with('user-1', 'applicant', 1, ['first_name' => 'Jane'])
            ->willReturn([
                'onboarding_step' => 2,
                'completed' => false,
                'total_steps' => 6,
            ]);

        $controller = new ProfileController($profileService, $fileService);

        $request = Request::create('/api/v1/profile/onboarding/complete-step', 'POST', [
            'step' => 1,
            'step_data' => ['first_name' => 'Jane'],
        ]);
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'applicant']);

        $response = $controller->completeOnboardingStep($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['success']);
        $this->assertSame(2, $payload['data']['onboarding_step']);
    }

    public function test_complete_onboarding_step_for_company_completion_flow(): void
    {
        /** @var ProfileService&MockObject $profileService */
        $profileService = $this->createMock(ProfileService::class);
        /** @var FileUploadService&MockObject $fileService */
        $fileService = $this->createMock(FileUploadService::class);

        $profileService->expects($this->once())
            ->method('completeOnboardingStep')
            ->with('company-1', 'company_admin', 4, ['verification_documents' => ['doc-1.pdf']])
            ->willReturn([
                'onboarding_step' => 'completed',
                'completed' => true,
                'total_steps' => 4,
            ]);

        $controller = new ProfileController($profileService, $fileService);

        $request = Request::create('/api/v1/profile/onboarding/complete-step', 'POST', [
            'step' => 4,
            'step_data' => ['verification_documents' => ['doc-1.pdf']],
        ]);
        $request->setUserResolver(static fn () => (object) ['id' => 'company-1', 'role' => 'company_admin']);

        $response = $controller->completeOnboardingStep($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['success']);
        $this->assertTrue($payload['data']['completed']);
        $this->assertSame('completed', $payload['data']['onboarding_step']);
    }

    public function test_complete_onboarding_step_maps_invalid_step_exception_to_api_error(): void
    {
        /** @var ProfileService&MockObject $profileService */
        $profileService = $this->createMock(ProfileService::class);
        /** @var FileUploadService&MockObject $fileService */
        $fileService = $this->createMock(FileUploadService::class);

        $profileService->expects($this->once())
            ->method('completeOnboardingStep')
            ->willThrowException(new InvalidArgumentException('INVALID_ONBOARDING_STEP'));

        $controller = new ProfileController($profileService, $fileService);

        $request = Request::create('/api/v1/profile/onboarding/complete-step', 'POST', [
            'step' => 9,
            'step_data' => [],
        ]);
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'applicant']);

        $response = $controller->completeOnboardingStep($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertFalse($payload['success']);
        $this->assertSame('INVALID_ONBOARDING_STEP', $payload['code']);
    }

    public function test_get_profile_completion_returns_consistent_payload(): void
    {
        /** @var ProfileService&MockObject $profileService */
        $profileService = $this->createMock(ProfileService::class);
        /** @var FileUploadService&MockObject $fileService */
        $fileService = $this->createMock(FileUploadService::class);

        $profileService->expects($this->once())
            ->method('getProfileCompletion')
            ->with('user-1', 'applicant')
            ->willReturn(73);

        $controller = new ProfileController($profileService, $fileService);

        $request = Request::create('/api/v1/profile/completion', 'GET');
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'applicant']);

        $response = $controller->getProfileCompletion($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['success']);
        $this->assertSame(73, $payload['data']['profile_completion_percentage']);
    }
}

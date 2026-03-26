<?php

namespace Tests\Unit\Controllers;

use App\Exceptions\SubscriptionException;
use App\Http\Controllers\Subscription\SubscriptionController;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SubscriptionControllerTest extends TestCase
{
    public function test_create_checkout_session_returns_url_and_id(): void
    {
        /** @var SubscriptionService&MockObject $service */
        $service = $this->createMock(SubscriptionService::class);

        $service->expects($this->once())
            ->method('createCheckoutSession')
            ->willReturn([
                'checkout_url' => 'https://checkout.stripe.com/session/test',
                'session_id' => 'cs_test_123',
            ]);

        $controller = new SubscriptionController($service);

        $request = Request::create('/api/v1/subscriptions/checkout', 'POST', [
            'success_url' => 'https://app.jobswipe.test/success',
            'cancel_url' => 'https://app.jobswipe.test/cancel',
        ]);
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'company_admin']);

        $response = $controller->createCheckoutSession($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['success']);
        $this->assertSame('cs_test_123', $payload['data']['session_id']);
    }

    public function test_subscription_status_endpoint_returns_expected_shape(): void
    {
        /** @var SubscriptionService&MockObject $service */
        $service = $this->createMock(SubscriptionService::class);

        $service->expects($this->once())
            ->method('getSubscriptionStatus')
            ->willReturn([
                'tier' => 'basic',
                'status' => 'active',
                'can_post_jobs' => true,
            ]);

        $controller = new SubscriptionController($service);

        $request = Request::create('/api/v1/subscriptions/status', 'GET');
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'company_admin']);

        $response = $controller->getSubscriptionStatus($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['success']);
        $this->assertSame('active', $payload['data']['status']);
    }

    public function test_cancel_subscription_endpoint_calls_service(): void
    {
        /** @var SubscriptionService&MockObject $service */
        $service = $this->createMock(SubscriptionService::class);

        $service->expects($this->once())
            ->method('deactivateSubscription');

        $controller = new SubscriptionController($service);

        $request = Request::create('/api/v1/subscriptions/cancel', 'POST');
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'company_admin']);

        $response = $controller->cancelSubscription($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['success']);
    }

    public function test_handle_webhook_returns_configuration_error_when_secret_is_missing(): void
    {
        /** @var SubscriptionService&MockObject $service */
        $service = $this->createMock(SubscriptionService::class);

        config()->set('cashier.webhook.secret', '');

        $controller = new SubscriptionController($service);
        $request = Request::create('/api/v1/webhooks/stripe', 'POST');

        $response = $controller->handleWebhook($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(500, $response->getStatusCode());
        $this->assertFalse($payload['success']);
        $this->assertSame('WEBHOOK_NOT_CONFIGURED', $payload['code']);
    }

    public function test_handle_webhook_rejects_invalid_signature(): void
    {
        /** @var SubscriptionService&MockObject $service */
        $service = $this->createMock(SubscriptionService::class);

        $service->expects($this->never())
            ->method('handleSubscriptionUpdated');

        config()->set('cashier.webhook.secret', 'whsec_test_secret');

        $controller = new SubscriptionController($service);

        $request = Request::create(
            '/api/v1/webhooks/stripe',
            'POST',
            [],
            [],
            [],
            ['HTTP_STRIPE_SIGNATURE' => 't=123,v1=invalid']
        );
        $request->headers->set('Stripe-Signature', 't=123,v1=invalid');
        $request->initialize([], [], [], [], [], [], '{"id":"evt_test","type":"checkout.session.completed"}');

        $response = $controller->handleWebhook($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertFalse($payload['success']);
        $this->assertSame('WEBHOOK_VERIFICATION_FAILED', $payload['code']);
    }

    public function test_create_checkout_session_bubbles_unauthorized_subscription_error(): void
    {
        /** @var SubscriptionService&MockObject $service */
        $service = $this->createMock(SubscriptionService::class);

        $service->expects($this->once())
            ->method('createCheckoutSession')
            ->willThrowException(new SubscriptionException(
                'UNAUTHORIZED',
                'Only company users can create subscriptions.',
                403
            ));

        $controller = new SubscriptionController($service);

        $request = Request::create('/api/v1/subscriptions/checkout', 'POST', [
            'success_url' => 'https://app.jobswipe.test/success',
            'cancel_url' => 'https://app.jobswipe.test/cancel',
        ]);
        $request->setUserResolver(static fn () => (object) ['id' => 'user-1', 'role' => 'applicant']);

        $this->expectException(SubscriptionException::class);
        $this->expectExceptionMessage('Only company users can create subscriptions.');

        $controller->createCheckoutSession($request);
    }
}

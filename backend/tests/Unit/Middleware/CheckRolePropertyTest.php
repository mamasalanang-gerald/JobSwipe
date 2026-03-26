<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\CheckRole;
use Illuminate\Http\Request;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;

class CheckRolePropertyTest extends TestCase
{
    public function test_property_unauthenticated_requests_are_rejected(): void
    {
        $middleware = new CheckRole;

        $request = Request::create('/api/v1/profile/applicant', 'GET');
        $request->setUserResolver(static fn () => null);

        $response = $middleware->handle(
            $request,
            static fn () => new JsonResponse(['ok' => true], 200),
            'applicant'
        );

        $payload = json_decode($response->getContent(), true);

        $this->assertSame(401, $response->getStatusCode());
        $this->assertFalse($payload['success']);
        $this->assertSame('UNAUTHENTICATED', $payload['code']);
    }

    public function test_property_role_mismatch_returns_403(): void
    {
        $middleware = new CheckRole;
        $allRoles = ['applicant', 'hr', 'company_admin', 'moderator', 'super_admin'];

        for ($i = 0; $i < 50; $i++) {
            $userRole = $allRoles[array_rand($allRoles)];
            $allowedRoles = $this->randomAllowedRolesWithout($allRoles, $userRole);

            $request = Request::create('/api/v1/company/jobs', 'GET');
            $request->setUserResolver(static fn () => (object) ['role' => $userRole]);

            $response = $middleware->handle(
                $request,
                static fn () => new JsonResponse(['ok' => true], 200),
                ...$allowedRoles
            );

            $payload = json_decode($response->getContent(), true);

            $this->assertSame(403, $response->getStatusCode());
            $this->assertFalse($payload['success']);
            $this->assertSame('UNAUTHORIZED', $payload['code']);
        }
    }

    public function test_property_authorized_roles_are_allowed(): void
    {
        $middleware = new CheckRole;

        $cases = [
            ['applicant', ['applicant']],
            ['hr', ['hr', 'company_admin']],
            ['company_admin', ['hr', 'company_admin']],
            ['moderator', ['moderator', 'super_admin']],
            ['super_admin', ['moderator', 'super_admin']],
        ];

        foreach ($cases as [$role, $allowedRoles]) {
            $request = Request::create('/api/v1/profile/completion', 'GET');
            $request->setUserResolver(static fn () => (object) ['role' => $role]);

            $response = $middleware->handle(
                $request,
                static fn () => new JsonResponse(['ok' => true], 200),
                ...$allowedRoles
            );

            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame(['ok' => true], json_decode($response->getContent(), true));
        }
    }

    private function randomAllowedRolesWithout(array $allRoles, string $excluded): array
    {
        $pool = array_values(array_filter(
            $allRoles,
            static fn (string $role): bool => $role !== $excluded
        ));

        shuffle($pool);
        $size = random_int(1, count($pool));

        return array_slice($pool, 0, $size);
    }
}

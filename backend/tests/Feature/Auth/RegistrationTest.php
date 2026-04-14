<?php

namespace Tests\Feature\Auth;

use App\Models\PostgreSQL\User;
use App\Services\OTPService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Stub the OTPService so no real emails/Redis calls happen during registration.
     */
    protected function mockOTPService(): void
    {
        $mock = Mockery::mock(OTPService::class);
        $mock->shouldReceive('sendOtp')->andReturnNull();
        $mock->shouldReceive('getStoredData')->andReturn(null);
        $this->app->instance(OTPService::class, $mock);
    }

    // ─── Happy Path ──────────────────────────────────────────────────────

    public function test_applicant_can_register_with_valid_data(): void
    {
        $this->mockOTPService();

        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'newuser@example.com',
            'password' => 'N3wUs3rR3g!str2024',
            'role' => 'applicant',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Verification code sent successfully',
                'data' => ['email' => 'newuser@example.com'],
            ]);
    }

    public function test_company_admin_can_register_with_new_domain(): void
    {
        $this->mockOTPService();

        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'admin@brand-new-domain.com',
            'password' => 'Adm!nR3g!str2024',
            'role' => 'company_admin',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Verification code sent successfully',
            ]);
    }

    // ─── Validation Errors ───────────────────────────────────────────────

    public function test_registration_fails_without_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password', 'role']);
    }

    public function test_registration_fails_with_invalid_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Inv@l!dR0l3T3st2024',
            'role' => 'superuser',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_registration_fails_with_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'password' => 'weak',
            'role' => 'applicant',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_registration_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'not-an-email',
            'password' => 'Inv@l!dEm@!lT3st2024',
            'role' => 'applicant',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ─── Business Logic Errors ───────────────────────────────────────────

    public function test_registration_rejects_duplicate_email(): void
    {
        $this->mockOTPService();

        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'taken@example.com',
            'password' => 'Dupl!c@t3T3st2024',
            'role' => 'applicant',
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'code' => 'EMAIL_TAKEN',
            ]);
    }

    public function test_hr_cannot_register_with_oauth_provider(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'hr@company.com',
            'password' => 'HrO@uthT3st2024',
            'role' => 'hr',
            'oauth_provider' => 'google',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'code' => 'OAUTH_NOT_PERMITTED',
            ]);
    }

    public function test_company_admin_oauth_is_also_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'admin@company.com',
            'password' => 'Adm!nO@uthT3st2024',
            'role' => 'company_admin',
            'oauth_provider' => 'google',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'OAUTH_NOT_PERMITTED']);
    }

    // ─── Response Structure ──────────────────────────────────────────────

    public function test_successful_registration_returns_correct_structure(): void
    {
        $this->mockOTPService();

        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'structure@example.com',
            'password' => 'Struct!r3T3st2024',
            'role' => 'applicant',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['email'],
                'message',
            ]);
    }
}

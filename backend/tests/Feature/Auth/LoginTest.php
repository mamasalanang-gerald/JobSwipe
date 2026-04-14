<?php

namespace Tests\Feature\Auth;

use App\Models\PostgreSQL\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    // ─── Happy Path ──────────────────────────────────────────────────────

    public function test_verified_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password_hash' => Hash::make('T3st!ngUs3r2024'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'T3st!ngUs3r2024',
        ]);

        $response->assertOk()
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => ['token', 'user'],
            ]);
    }

    public function test_login_returns_user_with_id_and_role(): void
    {
        User::factory()->hr()->create([
            'email' => 'hr@company.com',
            'password_hash' => Hash::make('HrT3st!ng2024'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'hr@company.com',
            'password' => 'HrT3st!ng2024',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.role', 'hr')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'email', 'role'],
                ],
            ]);
    }

    // ─── Authentication Failures ─────────────────────────────────────────

    public function test_wrong_password_returns_401(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password_hash' => Hash::make('C0rr3ctT3st!ng2024'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'Wr0ngT3st!ng2024',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'code' => 'INVALID_CREDENTIALS',
            ]);
    }

    public function test_nonexistent_email_returns_401(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'N0b0dyT3st!ng2024',
        ]);

        $response->assertStatus(401)
            ->assertJson(['code' => 'INVALID_CREDENTIALS']);
    }

    // ─── Account State Checks ────────────────────────────────────────────

    public function test_unverified_user_gets_403_and_otp_resent(): void
    {
        // Mock OTPService to prevent real email sending
        $otpMock = \Mockery::mock(\App\Services\OTPService::class);
        $otpMock->shouldReceive('sendOtp')->once();
        $this->app->instance(\App\Services\OTPService::class, $otpMock);

        User::factory()->unverified()->create([
            'email' => 'unverified@example.com',
            'password_hash' => Hash::make('Unv3r!f!3dT3st2024'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'unverified@example.com',
            'password' => 'Unv3r!f!3dT3st2024',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'EMAIL_UNVERIFIED',
            ]);
    }

    public function test_banned_user_gets_403(): void
    {
        User::factory()->banned()->create([
            'email' => 'banned@example.com',
            'password_hash' => Hash::make('B@nn3dUs3rT3st2024'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'banned@example.com',
            'password' => 'B@nn3dUs3rT3st2024',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'ACCOUNT_BANNED',
            ]);
    }

    // ─── Validation Errors ───────────────────────────────────────────────

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_requires_valid_email_format(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'not-email',
            'password' => 'anything',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ─── Rate Limiting ───────────────────────────────────────────────────

    public function test_login_is_rate_limited_after_5_attempts(): void
    {
        User::factory()->create([
            'email' => 'limited@example.com',
            'password_hash' => Hash::make('R@t3L!m!tT3st2024'),
        ]);

        // Make 5 failed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'limited@example.com',
                'password' => 'Wr0ngAttempt'.$i.'!2024',
            ]);
        }

        // 6th attempt should be rate limited
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'limited@example.com',
            'password' => 'F!nalWr0ngAttempt2024',
        ]);

        $response->assertStatus(429);
    }
}

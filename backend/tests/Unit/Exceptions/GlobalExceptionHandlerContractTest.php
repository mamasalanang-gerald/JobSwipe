<?php

namespace Tests\Unit\Exceptions;

use PHPUnit\Framework\TestCase;

class GlobalExceptionHandlerContractTest extends TestCase
{
    public function test_bootstrap_registers_required_json_exception_renderers(): void
    {
        $bootstrap = file_get_contents(base_path('bootstrap/app.php'));

        $this->assertStringContainsString('ValidationException', $bootstrap);
        $this->assertStringContainsString('VALIDATION_ERROR', $bootstrap);

        $this->assertStringContainsString('NotFoundHttpException', $bootstrap);
        $this->assertStringContainsString('NOT_FOUND', $bootstrap);

        $this->assertStringContainsString('ApiErrorException', $bootstrap);
        $this->assertStringContainsString('STRIPE_API_ERROR', $bootstrap);
    }
}

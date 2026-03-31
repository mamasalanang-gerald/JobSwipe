<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('stripe_checkout_idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('idempotency_key', 255)->unique();
            $table->string('request_fingerprint', 64);
            $table->string('session_id', 255)->nullable();
            $table->text('checkout_url')->nullable();
            $table->timestampTz('expires_at')->nullable();
            $table->timestampsTz();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->index(['user_id', 'created_at'], 'stripe_checkout_idemp_user_created_idx');
            $table->index(['expires_at'], 'stripe_checkout_idemp_expires_idx');
        });

        DB::statement('CREATE INDEX stripe_checkout_idemp_pending_idx ON stripe_checkout_idempotency_keys (idempotency_key) WHERE session_id IS NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS stripe_checkout_idemp_pending_idx');
        Schema::dropIfExists('stripe_checkout_idempotency_keys');
    }
};

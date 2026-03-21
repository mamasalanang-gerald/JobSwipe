<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->string('subscriber_type', 10);
            $table->string('tier', 10);
            $table->string('billing_cycle', 10);
            $table->decimal('amount_paid', 10, 2);
            $table->string('currency', 10)->default('PHP');
            $table->string('payment_provider', 15);
            $table->string('provider_sub_id', 255)->nullable();
            $table->string('status', 10);
            $table->timestampTz('current_period_start');
            $table->timestampTz('current_period_end');
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users');
        });

        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_subscriber_type_check
            CHECK (subscriber_type IN ('applicant', 'company'))
        ");

        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_tier_check
            CHECK (tier IN ('basic', 'pro'))
        ");

        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_billing_cycle_check
            CHECK (billing_cycle IN ('monthly', 'yearly'))
        ");

        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_payment_provider_check
            CHECK (payment_provider IN ('stripe', 'apple_iap', 'google_play'))
        ");

        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_status_check
            CHECK (status IN ('active', 'cancelled', 'past_due', 'expired'))
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

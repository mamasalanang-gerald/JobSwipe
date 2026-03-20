<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('applicant_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('user_id')->unique();
            $table->string('subscription_tier', 10)->default('free');
            $table->string('subscription_status', 15)->default('inactive');
            $table->integer('total_points')->default(0);
            $table->integer('daily_swipes_used')->default(0);
            $table->integer('daily_swipe_limit')->default(15);
            $table->integer('extra_swipe_balance')->default(0);
            $table->date('swipe_reset_at')->nullable();
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        DB::statement("ALTER TABLE applicant_profiles ADD CONSTRAINT applicant_profiles_subscription_tier_check CHECK (subscription_tier IN ('free', 'basic', 'pro'))");
        DB::statement("ALTER TABLE applicant_profiles ADD CONSTRAINT applicant_profiles_subscription_status_check CHECK (subscription_status IN ('active', 'inactive', 'cancelled'))");
        DB::statement('CREATE INDEX idx_applicant_profiles_queue ON applicant_profiles (subscription_tier, total_points DESC)');
        DB::statement("CREATE INDEX idx_applicant_profiles_active_sub ON applicant_profiles (subscription_status) WHERE subscription_status = 'active'");
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_profiles');
    }
};

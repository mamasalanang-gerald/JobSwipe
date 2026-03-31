<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->string('company_name', 255);
            $table->boolean('is_verified')->default(false);
            $table->string('verification_status', 15)->default('unverified');
            $table->string('subscription_tier', 10)->default('none');
            $table->string('subscription_status', 15)->default('inactive');
            $table->integer('active_listings_count')->default(0);
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_verification_status_check CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'))");
        DB::statement("ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_subscription_tier_check CHECK (subscription_tier IN ('none', 'basic', 'pro'))");
        DB::statement("ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_subscription_status_check CHECK (subscription_status IN ('active', 'inactive', 'cancelled'))");
        DB::statement('CREATE UNIQUE INDEX idx_company_profiles_user_id ON company_profiles(user_id)');
        DB::statement("CREATE INDEX idx_company_profiles_verification_status ON company_profiles(verification_status) WHERE verification_status = 'pending'");
        DB::statement('CREATE INDEX idx_company_profiles_is_verified ON company_profiles(is_verified)');
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};

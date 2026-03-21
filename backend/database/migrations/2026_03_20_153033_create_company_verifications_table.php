<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('company_id');
            $table->timestampTz('submitted_at')->default(DB::raw('NOW()'));
            $table->jsonb('documents')->default(DB::raw("'[]'::jsonb"));
            $table->uuid('reviewed_by')->nullable();
            $table->timestampTz('reviewed_at')->nullable();
            $table->string('status', 10)->default('pending');
            $table->text('rejection_reason')->nullable();

            $table->foreign('company_id')
                ->references('id')
                ->on('company_profiles');

            $table->foreign('reviewed_by')
                ->references('id')
                ->on('users');
        });

        DB::statement("
            ALTER TABLE company_verifications
            ADD CONSTRAINT company_verifications_status_check
            CHECK (status IN ('pending', 'approved', 'rejected'))
        ");

        DB::statement('CREATE INDEX idx_company_verifications_company_id ON company_verifications (company_id)');
        DB::statement("CREATE INDEX idx_company_verifications_pending ON company_verifications (status, submitted_at) WHERE status = 'pending'");
    }

    public function down(): void
    {
        Schema::dropIfExists('company_verifications');
    }
};

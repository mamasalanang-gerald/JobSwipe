<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('applicant_id');
            $table->uuid('job_posting_id');
            $table->string('status', 10)->default('applied');
            $table->text('invitation_message')->nullable();
            $table->timestampTz('invited_at')->nullable();
            $table->timestamps();

            $table->foreign('applicant_id')->references('id')->on('applicant_profiles');
            $table->foreign('job_posting_id')->references('id')->on('job_postings');

            $table->unique(['applicant_id', 'job_posting_id']);
        });

        DB::statement("ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('applied', 'invited', 'dismissed'))");
        DB::statement('CREATE INDEX idx_applications_job_posting_id ON applications(job_posting_id)');
        DB::statement('CREATE INDEX idx_applications_job_status ON applications(job_posting_id, status)');
        DB::statement('CREATE INDEX idx_applications_applicant_id ON applications(applicant_id, created_at DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};

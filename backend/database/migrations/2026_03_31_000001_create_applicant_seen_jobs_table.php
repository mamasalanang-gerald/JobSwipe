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
        Schema::create('applicant_seen_jobs', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('job_id');
            $table->timestampTz('seen_at')->useCurrent();
            $table->timestampsTz();

            $table->primary(['user_id', 'job_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        DB::statement('CREATE INDEX idx_applicant_seen_jobs_user_seen_at ON applicant_seen_jobs(user_id, seen_at DESC)');
        DB::statement('CREATE INDEX idx_applicant_seen_jobs_job_id ON applicant_seen_jobs(job_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_seen_jobs');
    }
};

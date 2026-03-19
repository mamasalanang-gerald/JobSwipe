<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('job_skills', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('job_posting_id');
            $table->string('skill_name', 100);
            $table->string('skill_type', 5);

            $table->foreign('job_posting_id')->references('id')->on('job_postings')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE job_skills ADD CONSTRAINT job_skills_skill_type_check CHECK (skill_type IN ('hard', 'soft'))");
        DB::statement('CREATE INDEX idx_job_skills_job_posting_id ON job_skills(job_posting_id)');
        DB::statement('CREATE INDEX idx_job_skills_skill_name ON job_skills(skill_name)');
    }

    public function down(): void
    {
        Schema::dropIfExists('job_skills');
    }
};

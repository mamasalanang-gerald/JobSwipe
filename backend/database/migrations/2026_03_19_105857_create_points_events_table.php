<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('points_events', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('applicant_id');
            $table->string('event_type', 50);
            $table->integer('points');
            $table->string('description', 255)->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestamps();

            $table->foreign('applicant_id')->references('id')->on('applicant_profiles');
        });

        DB::statement("ALTER TABLE points_events ADD CONSTRAINT points_events_event_type_check CHECK (event_type IN ('resume_uploaded', 'bio_added', 'profile_photo_uploaded', 'linkedin_linked', 'social_linked', 'skills_added', 'cover_letter_uploaded', 'portfolio_uploaded', 'subscribed_basic', 'subscribed_pro', 'bonus_pro'))");
        DB::statement('CREATE INDEX idx_points_events_applicant_id ON points_events(applicant_id, created_at DESC)');
        DB::statement("CREATE UNIQUE INDEX idx_points_events_type ON points_events(applicant_id, event_type) WHERE event_type NOT IN ('subscribed_basic', 'subscribed_pro', 'bonus_pro')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('points_events');
    }
};

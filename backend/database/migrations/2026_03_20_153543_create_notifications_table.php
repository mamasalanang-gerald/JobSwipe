<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('user_id');
            $table->string('type', 100);
            $table->string('title', 255);
            $table->text('body');
            $table->jsonb('data')->nullable();
            $table->timestampTz('read_at')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });

        DB::statement("
            CREATE INDEX idx_notifications_user_unread
            ON notifications (user_id, created_at DESC)
            WHERE read_at IS NULL
        ");

        DB::statement("
            CREATE INDEX idx_notifications_user_all
            ON notifications (user_id, created_at DESC)
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('email', 255)->unique();
            $table->string('password_hash', 255);
            $table->string('role', 20);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_banned')->default(false);
            $table->timestampTz('email_verified_at')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('applicant','hr','company_admin','moderator','super_admin'))");
        DB::statement('CREATE UNIQUE INDEX idx_users_email ON users(email);');
        DB::statement('CREATE INDEX idx_users_role ON users(role);');
        DB::statement('CREATE INDEX idx_users_is_banned ON users (is_banned) WHERE is_banned = TRUE');
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

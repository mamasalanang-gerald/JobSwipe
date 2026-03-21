<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swipe_packs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('applicant_id');
            $table->smallInteger('quantity');
            $table->decimal('amount_paid', 10, 2);
            $table->string('payment_provider', 15);
            $table->string('provider_payment_id', 255)->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));

            $table->foreign('applicant_id')
                ->references('id')
                ->on('applicant_profiles');
        });

        DB::statement('
            ALTER TABLE swipe_packs
            ADD CONSTRAINT swipe_packs_quantity_check
            CHECK (quantity IN (5, 10, 15))
        ');

        DB::statement("
            ALTER TABLE swipe_packs
            ADD CONSTRAINT swipe_packs_payment_provider_check
            CHECK (payment_provider IN ('stripe', 'apple_iap', 'google_play'))
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('swipe_packs');
    }
};

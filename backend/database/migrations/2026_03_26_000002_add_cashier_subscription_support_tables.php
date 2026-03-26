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
        Schema::table('subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('subscriptions', 'stripe_status')) {
                $table->string('stripe_status', 255)->nullable();
            }
        });

        DB::statement('CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions (user_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS subscriptions_stripe_status_idx ON subscriptions (stripe_status)');

        Schema::create('subscription_items', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('subscription_id');
            $table->string('stripe_id')->unique();
            $table->string('stripe_product');
            $table->string('stripe_price');
            $table->integer('quantity')->nullable();
            $table->timestampsTz();

            $table->foreign('subscription_id')
                ->references('id')
                ->on('subscriptions')
                ->cascadeOnDelete();

            $table->index('subscription_id', 'subscription_items_subscription_id_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_items');

        DB::statement('DROP INDEX IF EXISTS subscriptions_user_id_idx');
        DB::statement('DROP INDEX IF EXISTS subscriptions_stripe_status_idx');

        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'stripe_status')) {
                $table->dropColumn('stripe_status');
            }
        });
    }
};

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
            if (! Schema::hasColumn('subscriptions', 'subscription_type')) {
                $table->string('subscription_type', 15)->default('verification')->after('status');
            }

            if (! Schema::hasColumn('subscriptions', 'provider_status')) {
                $table->string('provider_status', 30)->nullable()->after('stripe_status');
            }

            if (! Schema::hasColumn('subscriptions', 'provider_transaction_id')) {
                $table->string('provider_transaction_id', 255)->nullable()->after('provider_sub_id');
            }

            if (! Schema::hasColumn('subscriptions', 'provider_receipt')) {
                $table->text('provider_receipt')->nullable()->after('provider_transaction_id');
            }

            if (! Schema::hasColumn('subscriptions', 'auto_renew_enabled')) {
                $table->boolean('auto_renew_enabled')->default(true)->after('provider_receipt');
            }
        });

        // Add subscription_type CHECK constraint
        DB::statement("
            DO $$ BEGIN
                ALTER TABLE subscriptions
                ADD CONSTRAINT subscriptions_subscription_type_check
                CHECK (subscription_type IN ('verification', 'subscription'));
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        ");

        // Drop old tier constraint and recreate with 'verified' option
        DB::statement('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check');
        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_tier_check
            CHECK (tier IN ('basic', 'pro'))
        ");

        // Indexes for common queries
        DB::statement('CREATE INDEX IF NOT EXISTS subscriptions_subscription_type_idx ON subscriptions (subscription_type)');
        DB::statement('CREATE INDEX IF NOT EXISTS subscriptions_provider_transaction_id_idx ON subscriptions (provider_transaction_id)');

        // Unique constraint: one active subscription per type per provider per user
        DB::statement("
            CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_type_provider_active_idx
            ON subscriptions (user_id, subscription_type, payment_provider)
            WHERE status = 'active'
        ");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS subscriptions_user_type_provider_active_idx');
        DB::statement('DROP INDEX IF EXISTS subscriptions_provider_transaction_id_idx');
        DB::statement('DROP INDEX IF EXISTS subscriptions_subscription_type_idx');

        DB::statement('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_subscription_type_check');

        Schema::table('subscriptions', function (Blueprint $table) {
            $columns = ['subscription_type', 'provider_status', 'provider_transaction_id', 'provider_receipt', 'auto_renew_enabled'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

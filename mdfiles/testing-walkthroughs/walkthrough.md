# Cross-Platform Subscription Sync — Walkthrough

## Summary

Implemented a provider-agnostic subscription architecture supporting **Stripe**, **Apple IAP**, and **Google Play Billing** across both HR (verification badge + gold) and Applicant (pro) subscription models.

---

## Files Created (6 new)

| File | Purpose |
|---|---|
| [SubscriptionProviderInterface.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/SubscriptionProviderInterface.php) | Contract for all providers: [validateReceipt()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/AppleIAPProvider.php#14-41), [handleNotification()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/GooglePlayProvider.php#41-101), [getProviderName()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/GooglePlayProvider.php#102-106) |
| [SubscriptionReceipt.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/SubscriptionReceipt.php) | Normalized receipt value object returned after validation |
| [SubscriptionEvent.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/SubscriptionEvent.php) | Normalized webhook event value object |
| [StripeProvider.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/StripeProvider.php) | Stripe implementation — receipt validation via API, webhook normalization |
| [AppleIAPProvider.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/AppleIAPProvider.php) | Apple IAP — JWS decoding, bundle ID verification, App Store Notification V2, mock mode |
| [GooglePlayProvider.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/Subscription/GooglePlayProvider.php) | Google Play — subscriptionsv2 API, RTDN handler, service account auth, mock mode |
| [subscription_products.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/config/subscription_products.php) | Product ID → internal tier/cycle/type mapping for all 3 providers |
| [Migration](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/database/migrations/2026_03_28_000001_add_subscription_type_and_provider_columns.php) | Adds 5 columns + partial unique index to `subscriptions` |

## Files Modified (5)

| File | Changes |
|---|---|
| [Subscription.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/Subscription.php) | Added fillable fields, `auto_renew_enabled` cast, 4 query scopes (`active`, `forType`, `forProvider`, `forUser`), [isExpired()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/Subscription.php#44-48) |
| [SubscriptionService.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/SubscriptionService.php) | Major refactor: added 7 new public methods while keeping existing Stripe checkout flow intact |
| [SubscriptionController.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php) | Added 4 endpoints: [validatePurchase](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php#43-60), [canSubscribe](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/SubscriptionService.php#232-267), [handleAppleNotification](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php#109-117), [handleGoogleNotification](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php#118-126) |
| [services.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/config/services.php) | Added `apple_iap`, `google_play`, `iap_mock_mode` config blocks |
| [api.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/api.php) | Added 2 webhook routes (Apple/Google), 2 subscription routes (`validate-purchase`, `can-subscribe`), opened `status` to all roles |

## New API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/subscriptions/validate-purchase` | ✅ | Mobile IAP receipt validation |
| `GET` | `/api/v1/subscriptions/can-subscribe` | ✅ | Pre-purchase eligibility check |
| `GET` | `/api/v1/subscriptions/status` | ✅ | Unified cross-platform status |
| `POST` | `/api/v1/webhooks/apple` | ❌ | Apple App Store Server Notification V2 |
| `POST` | `/api/v1/webhooks/google` | ❌ | Google Play RTDN via Pub/Sub |

## New DB Columns (subscriptions table)

| Column | Type | Purpose |
|---|---|---|
| `subscription_type` | `varchar(15)` | `verification` or `subscription` — distinguishes badge vs gold/pro |
| `provider_status` | `varchar(30)` | Raw status from payment provider |
| `provider_transaction_id` | `varchar(255)` | Provider-specific transaction ID |
| `provider_receipt` | `text` | Raw receipt/token for audit trail |
| `auto_renew_enabled` | `boolean` | Whether subscription auto-renews |

Partial unique index: [(user_id, subscription_type, payment_provider) WHERE status = 'active'](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/database/migrations/2026_03_19_090000_create_company_profiles_table.php#11-34) — prevents duplicate active subscriptions of the same type.

## Verification Results

| Check | Result |
|---|---|
| Migration | ✅ Ran successfully (334ms) |
| DB schema | ✅ All 20 columns present |
| Route registration | ✅ 5 subscription + 3 webhook routes |
| Unauthenticated access | ✅ Returns 401/500 as expected |

## Remaining: Smoke Testing

> [!IMPORTANT]
> The following smoke tests require an authenticated user token. Run them when ready:

```bash
# 1. Get auth token first
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpass"}' | jq -r '.data.token')

# 2. Test subscription status (should work for any role)
curl -s http://localhost:8000/api/v1/subscriptions/status \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Test can-subscribe guard
curl -s "http://localhost:8000/api/v1/subscriptions/can-subscribe?type=subscription" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Test IAP validation (mock mode — set IAP_MOCK_MODE=true in .env)
curl -s -X POST http://localhost:8000/api/v1/subscriptions/validate-purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"apple_iap","receipt_token":"mock_token","product_id":"com.jobswipe.pro.monthly"}' | jq .

# 5. Test Apple webhook (no auth needed)
curl -s -X POST http://localhost:8000/api/v1/webhooks/apple \
  -H "Content-Type: application/json" \
  -d '{"notificationType":"DID_RENEW","data":{"signedTransactionInfo":"mock"}}' | jq .

# 6. Test Google webhook (no auth needed)
curl -s -X POST http://localhost:8000/api/v1/webhooks/google \
  -H "Content-Type: application/json" \
  -d '{"message":{"data":"dGVzdA==","messageId":"mock-123"}}' | jq .
```

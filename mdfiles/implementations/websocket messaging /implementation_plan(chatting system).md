# Match System Implementation Walkthrough

## Summary

Implemented a complete **mutual-match system** with a 24-hour response window and real-time messaging via **Laravel Reverb** (WebSocket). The system transforms the existing "HR invites applicant" flow into a proper match lifecycle: HR swipes right → match created (pending) → applicant accepts/declines within 24h → chat opens indefinitely → HR can close chat.

> [!IMPORTANT]
> The original plan used `cboden/ratchet` for WebSockets, but it's **incompatible with Symfony 7** (required by Laravel 11). We pivoted to **Laravel Reverb** — the official first-party WebSocket server — which provides the same functionality with better integration.

---

## What Changed

### Architecture Decision: Ratchet → Laravel Reverb

| Aspect | Ratchet (planned) | Reverb (implemented) |
|---|---|---|
| Compatibility | ❌ Symfony 6 max | ✅ Laravel 11 native |
| Auth | Manual Sanctum token parsing | Native Sanctum + channel auth |
| Real-time protocol | Raw WebSocket messages | Pusher protocol (industry standard) |
| Broadcasting | Manual channel management | Laravel's event broadcasting system |
| Production readiness | DIY scaling | Built-in horizontal scaling |

---

### New Files (22 files)

#### Database Migrations
| File | Purpose |
|---|---|
| [2026_04_07_000001_create_matches_table.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/database/migrations/2026_04_07_000001_create_matches_table.php) | `matches` table with UUID PK, status CHECK, partial index for pending expiry |
| [2026_04_07_000002_create_match_messages_table.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/database/migrations/2026_04_07_000002_create_match_messages_table.php) | `match_messages` with cascade delete, unread partial index |
| [2026_04_07_000003_add_matched_status_to_applications.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/database/migrations/2026_04_07_000003_add_matched_status_to_applications.php) | Adds `'matched'` to applications status constraint |

#### Models & Repositories
| File | Purpose |
|---|---|
| [Match.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/Match.php) | `MatchRecord` model (renamed — `match` is PHP 8 reserved keyword) |
| [MatchMessage.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/MatchMessage.php) | Message model with manual timestamps |
| [MatchRepository.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Repositories/PostgreSQL/MatchRepository.php) | CRUD + prioritized listing + expiry queries |
| [MatchMessageRepository.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Repositories/PostgreSQL/MatchMessageRepository.php) | Message CRUD + read receipts |

#### Services & Jobs
| File | Purpose |
|---|---|
| [MatchService.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/MatchService.php) | Match lifecycle orchestration |
| [ExpireMatchesJob.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Jobs/ExpireMatchesJob.php) | Scheduled every 5m — expires pending matches past deadline |
| [MatchReminderJob.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Jobs/MatchReminderJob.php) | Scheduled every 15m — sends 6h and 1h reminders |

#### Controllers & Request
| File | Purpose |
|---|---|
| [Applicant/ApplicationController.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Applicant/ApplicationController.php) | Missing `applicant/applications` endpoint (§11.3) |
| [Applicant/MatchController.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Applicant/MatchController.php) | List, detail, accept, decline |
| [Company/MatchController.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Company/MatchController.php) | List, detail, close chat |
| [Match/MatchMessageController.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Match/MatchMessageController.php) | Messages: list, send, typing, read |
| [SendMatchMessageRequest.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Requests/Match/SendMatchMessageRequest.php) | Validates `body` (required, max 2000 chars) |

#### WebSocket / Events
| File | Purpose |
|---|---|
| [MatchChatHandler.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/WebSocket/MatchChatHandler.php) | Channel authorization logic |
| [MatchMessageSent.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Events/MatchMessageSent.php) | Broadcast event for new messages |
| [MatchTypingIndicator.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Events/MatchTypingIndicator.php) | Broadcast event for typing |
| [MatchReadReceipt.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Events/MatchReadReceipt.php) | Broadcast event for read receipts |
| [WebSocketServe.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Console/Commands/WebSocketServe.php) | Artisan wrapper for `reverb:start` |
| [channels.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/channels.php) | `match.{matchId}` private channel auth |

### Modified Files (7 files)

| File | Change |
|---|---|
| [ApplicantProfile.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/ApplicantProfile.php) | Added `matches()` HasMany relationship |
| [Application.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/Application.php) | Added `matchRecord()` HasOne relationship |
| [ApplicationRepository.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Repositories/PostgreSQL/ApplicationRepository.php) | Added `findByIdOrFail()` |
| [SwipeService.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php) | `hrSwipeRight` now creates match via MatchService |
| [api.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/api.php) | Added 13 new route definitions |
| [console.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/console.php) | Registered ExpireMatchesJob + MatchReminderJob |
| [composer.json](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/composer.json) | Added `laravel/reverb` dependency |

---

## API Endpoints Added (13 total)

### Applicant Applications (previously missing)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/applicant/applications` | List all applications |
| `GET` | `/v1/applicant/applications/{id}` | Application detail with match info |

### Applicant Matches
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/applicant/matches` | List matches (filterable by status) |
| `GET` | `/v1/applicant/matches/{id}` | Match detail with countdown timer |
| `POST` | `/v1/applicant/matches/{id}/accept` | Accept within 24h window |
| `POST` | `/v1/applicant/matches/{id}/decline` | Decline match |

### Company/HR Matches
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/company/matches` | List matches (filterable by job + status) |
| `GET` | `/v1/company/matches/{id}` | Match detail |
| `POST` | `/v1/company/matches/{id}/close` | Close chat (history preserved) |

### Match Messaging (shared)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/matches/{matchId}/messages` | Paginated message history |
| `POST` | `/v1/matches/{matchId}/messages` | Send message + broadcast via Reverb |
| `POST` | `/v1/matches/{matchId}/messages/typing` | Typing indicator broadcast |
| `PATCH` | `/v1/matches/{matchId}/messages/read` | Mark as read + broadcast receipt |

---

## Verification

- ✅ All routes compile (`php artisan route:list` — 11 match + 2 application routes)
- ✅ Laravel Reverb installed and configured
- ✅ Broadcasting config published
- ⏳ Migrations need to be run: `php artisan migrate`
- ⏳ Reverb env vars need to be set in `.env`:
  ```
  BROADCAST_CONNECTION=reverb
  REVERB_APP_ID=your-app-id
  REVERB_APP_KEY=your-app-key
  REVERB_APP_SECRET=your-app-secret
  REVERB_HOST=0.0.0.0
  REVERB_PORT=8080
  ```

## Next Steps

1. **Run migrations**: `docker compose exec laravel php artisan migrate`
2. **Configure `.env`** with Reverb credentials
3. **Start Reverb**: `docker compose exec laravel php artisan reverb:start`
4. **Test the match flow** end-to-end via API
5. **Frontend integration** using `laravel-echo` + `pusher-js` client libraries

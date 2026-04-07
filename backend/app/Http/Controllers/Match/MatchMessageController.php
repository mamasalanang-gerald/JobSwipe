<?php

namespace App\Http\Controllers\Match;

use App\Events\MatchMessageSent;
use App\Events\MatchReadReceipt;
use App\Events\MatchTypingIndicator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Match\SendMatchMessageRequest;
use App\Repositories\PostgreSQL\MatchMessageRepository;
use App\Repositories\PostgreSQL\MatchRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchMessageController extends Controller
{
    public function __construct(
        private MatchRepository $matches,
        private MatchMessageRepository $messages,
    ) {}

    /**
     * GET /v1/matches/{matchId}/messages
     *
     * List messages for a match. Both participants can access.
     */
    public function index(Request $request, string $matchId): JsonResponse
    {
        $user = $request->user();
        $match = $this->matches->findByIdOrFail($matchId);

        $this->assertParticipant($match, $user->id);

        $messages = $this->messages->getForMatch(
            matchId: $matchId,
            perPage: $this->resolvePerPage($request, 50),
        );

        return $this->success($messages, 'Messages retrieved.');
    }

    /**
     * POST /v1/matches/{matchId}/messages
     *
     * Send a message in a match chat.
     */
    public function store(SendMatchMessageRequest $request, string $matchId): JsonResponse
    {
        $user = $request->user();
        $match = $this->matches->findByIdOrFail($matchId);

        $this->assertParticipant($match, $user->id);

        // Only accepted (not closed) matches allow new messages
        if (! $match->isChatActive()) {
            return $this->error(
                'CHAT_NOT_ACTIVE',
                'This match chat is not active. It may be pending, closed, or expired.',
                422,
            );
        }

        $message = $this->messages->create(
            matchId: $matchId,
            senderId: $user->id,
            body: $request->validated('body'),
        );

        // Broadcast to WebSocket channel via Reverb
        broadcast(new MatchMessageSent($message))->toOthers();

        return $this->success($message, 'Message sent.', 201);
    }

    /**
     * POST /v1/matches/{matchId}/messages/typing
     *
     * Broadcast a typing indicator to other participants.
     */
    public function typing(Request $request, string $matchId): JsonResponse
    {
        $user = $request->user();
        $match = $this->matches->findByIdOrFail($matchId);

        $this->assertParticipant($match, $user->id);

        if ($match->isChatActive()) {
            broadcast(new MatchTypingIndicator($matchId, $user->id))->toOthers();
        }

        return $this->success(null, 'Typing indicator sent.');
    }

    /**
     * PATCH /v1/matches/{matchId}/messages/read
     *
     * Mark all messages as read for the authenticated user.
     */
    public function markAsRead(Request $request, string $matchId): JsonResponse
    {
        $user = $request->user();
        $match = $this->matches->findByIdOrFail($matchId);

        $this->assertParticipant($match, $user->id);

        $count = $this->messages->markAsRead($matchId, $user->id);

        // Broadcast read receipt to other participants via Reverb
        if ($count > 0) {
            broadcast(new MatchReadReceipt($matchId, $user->id, $count))->toOthers();
        }

        return $this->success(['marked_read' => $count], "{$count} messages marked as read.");
    }

    /**
     * Validate the authenticated user is a participant of the match.
     */
    private function assertParticipant($match, string $userId): void
    {
        $applicantUserId = $match->applicant->user_id;

        if ($userId !== $applicantUserId && $userId !== $match->hr_user_id) {
            abort(403, 'You are not a participant in this match.');
        }
    }

    private function resolvePerPage(Request $request, int $default = 50, int $max = 100): int
    {
        $perPage = (int) $request->input('per_page', $default);

        if ($perPage < 1) {
            return $default;
        }

        return min($perPage, $max);
    }
}

# Nexora Frontend

A React + TypeScript + Vite + Tailwind frontend for the Nexora backend, built directly
against the actual Spring Boot source (`nexoraio-feature-roadmap.zip`) — not assumptions,
and not the older README description, which understates what's already implemented.

## Setup

```bash
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL to your backend, e.g. http://localhost:8080
npm run dev
```

Build: `npm run build` (runs `tsc -b` then `vite build`).

## Scope decisions

- **In scope**: Auth, Goals, Roadmap, Progress, Conversations (AI chat) — the
  Goal → Roadmap → Progress → Conversation spine.
- **Deliberately out of scope**: Workspace / Project / Task. Those controllers exist in
  the backend but were flagged as an out-of-scope addition that conflicts with Nexora's
  goal-centric identity. Nothing in this frontend calls `/api/v1/workspaces/**` or
  `/api/v1/workspaces/{id}/projects/**`. If you decide to keep that module, its DTOs are
  straightforward to wire up the same way `goals.ts` is.
- The standalone `/api/ai/chat` endpoint is not used by the UI — conversations use the
  conversation-aware endpoint instead (see below).

## API contract this was built against

Extracted directly from the controllers/DTOs, not guessed:

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/auth/register` | Returns **plain text**, not JSON (201) |
| POST | `/api/v1/auth/login` | `{ accessToken, tokenType }` |
| GET | `/api/v1/auth/me` | `{ email, role, enabled }` |
| POST/GET/GET/PUT/DELETE | `/api/v1/goals[/{id}]` | Standard goal CRUD |
| POST | `/api/v1/goals/{goalId}/roadmap` | Generates via Gemini, persists, returns `RoadmapResponse` |
| GET | `/api/v1/goals/{goalId}/roadmap` | 404 if none generated yet |
| GET/POST | `/api/v1/goals/{goalId}/progress` | Progress entries |
| GET/POST | `/api/v1/goals/{goalId}/progress/tasks` | Completed roadmap tasks |
| GET | `/api/v1/goals/{goalId}/coach/daily` | Daily coach `ChatResponse` (not yet wired into UI — see below) |
| POST/GET/DELETE | `/api/v1/conversations[/{id}]` | |
| POST | `/api/v1/conversations/{id}/messages` | **Important**: saves the USER message, calls Gemini with full history, saves the ASSISTANT reply, and returns the **ASSISTANT** message — not the user one. The frontend adds the user bubble optimistically and appends the returned assistant message. |
| GET | `/api/v1/conversations/{id}/messages` | Ordered by `createdAt` |

All authenticated requests send `Authorization: <tokenType> <accessToken>` from the JWT
returned by login (see `src/api/client.ts`).

## Known backend gaps (not silently worked around)

Carried over from what's already known about this codebase, plus what I found:

1. **Conversation → Goal ownership isn't validated.** `POST /api/v1/conversations` accepts
   a `goalId` but the service doesn't verify the goal belongs to the caller. Not a frontend
   fix — flagging so it isn't missed.
2. **Goal context isn't injected into the AI prompt yet.** Even when a conversation is
   linked to a goal, the assistant's replies aren't currently personalized by that goal's
   details. The UI shows a "Linked to a goal" indicator so the connection is visible once
   the backend closes this gap — no frontend change will be needed then.
3. **Daily Coach has no UI yet.** `GET /api/v1/goals/{goalId}/coach/daily` exists and works,
   but there was no natural place to surface a single AI reply without more product
   direction on where it belongs (goal page banner? dashboard widget?) — flagging rather
   than guessing at a UX for it.
4. **Milestones/skills have no "mark complete" endpoint.** The roadmap UI displays
   `completed` as read-only. Progress is tracked separately via the progress-entry and
   progress-task endpoints, which are wired up on the Goal Detail page.

## Structure

```
src/
  api/        one file per backend domain, isolated from components
  types/      TypeScript types mirroring backend DTOs field-for-field
  context/    AuthContext (token persistence, session restore, 401 handling)
  components/ ui/ (primitives), layout/, goals/, roadmap/, conversation/
  pages/      one per route
  routes/     ProtectedRoute
```

## Design direction

Dark, developer/AI-oriented, restrained. The signature element is a routed "trace" line —
first shown on the landing page connecting Goal → Roadmap → Progress → Conversation, and
reused as the milestone rail on the Roadmap page — since Nexora's whole premise is that
those four things are actually connected, not four separate screens.

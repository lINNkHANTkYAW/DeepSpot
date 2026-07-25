# DeepSpot Implementation Plan

## Project Summary

DeepSpot is a React + Express prototype for a gamified deepfake-detection training platform. The current experience already includes:

- a landing experience and training feed
- challenge voting flows for Type A and Type B posts
- an upload wizard for community submissions
- leaderboard, profile, moderation, and notification views
- AI-generated forensic hints via the Gemini service

The main gap is that the product is still a prototype: data is stored in memory, authentication is demo-only, and uploads are not yet backed by persistent storage or production-grade media handling.

## What Exists Today

### Frontend
- React single-page experience in [src/App.tsx](src/App.tsx)
- Main feature views in [src/components](src/components)
- Feed experience in [src/components/feed/FeedView.tsx](src/components/feed/FeedView.tsx)
- Upload experience in [src/components/upload/UploadWizard.tsx](src/components/upload/UploadWizard.tsx)

### Backend
- Express API entrypoint in [src/server/app.ts](src/server/app.ts)
- Route modules in [src/server/routes](src/server/routes)
- In-memory store in [src/server/store/index.ts](src/server/store/index.ts)
- Seed data in [src/data/seedData.ts](src/data/seedData.ts)
- AI hint generation in [src/server/services/gemini.ts](src/server/services/gemini.ts)

### Current Constraints
- In-memory persistence resets on restart
- Demo user and demo notifications are hardcoded
- No true auth, database, or media storage pipeline
- No automated test suite yet

---

## Recommended Delivery Plan

### Phase 0 — Stabilize the foundation (1 week)
Goal: make the prototype easier to evolve without breaking current flows.

Tasks:
- Add a clear project architecture document and API contract conventions
- Introduce a consistent error-handling and validation layer for routes
- Standardize request/response shapes between frontend and backend
- Add a lightweight test setup for backend route behavior and frontend critical flows

Deliverables:
- stable API contracts
- baseline tests for voting, upload, and health endpoints
- improved error messages and validation

---

### Phase 1 — Replace in-memory storage with a real database (2–3 weeks)
Goal: make challenges, votes, users, badges, reports, and notifications persistent.

Tasks:
- Introduce PostgreSQL and a query layer such as Prisma or Drizzle
- Create schemas for users, posts, votes, badges, reports, and notifications
- Migrate the current seed data into database-backed initialization
- Update route handlers in [src/server/routes/posts.ts](src/server/routes/posts.ts), [src/server/routes/upload.ts](src/server/routes/upload.ts), and related modules to read/write from the database

Deliverables:
- persistent challenge feed
- persistent voting history and user stats
- leaderboard and moderation data that survive restarts

Acceptance criteria:
- A vote remains visible after server restart
- User stats and leaderboard ranking are computed from persisted data
- Moderation queue data is stored and retrievable

---

### Phase 2 — Real authentication and role-based access (1–2 weeks)
Goal: replace the demo-only user flow with a real account model.

Tasks:
- Implement sign-up, sign-in, and session management
- Protect authenticated routes and admin-only operations
- Associate posts, votes, reports, and notifications with real accounts
- Support moderator and admin roles from the database

Deliverables:
- login/signup experience
- protected profile and moderation workflows
- user-specific activity and notifications

Acceptance criteria:
- Users can register and log in securely
- Only moderators/admins can review flagged content
- Profile and leaderboard data are tied to the authenticated user

---

### Phase 3 — Media upload and storage pipeline (2 weeks)
Goal: support real file uploads instead of URL-only submissions.

Tasks:
- Add file upload handling to the backend
- Store media in object storage such as Azure Blob Storage, S3, or Cloudinary
- Generate public or signed URLs for viewing
- Add validation for file type, size, and abuse protection
- Update the upload wizard to show upload progress and success states

Deliverables:
- reliable file-based challenge uploads
- moderated media review workflow
- safer and more scalable media handling

Acceptance criteria:
- Users can upload image/video files successfully
- Files are stored outside the app container and remain accessible
- Failed uploads provide clear feedback

---

### Phase 4 — Moderation, safety, and community quality (1–2 weeks)
Goal: make the community experience safer and more trustworthy.

Tasks:
- Expand the moderation queue for submitted challenges
- Add approval/rejection actions for moderators
- Support report triage, action history, and admin notes
- Add content flags for spam, harmful media, and low-quality submissions

Deliverables:
- end-to-end moderation workflow
- visible report handling and moderation history
- stronger community trust signals

Acceptance criteria:
- Moderators can approve or reject pending uploads
- Reports are visible and trackable
- Low-quality or unsafe content can be removed quickly

---

### Phase 5 — Gameplay depth and retention features (1–2 weeks)
Goal: turn the current gamification layer into a deeper engagement system.

Tasks:
- Persist streak history and daily activity summaries
- Add richer badge progression and unlock notifications
- Improve leaderboard filters by time range and location
- Add challenge history and “my submissions” views

Deliverables:
- stronger progression loop
- more meaningful leaderboard and badge experiences
- user retention hooks

Acceptance criteria:
- Users can see their streak history and recent activity
- Badge unlocks are recorded and displayed properly
- Leaderboards update from real user activity

---

### Phase 6 — Quality, resilience, and observability (1 week)
Goal: prepare the platform for real-world use.

Tasks:
- Add rate limiting and abuse protection
- Improve logging, monitoring, and error alerts
- Add caching where appropriate for feed and leaderboard requests
- Add background tasks for moderation and notification processing

Deliverables:
- healthier production runtime
- better operational visibility
- lower risk of downtime or abuse

Acceptance criteria:
- Common failures are logged and surfaced
- The app degrades gracefully under load
- Moderation and notification jobs are resilient

---

### Phase 7 — Deployment and product hardening (1 week)
Goal: make the app launch-ready.

Tasks:
- Containerize the app for deployment
- Add CI/CD for frontend and backend builds
- Set environment-based configuration for secrets and services
- Add analytics, feature flags, and admin dashboards

Deliverables:
- production deployment pipeline
- environment-specific configuration
- launch-ready operational setup

Acceptance criteria:
- The app can be deployed to a cloud environment with confidence
- Secrets are managed outside the codebase
- Core user and admin journeys are observable in production

---

## Suggested Implementation Order

1. Database foundation and persistence
2. Authentication and authorization
3. Media storage and upload pipeline
4. Moderation workflow
5. Gamification polish and retention
6. Production hardening and deployment

This order reduces risk because the existing feature flows depend on a stable data model before the app can become production-ready.

## Recommended Tech Choices

- Database: PostgreSQL
- ORM: Prisma or Drizzle
- Auth: Better Auth, Clerk, or a similar managed solution
- File storage: Azure Blob Storage, S3, or Cloudinary
- Testing: Vitest for unit/integration tests and Playwright for UI validation
- Deployment: Docker + Azure App Service, Azure Container Apps, or a similar managed platform

## First Sprint Recommendation

If the next step is implementation, start with:

1. database schema design
2. persistence for posts, votes, and users
3. auth scaffolding for sign-in/sign-up
4. route migration from the in-memory store to the database

That sequence delivers the highest value with the lowest rework risk.

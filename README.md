# TaskFlow — SaaS-Level Full-Stack Productivity System

A production-ready, full-stack productivity application built with **React 19**, **NestJS 10**, and **PostgreSQL 16**. Goes far beyond a Kanban board — includes Habit Tracker, Pomodoro Focus Timer, GitHub-style Activity Heatmap, Productivity Score, Notebook, Sticky Notes, Smart Work, Task Calendar, Timeline with Notes, Global Search, In-App Notifications, Data Export (PDF/CSV/JSON), Contact System, and Dark Mode.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Available Scripts](#available-scripts)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [localStorage Keys](#localstorage-keys)
- [Deployment](#deployment)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8 | Build tool & dev server (rolldown bundler) |
| Tailwind CSS | 3.4 | Utility-first styling |
| Redux Toolkit | 2.x | Global state (auth, ui, notifications slices) |
| React Query (TanStack) | 5.x | Server state, caching & mutations |
| React Router | 7.x | Client-side routing |
| dnd-kit | 6.x | Drag-and-drop Kanban board |
| Axios | 1.x | HTTP client with auto token-refresh interceptor + queue |
| React Hook Form | 7.x | Form handling & validation |
| React Hot Toast | 2.x | Toast notifications |
| Lucide React | 0.5x | Icon library |
| recharts | 2.x | Charts — AreaChart, BarChart, PieChart, RadarChart |
| react-markdown + remark-gfm | — | Markdown preview in Notebook |
| date-fns | — | Date formatting utilities |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| NestJS | 10 | Node.js framework (modular, DI) |
| TypeScript | 5.x | Type safety |
| Prisma ORM | 5.x | Database access, migrations, seeding |
| PostgreSQL | 16 | Primary relational database |
| JWT + Passport | — | Access token (15min) + Refresh token (7d rotation) |
| bcryptjs | — | Password hashing (10 rounds) |
| Helmet | — | HTTP security headers |
| class-validator | 0.14 | Request body validation |
| Swagger (OpenAPI) | 7.x | Auto-generated API documentation |
| @nestjs/throttler | 5.x | Rate limiting (100 req / 60s) |
| cookie-parser | 1.4 | httpOnly refresh token cookie |
| nodemailer | — | Contact form email to p.ankita10101@gmail.com |

---

## Project Structure

```
task-management/
├── README.md
│
├── backend/                        ← NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma           ← 15 database models + enums
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts                 ← Entry point (Swagger, CORS, pipes, helmet)
│   │   ├── app.module.ts           ← Root module
│   │   ├── common/
│   │   │   ├── decorators/         ← @Public(), @CurrentUser()
│   │   │   ├── filters/            ← GlobalExceptionFilter
│   │   │   ├── guards/             ← JwtAuthGuard (global)
│   │   │   └── interceptors/       ← TransformInterceptor → { success, data, timestamp }
│   │   ├── config/
│   │   │   └── configuration.ts    ← Typed config
│   │   └── modules/
│   │       ├── auth/               ← Register, Login, Refresh, Logout, Me
│   │       ├── users/              ← Profile, Password, Search
│   │       ├── boards/             ← Board + Column CRUD
│   │       ├── tasks/              ← Task CRUD + Move + Assign
│   │       ├── comments/           ← Threaded comments on tasks
│   │       ├── activity/           ← Append-only audit log
│   │       ├── teams/              ← Team CRUD + Member roles
│   │       └── contact/            ← Public contact form → email notification
│   └── .env
│
└── frontend/                       ← React + Vite SPA
    └── src/
        ├── app/
        │   ├── store.ts            ← Redux store (auth + ui + notifications)
        │   ├── hooks.ts            ← useAppSelector, useAppDispatch
        │   └── router.tsx          ← All routes (public + private)
        ├── components/
        │   ├── kanban/             ← KanbanView, KanbanColumn, TaskCard, TaskDetailPanel (with subtasks)
        │   ├── layout/             ← AppLayout, Navbar (notification center), Sidebar (4 sections)
        │   ├── dashboard/          ← StatsCard, MyTasks, RecentActivity
        │   ├── ui/                 ← Button, Input, Modal, Select, Badge, Avatar
        │   └── shared/             ← PageLoader, GlobalSearch (⌘K), ActivityHeatmap
        ├── features/
        │   ├── auth/               ← authSlice, useAuth, LoginForm, RegisterForm
        │   ├── boards/             ← useBoards, BoardCard, CreateBoardModal
        │   ├── tasks/              ← useTasks, TaskForm, TaskFilters
        │   ├── comments/           ← useComments, CommentList
        │   ├── teams/              ← useTeams, MemberList, InviteModal
        │   ├── notifications/      ← notificationsSlice (Redux + localStorage)
        │   └── ui/                 ← uiSlice (sidebar, theme, modal)
        ├── lib/
        │   └── axios.ts            ← Axios + 401 → auto-refresh interceptor + request queue
        ├── pages/                  ← All page components (see Pages & Routes below)
        ├── routes/                 ← PrivateRoute, PublicRoute
        ├── services/api/           ← authApi, boardsApi, tasksApi, teamsApi, usersApi, contactApi
        ├── types/                  ← TypeScript interfaces
        └── utils/                  ← cn(), formatDate(), constants, QUERY_KEYS
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v18 or v20+ |
| PostgreSQL | v15 or v16 |
| Git | any |

### 1. Clone the repository

```bash
git clone https://github.com/AnKiTa2456/Task_Management_App_FullStack.git
cd task-management
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# PostgreSQL (encode @ in password as %40)
DATABASE_URL=postgresql://durgesh:Ankita%40123@localhost:5432/task_db

# JWT
JWT_SECRET=change_this_to_a_random_32_char_secret_before_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_this_to_a_different_random_32_char_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail App Password for contact form notifications)
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password_here
```

```bash
# Create database (first time only)
psql -U durgesh -d postgres -c "CREATE DATABASE task_db OWNER durgesh;"

# Run migrations
npx prisma migrate deploy

# Start with hot-reload
npm run start:dev
```

Backend: `http://localhost:3000`
Swagger: `http://localhost:3000/api/docs`

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_MOCK_AUTH=false
```

```bash
npm run dev
```

Frontend: `http://localhost:5173`

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 3000) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: `15m`) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (default: `7d`) |
| `SMTP_USER` | No | Gmail address for contact form emails |
| `SMTP_PASS` | No | Gmail App Password (16-char, spaces removed) |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL |
| `VITE_MOCK_AUTH` | No | `true` = run without backend |

---

## Database

| Property | Value |
|---|---|
| Database name | `task_db` |
| PostgreSQL user | `durgesh` |
| Password | `Ankita@123` |
| Host | `localhost:5432` |
| ORM | Prisma v5 |

### Tables (15)

| Table | Description |
|---|---|
| `users` | User accounts |
| `refresh_tokens` | JWT rotation (one-time use, per device) |
| `teams` | Workspace groups |
| `team_members` | User ↔ Team with Role |
| `boards` | Kanban boards |
| `columns` | Ordered stages within a board |
| `tasks` | Work items (title, status, priority, assignee, due date) |
| `task_watchers` | Users watching a task |
| `comments` | Threaded discussion on tasks |
| `task_attachments` | File metadata |
| `labels` | Board-scoped colour tags |
| `activities` | Append-only audit log |
| `notifications` | Per-user notification inbox |
| `_TaskLabels` | Implicit many-to-many (Task ↔ Label) |
| `_prisma_migrations` | Migration history |

### Enums

| Enum | Values |
|---|---|
| `TaskStatus` | `BACKLOG` `TODO` `IN_PROGRESS` `IN_REVIEW` `BLOCKED` `DONE` `CANCELLED` |
| `Priority` | `LOW` `MEDIUM` `HIGH` `URGENT` |
| `Role` | `OWNER` `ADMIN` `MEMBER` `VIEWER` |

### Access via psql

```bash
psql -U durgesh -d task_db
```

```sql
\pset pager off
\dt                      -- list tables
\d tasks                 -- show task columns

-- Useful queries
SELECT id, name, email, "createdAt" FROM users ORDER BY "createdAt" DESC;
SELECT title, status, priority FROM tasks WHERE status = 'IN_PROGRESS';
SELECT COUNT(*) FROM tasks WHERE status = 'DONE';
```

### Test Users (Seeded) — password: `Test@1234`

| # | Name | Email |
|---|---|---|
| 1 | Alice Johnson | alice@taskapp.com |
| 2 | Bob Smith | bob@taskapp.com |
| 3 | Carol White | carol@taskapp.com |
| 4 | David Brown | david@taskapp.com |
| 5 | Eva Martinez | eva@taskapp.com |
| 6–20 | ... | (see seed file) |

### Test Teams (Seeded)

| Team | Members |
|---|---|
| Frontend Team | Alice (OWNER), Bob (ADMIN), Carol, David |
| Backend Team | Eva (OWNER), Frank (ADMIN), Grace, Henry |
| Design Team | Iris (OWNER), James (ADMIN), Alice, Eva |

---

## API Reference

### Standard Response

```json
{ "success": true, "data": { ... }, "timestamp": "2024-..." }
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "...", "statusCode": 401 } }
```

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register → returns accessToken + sets refresh cookie |
| POST | `/auth/login` | Public | Login → returns accessToken + sets refresh cookie |
| POST | `/auth/refresh` | Public (cookie) | Rotate refresh token |
| POST | `/auth/logout` | Bearer | Logout all devices |
| GET | `/auth/me` | Bearer | Get current user |

### Boards — `/api/v1/boards`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/boards` | List all your boards |
| POST | `/boards` | Create board (auto-creates 4 columns) |
| GET | `/boards/:id` | Full board with columns + tasks |
| PATCH | `/boards/:id` | Update name/description |
| DELETE | `/boards/:id` | Delete board |
| POST | `/boards/:id/columns` | Add column |
| DELETE | `/boards/columns/:id` | Delete column |

### Tasks — `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/boards/:boardId/tasks` | Create task |
| GET | `/boards/:boardId/tasks` | List tasks (filter by status/priority/assignee/search) |
| GET | `/tasks/:id` | Task detail with comments |
| PATCH | `/tasks/:id` | Update task |
| PATCH | `/tasks/:id/move` | Move to column (drag-and-drop) |
| PATCH | `/tasks/:id/assign` | Assign/unassign user |
| DELETE | `/tasks/:id` | Delete task |

### Comments — `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks/:taskId/comments` | List comments |
| POST | `/tasks/:taskId/comments` | Add comment |
| PATCH | `/comments/:id` | Edit own comment |
| DELETE | `/comments/:id` | Delete own comment |

### Teams — `/api/v1/teams`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/teams` | List your teams |
| POST | `/teams` | Create team |
| GET | `/teams/:id` | Team with members |
| PATCH | `/teams/:id` | Update team |
| POST | `/teams/:id/members` | Invite user by email |
| PATCH | `/teams/:id/members/:userId` | Change member role |
| DELETE | `/teams/:id/members/:userId` | Remove member |

### Users — `/api/v1/users`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/search?q=alice` | Search users |
| GET | `/users/:id` | Get user profile |
| PATCH | `/users/profile` | Update name, bio, avatar |
| PATCH | `/users/password` | Change password |

### Contact — `/api/v1/contact`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/contact` | Public | Submit contact form → emails p.ankita10101@gmail.com |

### Error Codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Invalid body / missing fields |
| 401 | `UNAUTHORIZED` | No/expired token or wrong password |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Email already registered |
| 429 | `TOO_MANY_REQUESTS` | Rate limit (100 req/60s) |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected error |

Full interactive docs: `http://localhost:3000/api/docs`

---

## Available Scripts

### Backend

```bash
npm run start:dev          # Hot-reload dev server
npm run start:prod         # Production
npm run build              # Compile TypeScript → dist/
npm run lint               # ESLint
npx prisma studio          # Visual DB browser
npx prisma migrate dev     # New migration
npx prisma migrate deploy  # Apply migrations
npx prisma generate        # Regenerate Prisma Client
```

### Frontend

```bash
npm run dev          # Dev server → http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint
```

---

## Features

### Authentication & Security
- Register & Login with email + password
- JWT access tokens (15min) stored in Redux
- Refresh token rotation (7-day httpOnly cookie) — auto-refreshed by Axios interceptor
- Token refresh queue — concurrent requests wait for new token instead of all failing
- `resetInterceptorState()` + `queryClient.clear()` on logout (prevents stale data)
- Forgot Password flow — 4-step: email → 6-digit OTP boxes → new password → success
- Password hashing with bcrypt (10 rounds)
- Global `JwtAuthGuard` — use `@Public()` to bypass
- Rate limiting: 100 req / 60s, Helmet security headers, CORS locked to `FRONTEND_URL`

### Kanban Board
- Drag-and-drop tasks between columns (dnd-kit)
- Full task CRUD with priority, status, due date, assignee
- Task detail side panel with subtasks (add/toggle/delete with progress bar)
- Priority colour-coding: Low → Medium → High → Urgent
- Overdue detection (red due date badge)
- Add/remove custom columns

### Dashboard
- Live stats: total tasks, in-progress, overdue count, completion rate
- 7-day task completion area chart
- Priority breakdown donut chart
- Tasks-per-column bar chart
- Today's habits checklist with progress
- Activity Heatmap (GitHub-style, 17 weeks, task + habit data)
- Quick-nav cards to Sticky Notes, Notebook, Smart Work, Habits

### Notifications (In-App)
- Redux-persisted notification center in the navbar
- Per-category icons: task / habit / system / comment / deadline
- Unread badge count with mark-read / mark-all-read / delete / clear-all
- Dispatched automatically by: Pomodoro timer, habit completion, task creation

### Global Search (⌘K / Ctrl+K)
- Command palette overlay from any page
- Searches across: boards, tasks, sticky notes, notebook pages, habits
- Keyboard navigation: ↑↓ arrows, Enter to navigate, Esc to close
- Quick-action grid when query is empty

### Habit Tracker
- Add habits with emoji, name, and colour
- 7-day tracker grid — check off each day
- Animated SVG progress ring (colour shifts grey → amber → brand → green)
- Live counters: Done / Left / Best Streak
- Weekly bar chart (today highlighted in brand colour)
- Monthly 4-week completion % bar chart
- Streak counter per habit with fire emoji

### Pomodoro Focus Timer
- Work / Short Break / Long Break phases
- SVG ring progress animation with phase-specific colours
- Config modal: adjust all durations and long-break interval
- Session history stored to localStorage (last 100)
- Task selector — link a session to an open task
- Stats: sessions today, minutes focused, cycles until long break
- Dispatches in-app notifications on phase completion

### Productivity Score
- Overall 0–100 score with animated SVG ring
- 5 dimensions: Task Completion, Habit Consistency, Focus Sessions, Note-taking, Smart Planning
- Radar chart across all dimensions
- 7-day activity trend area chart
- Colour-coded bar breakdown chart
- Activity heatmap (tasks + habits + Pomodoro)
- Overdue penalty warning
- Refresh button re-reads all localStorage data instantly

### Timeline
- All board tasks grouped by Today / Yesterday / older dates (collapsible)
- Notes & Updates section at the top with full CRUD:
  - Add note with optional title and free-text content
  - Click to expand and read full note
  - Inline edit mode (pencil icon) with Save / Cancel
  - Delete with trash icon
  - Stored in `taskflow_timeline_notes` localStorage

### Task Calendar
- Monthly grid with task due-date dots
- Custom events with colour selection and optional time
- Add event form inline on selected day detail panel
- Events stored in `taskflow_calendar_events` localStorage

### Smart Work
- Work items with priority, time estimate, status cycling
- Live completion progress bar (colour shifts by %)
- 4-cell stat breakdown: Total / To Do / In Progress / Done
- Star/pin items, filter by status
- Stored in `taskflow_smart_work` localStorage

### Sticky Notes
- 6 colour options, pin to top, inline edit, delete
- Auto-save on every change
- Stored in `taskflow_sticky_notes` localStorage

### Notebook
- Two-pane: page list sidebar + editor
- Edit / Preview toggle (react-markdown + remark-gfm)
- Autosave with 800ms debounce and indicator
- Word count + character count
- Stored in `taskflow_notebook` localStorage

### Data Export
- Select any combination: Tasks, Sticky Notes, Habits, Smart Work, Notebook
- Export as **JSON** (full nested data) or **CSV** (spreadsheet compatible)
- **PDF Export** — opens a styled HTML report in a new browser tab:
  - Purple brand header with export timestamp
  - Each dataset as a clean alternating-row table with coloured headers
  - Print → Save as PDF gives a professional report
  - `@media print` styles for correct page breaks

### Contact Page (Public)
- 3-step flow: form → 6-digit OTP phone verification → success
- "Reach me directly" info cards with live links:
  - Phone: +91 9998889998
  - Email: p.ankita10101@gmail.com
  - GitHub: [AnKiTa2456](https://github.com/AnKiTa2456)
  - LinkedIn: [Ankita Patel](https://www.linkedin.com/in/ankita-patel-859508220)
- Submission saved to localStorage + POSTed to backend (sends email via Gmail SMTP)

### Contact Submissions (Admin)
- Two-pane: list + detail view
- Search by name/email/message
- Private admin notes per contact (editable inline)
- Delete submissions

### Account Info
- Profile card with avatar, name, email, bio
- Account details table
- Activity stats: boards, total tasks, completed tasks
- Quick-action links: Edit Profile, Change Password, Notifications

### Forgot Password
- 4-step flow: email → 6-digit OTP boxes (auto-focus, keyboard navigation) → new password → success
- Show/hide password toggle, password match validation

### Dark Mode
- Light / Dark / System (follows OS `prefers-color-scheme`)
- Persisted to Redux + localStorage
- Entire app — every page, chart, and component supports dark mode

### Collapsible Sidebar
- 4 collapsible `NavSection` groups: Main / Productivity / Notes / Account
- Collapses to icon-only mode at 64px width
- Avatar, name, email in footer with logout button

---

## Pages & Routes

### Public routes (no auth required)
| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Email + password login |
| `/register` | RegisterPage | New account registration |
| `/forgot-password` | ForgotPasswordPage | 4-step password reset with OTP |
| `/contact` | ContactPage | Contact form with OTP verification + social links |

### Private routes (requires login)
| Route | Page | Description |
|---|---|---|
| `/dashboard` | DashboardPage | Stats, charts, heatmap, habits, quick-nav |
| `/boards` | KanbanPage | Board list + Kanban view |
| `/board/:boardId` | KanbanPage | Specific board |
| `/team` | TeamPage | Teams, members, invites |
| `/settings` | SettingsPage | Theme, notifications, profile |
| `/account` | AccountInfoPage | Profile card + activity stats |
| `/timeline` | TimelinePage | Tasks by date + Notes CRUD |
| `/calendar` | CalendarPage | Monthly calendar + custom events |
| `/sticky-notes` | StickyNotesPage | Colour sticky notes |
| `/notebook` | NotebookPage | Markdown notebook with autosave |
| `/habits` | HabitTrackerPage | Habit grid + charts + live ring |
| `/smart-work` | SmartWorkPage | Smart work items + live progress |
| `/pomodoro` | PomodoroPage | Focus timer with SVG ring |
| `/productivity` | ProductivityScorePage | Multi-dimension score + heatmap |
| `/contacts` | ContactSubmissionsPage | Admin view of contact submissions |
| `/export` | DataExportPage | JSON / CSV / PDF export |

---

## localStorage Keys

| Key | Used By | Contents |
|---|---|---|
| `taskflow_habits` | HabitTrackerPage | Habit definitions + completion logs |
| `taskflow_sticky_notes` | StickyNotesPage | Note objects (content, colour, pinned) |
| `taskflow_notebook` | NotebookPage | Page objects (title, content, timestamps) |
| `taskflow_smart_work` | SmartWorkPage | Work items with status + estimates |
| `taskflow_calendar_events` | CalendarPage | Custom calendar events |
| `taskflow_timeline_notes` | TimelinePage | Quick notes & updates |
| `taskflow_pomodoro_sessions` | PomodoroPage | Completed session history (max 100) |
| `taskflow_pomodoro_config` | PomodoroPage | Timer durations config |
| `taskflow_notifications` | notificationsSlice | In-app notification inbox (max 50) |
| `taskflow_contact_submissions` | ContactSubmissionsPage | Contact form submissions |
| `taskflow_subtasks_<taskId>` | TaskDetailPanel | Subtasks per task |

---

## Deployment

| Service | Recommended Platform |
|---|---|
| Frontend | Vercel (auto-deploy from `main`) |
| Backend | Railway / Render / AWS EC2 |
| Database | Supabase / Railway PostgreSQL / AWS RDS |

### Deploy Frontend to Vercel

Set environment variable in Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
```

### Deploy Backend

```bash
npm run build
NODE_ENV=production node dist/main.js
```

Setting `NODE_ENV=production` disables Swagger and enables HTTPS-only cookies.

### Gmail SMTP Setup (for contact form emails)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate a 16-character App Password
4. Add to `backend/.env`:
   ```
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   ```
   (remove spaces from the app password)

---

## Mock Mode (No Backend Required)

```env
# frontend/.env
VITE_MOCK_AUTH=true
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Log in with **any email + any password** (6+ chars). All localStorage features (habits, notes, pomodoro, smart work, etc.) work fully in mock mode.

---

## Author

**Ankita Patel**

- GitHub: [@AnKiTa2456](https://github.com/AnKiTa2456)
- LinkedIn: [Ankita Patel](https://www.linkedin.com/in/ankita-patel-859508220)
- Email: p.ankita10101@gmail.com
- Phone: +91 9998889998

---

## License

This project is licensed under the MIT License.

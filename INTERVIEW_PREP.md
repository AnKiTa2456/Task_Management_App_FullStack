# Task Management Project — Complete Interview Prep Guide

> **Project Type:** Full-Stack SaaS Task Management App (like Trello / Jira)
> **Level:** Beginner-friendly explanation + Interview Q&A
> **Stack:** React + NestJS + PostgreSQL + Prisma + JWT

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [How The App Works (Flow)](#how-the-app-works)
5. [Database Design](#database-design)
6. [Authentication Flow](#authentication-flow)
7. [API Endpoints](#api-endpoints)
8. [Deployment](#deployment)
9. [React Hooks Used](#react-hooks-used)
10. [How Timers Work](#how-timers-work)
11. [Interview Questions & Answers](#interview-questions--answers)
    - [General / Project Overview](#a-general--project-overview)
    - [React & Frontend](#b-react--frontend)
    - [NestJS & Backend](#c-nestjs--backend)
    - [Database & Prisma](#d-database--prisma)
    - [Authentication & Security](#e-authentication--security)
    - [API Design](#f-api-design)
    - [Architecture & Patterns](#g-architecture--patterns)
    - [Deployment](#h-deployment)
    - [Advanced Concepts](#i-advanced-concepts)
    - [Situational / Problem Solving](#j-situational--problem-solving)
    - [Hooks Interview Questions](#k-hooks-interview-questions)
    - [Timer Interview Questions](#l-timer-interview-questions)
12. [Quick Cheat Sheet](#quick-cheat-sheet)

---

## Project Overview

Think of this project like a **restaurant**:

| Analogy | Reality |
|---|---|
| Dining area (what customers see) | Frontend — React app on Vercel |
| Kitchen (where food is prepared) | Backend — NestJS API on Render |
| Pantry (where ingredients are stored) | Database — PostgreSQL |
| Waiter (takes order, brings food) | Axios HTTP client |

**Core Features:**
- Kanban boards with drag-and-drop task management
- Team collaboration with role-based access (Owner, Admin, Member, Viewer)
- JWT authentication with automatic token refresh
- Activity tracking and audit log
- Pomodoro timer, Habit tracker, Calendar, Timeline, Sticky Notes, Notebook
- Productivity score and Smart Work recommendations
- Contact form with email notifications
- Data export (PDF / CSV / JSON)

---

## Technologies Used

### Frontend

| Technology | What it is | Why it's used |
|---|---|---|
| **React 19** | UI library | Build reusable components for every button, card, form |
| **TypeScript** | JavaScript with types | Prevents bugs by ensuring data has the right shape |
| **Vite** | Build tool | Compiles code fast for development and production |
| **Redux Toolkit** | Global state manager | Stores auth state, tasks, boards — accessible from any component |
| **React Router v7** | Client-side routing | Controls which page shows based on the URL |
| **Axios** | HTTP client | Makes API calls to the backend with automatic token injection |
| **Tailwind CSS** | Utility-first CSS | Style components with classes like `bg-blue-500 p-4 rounded` |
| **React Hook Form** | Form library | Handles login/register forms with validation |
| **TanStack Query** | Data fetching | Caches API responses, handles loading/error states |
| **dnd-kit** | Drag & Drop | Drag task cards between Kanban columns |
| **Recharts** | Chart library | Productivity graphs and activity heatmap |
| **Lucide React** | Icon library | All icons (home, bell, trash, etc.) |
| **date-fns** | Date utility | Formats dates like "March 16, 2026" |
| **react-hot-toast** | Notifications | "Task created!" popup messages |

### Backend

| Technology | What it is | Why it's used |
|---|---|---|
| **NestJS** | Node.js framework | Structured backend with Modules, Controllers, Services |
| **TypeScript** | JavaScript with types | Same reason as frontend — type safety |
| **Prisma ORM** | Database toolkit | Talk to PostgreSQL using TypeScript instead of raw SQL |
| **PostgreSQL** | Relational database | Stores all users, tasks, boards, comments permanently |
| **JWT** | Auth tokens | Digital "ID card" — proves you're logged in |
| **Passport.js** | Auth middleware | Validates JWT tokens automatically |
| **bcryptjs** | Password hashing | Scrambles passwords — can never be reversed |
| **Helmet** | Security headers | Protects against common browser attacks |
| **@nestjs/throttler** | Rate limiting | Prevents bots from spamming 100+ requests/second |
| **Nodemailer** | Email library | Sends email when contact form is submitted |
| **Swagger** | API docs | Auto-generates interactive API documentation at `/api/docs` |
| **Zod** | Schema validation | Validates incoming request data shape |

### Deployment

| Technology | Purpose |
|---|---|
| **Vercel** | Hosts the frontend (React app) |
| **Render** | Hosts the backend (NestJS API) |
| **render.yaml** | Infrastructure config — tells Render how to build and start the app |
| **vercel.json** | Tells Vercel to redirect all URLs to `index.html` (SPA routing fix) |

---

## Project Structure

```
task-management/               ← Root (monorepo)
├── frontend/                  ← React app
│   └── src/
│       ├── pages/             ← Page components (DashboardPage, KanbanPage…)
│       ├── components/        ← Reusable UI components
│       │   ├── ui/            ← Button, Input, Modal, Badge, Avatar…
│       │   ├── layout/        ← AppLayout, Navbar, Sidebar
│       │   ├── kanban/        ← KanbanColumn, TaskCard, TaskDetailPanel
│       │   └── shared/        ← GlobalSearch, ActivityHeatmap, ErrorBoundary…
│       ├── features/          ← Feature modules (auth, boards, tasks, teams…)
│       │   ├── auth/          ← authSlice, LoginForm, RegisterForm, useAuth
│       │   ├── boards/        ← boardsSlice, BoardCard, CreateBoardModal
│       │   ├── tasks/         ← tasksSlice, TaskForm, TaskFilters
│       │   └── teams/         ← teamsSlice, InviteModal, MemberList
│       ├── services/api/      ← API call functions (auth.api.ts, tasks.api.ts…)
│       ├── app/               ← Redux store, React Router config
│       ├── hooks/             ← Custom hooks (useDebounce, useLocalStorage…)
│       ├── lib/               ← Axios instance with interceptors
│       ├── types/             ← TypeScript type definitions
│       └── utils/             ← Helper functions (formatDate, cn, constants)
│
├── backend/                   ← NestJS API
│   └── src/
│       ├── main.ts            ← App entry point (bootstrap)
│       ├── app.module.ts      ← Root module
│       ├── common/            ← Shared utilities
│       │   ├── guards/        ← JwtAuthGuard, RolesGuard
│       │   ├── decorators/    ← @Public(), @Roles(), @CurrentUser()
│       │   ├── filters/       ← GlobalExceptionFilter
│       │   ├── interceptors/  ← TransformInterceptor, LoggingInterceptor
│       │   └── pipes/         ← ZodValidationPipe
│       ├── prisma/            ← PrismaService (database connection)
│       └── modules/           ← Feature modules
│           ├── auth/          ← AuthController, AuthService, JwtStrategy
│           ├── users/         ← UsersController, UsersService
│           ├── boards/        ← BoardsController, BoardsService
│           ├── tasks/         ← TasksController, TasksService
│           ├── comments/      ← CommentsController, CommentsService
│           ├── teams/         ← TeamsController, TeamsService
│           ├── activity/      ← ActivityController, ActivityService
│           └── contact/       ← ContactController, ContactService
│
├── backend/prisma/
│   └── schema.prisma          ← Database schema (13 models)
│
├── render.yaml                ← Backend deployment config
└── README.md
```

---

## How The App Works

### Simple Flow Diagram

```
User opens browser
    ↓
React loads (Vercel) → React Router checks URL
    ↓
Private route? → Check Redux authSlice for token
    ↓ (not logged in)
Redirect to /login
    ↓
User submits login form (React Hook Form)
    ↓
Axios sends POST /api/v1/auth/login → NestJS Backend (Render)
    ↓
AuthController → AuthService → Prisma → PostgreSQL
    ↓
bcrypt.compare(password, hashedPassword) ✓
    ↓
JWT Access Token (15 min) + Refresh Token (7 days) created
    ↓
Access token → response body → stored in Redux + localStorage
Refresh token → httpOnly cookie (browser stores automatically)
    ↓
All future requests → Axios interceptor adds "Authorization: Bearer <token>"
    ↓
NestJS JwtAuthGuard validates token on every request
    ↓
User sees Dashboard, Boards, Tasks ✓
```

### Token Refresh Flow (Automatic — User Never Notices)

```
Access token expires (after 15 min)
    ↓
Any API call returns 401 Unauthorized
    ↓
Axios response interceptor catches 401
    ↓
Calls POST /api/v1/auth/refresh (cookie sent automatically)
    ↓
Backend validates refresh token from cookie + checks DB
    ↓
New access token issued → Redux state updated
    ↓
Original failed request retried with new token ✓
```

---

## Database Design

### 13 Database Models (Tables)

```
User
├── id, email, name, passwordHash, avatarUrl, bio, timezone
├── isActive, isEmailVerified, lastLoginAt
└── → RefreshToken[], TeamMember[], Board[], Task[], Comment[], Notification[]

Team
├── id, name, slug (unique), description, isPersonal
└── → TeamMember[], Board[]

TeamMember
├── id, role (OWNER / ADMIN / MEMBER / VIEWER), joinedAt
└── → User, Team  [unique: userId + teamId]

Board
├── id, name, description, background, isPrivate, isArchived
└── → Column[], Label[], Activity[], owner (User), team (Team)

Column
├── id, name, position, color, taskLimit (WIP limit), isDefault
└── → Task[]

Task
├── id, title, description, status, priority, position
├── dueDate, startDate, completedAt, storyPoints
├── deletedAt (soft delete)
└── → Comment[], Label[], Activity[], Watcher[], column, creator, assignee

Comment
├── id, content, isEdited, deletedAt, parentId (for threading)
└── → Task, author (User), parent (Comment)

Label
├── id, name, color (hex)
└── → Board, Tasks[] (many-to-many)

Activity
├── id, type (30+ event types), metadata (JSON), createdAt
└── → User, Task?, Board?  [append-only audit log]

Notification
├── id, title, body, status (UNREAD / READ / ARCHIVED), readAt, actionUrl
└── → User

RefreshToken
├── id, token, deviceInfo, ipAddress, expiresAt
└── → User

TaskWatcher       → User ↔ Task (many-to-many)
TaskAttachment    → files attached to tasks (S3-ready)
```

### Enums

| Enum | Values |
|---|---|
| **TaskStatus** | BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE, CANCELLED |
| **Priority** | LOW, MEDIUM, HIGH, URGENT |
| **Role** | OWNER, ADMIN, MEMBER, VIEWER |
| **NotificationStatus** | UNREAD, READ, ARCHIVED |
| **AttachmentType** | IMAGE, DOCUMENT, SPREADSHEET, VIDEO, ARCHIVE, OTHER |

---

## Authentication Flow

### Step-by-Step Login

```
1. POST /api/v1/auth/login  { email, password }
2. Find user by email in DB
3. bcrypt.compare(password, user.passwordHash)  →  must return true
4. Check user.isActive === true
5. Create Access Token  →  JWT, contains userId, expires in 15 min
6. Create Refresh Token  →  JWT, expires in 7 days, stored in DB
7. Set httpOnly cookie with refresh token
8. Return  { accessToken, user }  to frontend
9. Frontend stores accessToken in Redux + localStorage
```

### Security Features

| Feature | Purpose |
|---|---|
| **bcryptjs (12 rounds)** | Password hashing — irreversible |
| **httpOnly cookies** | Refresh token safe from XSS |
| **Secure flag (prod)** | Cookie only sent over HTTPS |
| **One-time refresh tokens** | Each refresh deletes old token from DB |
| **Short access token (15m)** | Stolen tokens expire quickly |
| **Same error for bad email/password** | Prevents email enumeration attacks |
| **Rate limiting (100 req/60s)** | Stops brute-force login attempts |
| **Helmet headers** | Protects against common browser attacks |
| **CORS whitelist** | Only frontend domain can call the API |

---

## API Endpoints

**Base URL:** `https://task-management-app-fullstack.onrender.com/api/v1`

### Authentication
```
POST   /auth/register          Register new user
POST   /auth/login             Login
POST   /auth/refresh           Refresh access token (cookie)
POST   /auth/logout            Logout (clears all refresh tokens)
GET    /auth/me                Get current user profile
```

### Users
```
GET    /users/search?q=query   Search users by name/email
GET    /users/:id              Get user profile
PATCH  /users/profile          Update profile
PATCH  /users/password         Change password
```

### Boards
```
GET    /boards                 List all boards
GET    /boards/:id             Get board with columns and tasks
POST   /boards                 Create board
PATCH  /boards/:id             Update board
DELETE /boards/:id             Delete board
POST   /boards/:id/columns     Add column
DELETE /boards/columns/:id     Delete column
```

### Tasks
```
GET    /boards/:boardId/tasks  List tasks (with filters: status, priority, assignee)
GET    /tasks/:id              Get task detail
POST   /boards/:boardId/tasks  Create task
PATCH  /tasks/:id              Update task
PATCH  /tasks/:id/move         Move task to column/position (drag & drop)
PATCH  /tasks/:id/assign       Assign/unassign user
DELETE /tasks/:id              Soft-delete task
```

### Comments
```
GET    /tasks/:taskId/comments List comments
POST   /tasks/:taskId/comments Add comment
PATCH  /comments/:id           Edit comment
DELETE /comments/:id           Delete comment
```

### Teams
```
GET    /teams                  List user's teams
GET    /teams/:id              Get team details
POST   /teams                  Create team
PATCH  /teams/:id              Update team
POST   /teams/:id/members      Invite member by email
PATCH  /teams/:id/members/:userId   Update member role
DELETE /teams/:id/members/:userId   Remove member
```

### Other
```
GET    /boards/:boardId/activity   Board activity feed
GET    /tasks/:taskId/activity     Task activity timeline
POST   /contact                    Submit contact form (public)
GET    /health                     Health check (public)
```

---

## Deployment

### Frontend → Vercel

- React app is built with `npm run build` → outputs to `dist/`
- `vercel.json` rewrites all URLs to `index.html` so React Router handles routing
- Environment variable: `VITE_API_BASE_URL` = backend URL

### Backend → Render

- `render.yaml` defines:
  - Root directory: `backend/`
  - Build: `npm install && npm run build`
  - Start: `npm run start:prod`
- Environment variables set manually on Render dashboard:
  - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`
- Free tier has cold starts → frontend pings `/health` on load to wake server
- Axios timeout set to 60 seconds to handle cold start delay

---

## Interview Questions & Answers

---

### A. General / Project Overview

---

**Q: Can you tell me about this project?**

This is a full-stack SaaS task management application similar to Trello or Jira. It has a React 19 frontend deployed on Vercel and a NestJS backend on Render, connected to a PostgreSQL database using Prisma ORM. Key features include Kanban boards with drag-and-drop, team collaboration with roles, JWT auth with token rotation, activity tracking, and productivity tools like Pomodoro and Habit Tracker.

---

**Q: What is a SaaS application?**

SaaS = Software as a Service. Users access it through a browser — no installation needed. Gmail, Notion, Trello are all SaaS. This project qualifies because users sign up, log in, and use all features entirely from a browser.

---

**Q: Why did you choose React for the frontend?**

React is component-based — you build small reusable pieces (Button, Card, Modal) and combine them into full pages. It's the most widely used frontend library with a huge ecosystem, great TypeScript support, and excellent performance with virtual DOM diffing.

---

**Q: Why did you choose NestJS over Express?**

Express is minimal but unstructured — code gets messy at scale. NestJS enforces a Module → Controller → Service architecture (inspired by Angular). It has built-in TypeScript support, dependency injection, guards, interceptors, and pipes — everything needed for a production app without reinventing the wheel. Think of Express as a blank notebook and NestJS as a notebook with labeled sections.

---

### B. React & Frontend

---

**Q: What is a React component?**

A component is a reusable piece of UI. For example, `Button.tsx` is a component. Instead of copy-pasting button HTML everywhere, you write `<Button>Click me</Button>` and it renders the same styled button everywhere. This project has components in `ui/`, `layout/`, `kanban/`, and `shared/` folders.

---

**Q: What is the difference between props and state?**

- **Props** = data passed INTO a component from its parent. Like function arguments. Read-only.
- **State** = data the component manages itself. When state changes, the component re-renders.

Example: A `TaskCard` receives `task` as a prop. A `Modal` manages its own `isOpen` state.

---

**Q: What is Redux and why is it used here?**

Redux is a global state manager. Without it, you'd pass data through many component levels (prop drilling). With Redux, any component reads global data directly.

Example: When you log in, your user data is in Redux `authSlice`. The Navbar, Sidebar, and Dashboard all need to know who you are — they all read from Redux without props being passed down.

---

**Q: What is Redux Toolkit and how is it different from plain Redux?**

Redux Toolkit (RTK) is the official, simpler way to write Redux. Plain Redux required separate action types, action creators, and reducers. RTK combines them into **slices** using `createSlice()` — much less boilerplate code.

---

**Q: What is React Router and how does routing work here?**

React Router controls which page to show based on the URL. This project uses v7 with `PrivateRoute` (requires login) and `PublicRoute` (redirects if already logged in).

```
/login          → LoginPage (public)
/dashboard      → DashboardPage (private)
/board/:boardId → KanbanPage (private)
*               → NotFoundPage (404)
```

---

**Q: What is the difference between `useEffect` and `useState`?**

- `useState` stores a value and triggers re-render when it changes
- `useEffect` runs code when something changes (on mount, on dependency change)

```javascript
const [tasks, setTasks] = useState([])          // state
useEffect(() => {
  fetchTasks().then(data => setTasks(data))      // runs when component mounts
}, [])
```

---

**Q: What is a custom hook?**

A custom hook is a reusable function that uses React hooks inside and starts with `use`. Instead of copy-pasting `useEffect + useState + dispatch` logic in 5 components, you put it in `useTasks()` and call it anywhere.

Examples: `useAuth`, `useTasks`, `useBoards`, `useTeams`, `useDebounce`

---

**Q: What is Axios and what are interceptors?**

Axios is a library for HTTP requests (cleaner than `fetch`).

**Interceptors** are middleware for Axios — they run before every request or after every response.

- **Request interceptor** → Automatically adds `Authorization: Bearer <token>` to every request
- **Response interceptor** → On 401 error: calls `/auth/refresh`, gets new token, retries original request. User never notices the token expired.

---

**Q: What is Tailwind CSS?**

A CSS framework where you style with utility classes directly in JSX.

Instead of writing a separate CSS file:
```css
.button { background: blue; padding: 10px; border-radius: 4px; }
```

You write:
```html
<button class="bg-blue-500 p-2 rounded">Click</button>
```

Faster to write, styles stay next to the component.

---

**Q: What is dnd-kit and how is drag-and-drop implemented?**

dnd-kit is a modern drag-and-drop library for React. In the Kanban board:
- Each column is a **droppable** area
- Each task card is a **draggable** item
- When a card is dropped in a new column → `PATCH /tasks/:id/move` API updates `columnId` and `position` in the database

---

### C. NestJS & Backend

---

**Q: What is NestJS architecture?**

NestJS uses a layered modular architecture:

| Layer | Role |
|---|---|
| **Module** | Groups related code (AuthModule, TasksModule) |
| **Controller** | Handles HTTP requests → calls service → returns response |
| **Service** | Business logic → validates → calls database |
| **Guard** | Security checkpoint — checks if user is authenticated |
| **Interceptor** | Transforms request/response globally |
| **Pipe** | Validates and transforms input data |

Analogy: Controller = receptionist, Service = manager, Guard = security guard, Prisma = database operator.

---

**Q: What is a DTO?**

DTO = Data Transfer Object. Defines the shape of data coming into the API.

```typescript
class CreateTaskDto {
  title: string
  priority: 'LOW' | 'HIGH' | 'URGENT'
  dueDate?: Date
}
```

NestJS validates incoming request body against the DTO. If someone sends `priority: "SUPER_URGENT"`, it rejects the request automatically.

---

**Q: What is a Guard in NestJS?**

A Guard decides whether a request should proceed or be blocked.

- **JwtAuthGuard** → Validates JWT token in the header. Applied globally. Routes with `@Public()` decorator are exempt.
- **RolesGuard** → Checks if user has required role (OWNER, ADMIN, etc.)

It's like a bouncer — no valid ID (token) = no entry.

---

**Q: What is Dependency Injection?**

A design pattern where a class receives its dependencies from outside instead of creating them itself. NestJS does this automatically via the constructor.

```typescript
// NestJS injects PrismaService automatically
constructor(private prisma: PrismaService) {}
```

Benefits: easier to test, easier to swap implementations.

---

**Q: What is rate limiting and why is it important?**

Rate limiting restricts how many requests a client can make in a time window. This project allows **100 requests per 60 seconds**.

Without it, a bot could try 10,000 password guesses/second. With it, they get `429 Too Many Requests` after 100 attempts.

---

**Q: What is Swagger?**

Swagger (OpenAPI) auto-generates interactive API documentation. By adding decorators to controllers, NestJS generates a UI at `/api/docs` where developers can see all endpoints and test them from the browser. Very useful for frontend/backend collaboration.

---

### D. Database & Prisma

---

**Q: What is an ORM and what is Prisma?**

ORM = Object Relational Mapping. Lets you interact with the database using your programming language instead of raw SQL.

Without Prisma:
```sql
SELECT * FROM tasks WHERE column_id = '123' AND deleted_at IS NULL;
```

With Prisma:
```typescript
prisma.task.findMany({ where: { columnId: '123', deletedAt: null } })
```

Cleaner, type-safe, and database-agnostic.

---

**Q: What is PostgreSQL and why is it used?**

PostgreSQL is a powerful, open-source relational database. Data is organized in tables with relationships.

Why PostgreSQL here:
- Strong relational data (tasks belong to columns, columns to boards)
- ACID transactions (data is never corrupted mid-operation)
- Excellent for complex filtered queries
- Free and production-battle-tested

---

**Q: What is a soft delete? Why use it?**

- **Hard delete** → permanently removes the row. Gone forever.
- **Soft delete** → sets `deletedAt` timestamp. Row stays in DB but filtered out in queries.

This project uses soft delete for Tasks and Comments. Benefits:
- Restore accidentally deleted items
- Preserve activity history
- Keep audit trail intact

Query always includes: `WHERE deleted_at IS NULL`

---

**Q: What are database indexes and why do they matter?**

An index is like a book's index page — makes searching fast. Without it, the database scans every row one by one (slow). With an index on `assigneeId`, it jumps directly to matching rows.

This project has composite indexes like `(columnId, position)` because tasks are always fetched by column and ordered by position.

---

**Q: What is a many-to-many relationship? Give an example.**

When multiple records from Table A relate to multiple records in Table B.

Example from this project: A **Task** can have multiple **Labels** (bug, frontend, urgent). A **Label** can be on multiple **Tasks**. This is many-to-many.

In the database, a join table `_TaskToLabel(taskId, labelId)` stores all the connections.

---

### E. Authentication & Security

---

**Q: What is JWT?**

JWT = JSON Web Token. A digitally signed string that proves your identity.

```
header.payload.signature
```

- **Header** → Algorithm (HS256)
- **Payload** → Your userId, email, expiry (readable but not secret)
- **Signature** → Server signs with a secret key — cannot be faked

When you log in, the server gives you a token. You send it with every request. The server verifies the signature to confirm it's genuine.

---

**Q: What is the difference between Access Token and Refresh Token?**

| | Access Token | Refresh Token |
|---|---|---|
| **Expiry** | 15 minutes | 7 days |
| **Stored in** | Redux + localStorage | httpOnly cookie + database |
| **Used for** | Every API request | Getting a new access token |
| **If stolen** | Useless after 15 min | Protected by httpOnly cookie |

---

**Q: What is an httpOnly cookie and why is it more secure?**

A regular cookie can be read by JavaScript (`document.cookie`). If there's an XSS vulnerability, a hacker can steal it.

An **httpOnly** cookie **cannot** be read by JavaScript at all — only the browser sends it automatically with requests. The refresh token is in an httpOnly cookie so even an XSS attack can't steal it.

---

**Q: What is password hashing? What is bcrypt?**

Never store passwords as plain text. If the database is hacked, all passwords are exposed.

**Hashing** converts `"mypassword123"` → `"$2b$12$xjK9sL..."` (scrambled, irreversible).

**bcrypt** uses 12 salt rounds — the more rounds, the longer it takes to brute-force.

On login: `bcrypt.compare(typedPassword, hashedInDB)` → returns `true` or `false`.

---

**Q: What is CORS and why is it needed?**

CORS = Cross-Origin Resource Sharing. Browsers block requests between different origins by default for security.

Frontend is on `vercel.app`, backend is on `onrender.com` — different origins. The backend must say: "I allow requests from `vercel.app`". Without this, every API call would be blocked by the browser.

---

**Q: What is XSS? How is this project protected?**

XSS = Cross-Site Scripting. Attacker injects malicious JavaScript into your site (e.g., in a comment).

Protection in this project:
- **Helmet** adds Content-Security-Policy headers
- **httpOnly cookies** prevent JavaScript from reading refresh tokens
- **Input validation** with Zod/class-validator prevents storing malicious HTML

---

### F. API Design

---

**Q: What is a REST API?**

REST = Representational State Transfer. API design using HTTP methods:

| HTTP Method | Action | Example |
|---|---|---|
| GET | Read data | GET /tasks |
| POST | Create data | POST /tasks |
| PATCH | Partially update | PATCH /tasks/:id |
| PUT | Fully replace | PUT /tasks/:id |
| DELETE | Remove | DELETE /tasks/:id |

The URL is a resource, the HTTP method is the action.

---

**Q: What does the API response format look like here?**

All responses use a standard format via `TransformInterceptor`:

```json
// Success
{
  "success": true,
  "data": { "id": "123", "title": "Fix login bug" }
}

// Error
{
  "success": false,
  "message": "Task not found",
  "statusCode": 404
}
```

This consistency makes frontend error handling much simpler.

---

**Q: What is API versioning? Why `/api/v1/`?**

The `/v1` means "version 1". If you change the API in a breaking way (remove a field, change behavior), you create `/v2`. Old clients still work on `/v1` while new ones use `/v2`. Best practice for backward compatibility.

---

### G. Architecture & Patterns

---

**Q: What is the Service Layer pattern?**

- **Controller** → Handles HTTP: receive request, call service, return response. No business logic.
- **Service** → Contains business logic: validate, transform, call database.
- **Prisma** → Handles the actual database operations.

This separation means if you switch databases tomorrow, only the Service changes. The Controller doesn't care.

---

**Q: What is a monorepo? Is this project a monorepo?**

A monorepo keeps multiple projects in a single repository. Yes, this project is a monorepo:

```
task-management/
├── frontend/
└── backend/
```

Benefit: Single `git clone`, easier to coordinate frontend + backend changes together.

---

**Q: What is the purpose of environment variables?**

They store configuration that changes between environments or contains secrets.

- `DATABASE_URL` → different in dev vs production
- `JWT_SECRET` → secret key, should NEVER be in code or GitHub
- `VITE_API_BASE_URL` → `localhost:3000` in dev, Render URL in production

Stored in `.env` files which are in `.gitignore`.

---

### H. Deployment

---

**Q: What is Vercel and how is the frontend deployed?**

Vercel hosts frontend apps. Connect your GitHub repo → every git push auto-rebuilds and redeploys.

The `vercel.json` has a critical SPA rule:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Without this, refreshing `/dashboard` would give a 404 — Vercel would look for `dashboard.html` which doesn't exist. The rewrite sends everything to `index.html` and React Router handles the rest.

---

**Q: What is Render and how is the backend deployed?**

Render is a cloud platform for backend services. The `render.yaml` config defines:
- Root directory: `backend/`
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

Render's free tier sleeps after inactivity (cold start). This project handles it by:
- Frontend pings `/health` on app load to wake the server
- Axios timeout set to 60 seconds to wait for cold start

---

**Q: What is a health check endpoint?**

`GET /api/v1/health` returns `{ status: "ok" }`. Used by:
- Monitoring tools to verify the server is running
- Load balancers to route traffic only to healthy instances
- This project's frontend to wake up the Render server on cold start

---

### I. Advanced Concepts

---

**Q: What is the Kanban methodology?**

Kanban is a visual project management method from Toyota. Tasks move through stages as columns:

```
Backlog → Todo → In Progress → In Review → Done
```

Moving a card right = progress. The entire team sees the work status at a glance. WIP (Work In Progress) limits can prevent bottlenecks — this is why Column has a `taskLimit` field.

---

**Q: What is WebSocket? Does this project use it?**

WebSocket is a persistent, two-way connection. Unlike HTTP (request → response), WebSocket allows the server to push data to the browser instantly.

This project does **NOT** use WebSockets. If a teammate moves a task, you'd need to refresh to see it. Adding real-time updates with Socket.io would be a great enhancement — worth mentioning in interviews!

---

**Q: What is React Query and why use it alongside Redux?**

| | React Query (TanStack) | Redux Toolkit |
|---|---|---|
| **For** | Server state (API data) | Client state (UI state) |
| **Examples** | tasks list, board data, users | who is logged in, sidebar open/closed |
| **Benefits** | Auto caching, background refetch, loading/error states | Predictable global state, DevTools |

They serve different purposes — using both together is the modern best practice.

---

**Q: What is TypeScript? Why use it instead of JavaScript?**

TypeScript adds static types to JavaScript.

```typescript
interface Task {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'   // only these values allowed
}
```

If you write `task.tittle` (typo), TypeScript gives a compile error **before** the code runs. In plain JavaScript, you'd only find this bug at runtime — maybe in production.

---

### J. Situational / Problem Solving

---

**Q: A user says their task disappeared. How would you debug it?**

1. Check if it's soft-deleted — task may have `deletedAt` set (all queries filter `WHERE deletedAt IS NULL`)
2. Check the Activity log — every event is recorded (who deleted it, when)
3. Check browser Network tab — did the delete API get called accidentally?
4. Check Render backend logs — was there an unhandled exception?
5. If soft-deleted unintentionally → restore by setting `deletedAt = null`

---

**Q: How would you add email notifications when a task is assigned?**

1. In `TasksService.assignTask()`, after updating the assignee:
2. Get the assignee's email from their User record
3. Use the existing Nodemailer setup (already in Contact module) to send an email
4. Also create a `Notification` record in DB for the in-app notification bell
5. Activity log entry with type `TASK_ASSIGNED` for the activity feed

---

**Q: What would you improve in this project?**

- **Real-time updates** with WebSockets (Socket.io) — teammates see task moves instantly
- **File uploads** for task attachments using AWS S3 (DB model already supports it with `TaskAttachment`)
- **Email verification** on registration (`isEmailVerified` field already exists in User model)
- **Unit and integration tests** (Jest is already configured — just needs test files)
- **Push notifications** using service workers
- **Internationalization (i18n)** for multiple language support
- **OAuth login** (Google, GitHub) via Passport strategies

---

**Q: What is the difference between authentication and authorization?**

- **Authentication** = Who are you? → Login with email + password → JWT token issued
- **Authorization** = What are you allowed to do? → Role-based access → OWNER can delete board, VIEWER cannot

In this project:
- `JwtAuthGuard` → Authentication (are you logged in?)
- `RolesGuard` + `@Roles()` decorator → Authorization (do you have permission?)

---

**Q: What happens if the database goes down?**

1. Prisma throws a connection error
2. NestJS `GlobalExceptionFilter` catches it
3. Returns `500 Internal Server Error` with a generic message (never expose DB errors to users)
4. Frontend Axios catches the error → displays toast notification "Something went wrong"
5. The health check endpoint would also fail, alerting monitoring systems

---

## React Hooks Used

Hooks are divided into **5 categories** in this project.

---

### Category 1: Built-in React Hooks

| Hook | Purpose | Where Used in This Project |
|---|---|---|
| `useState` | Store a value, triggers re-render on change | Every component — modals, forms, timers, toggles |
| `useEffect` | Run code on mount / update / unmount | Fetching data, timers, event listeners |
| `useRef` | Store value without re-rendering | Pomodoro timer ID, DOM element references |
| `useCallback` | Memoize a function so it isn't recreated | Event handlers passed as props to child components |
| `useMemo` | Memoize a computed value | Filtering/sorting large task lists |
| `useContext` | Read data from React Context | Theme (dark/light mode) |
| `useReducer` | Complex state logic (alternative to useState) | Used internally by Redux Toolkit |
| `useId` | Generate unique IDs | Form input + label pairing (accessibility) |

**Code Examples:**

```jsx
// useState — store local value
const [isOpen, setIsOpen] = useState(false)

// useEffect — fetch data when component loads
useEffect(() => {
  fetchTasks()
}, [boardId])   // re-runs when boardId changes

// useRef — store timer ID (survives re-renders)
const intervalRef = useRef(null)
intervalRef.current = setInterval(() => { ... }, 1000)

// useCallback — prevent re-creating function on every render
const handleDelete = useCallback((id) => {
  dispatch(deleteTask(id))
}, [dispatch])

// useMemo — expensive calculation, only recalculates when tasks change
const completedTasks = useMemo(() => {
  return tasks.filter(t => t.status === 'DONE')
}, [tasks])
```

---

### Category 2: Redux Hooks

These come from `react-redux` package.

| Hook | Purpose | Example |
|---|---|---|
| `useSelector` | Read data from Redux store | Get logged-in user, task list, loading state |
| `useDispatch` | Send actions to Redux store | Trigger login, create task, toggle sidebar |

```jsx
// useSelector — read from global state
const user = useSelector(state => state.auth.user)
const tasks = useSelector(state => state.tasks.byColumn)

// useDispatch — update global state
const dispatch = useDispatch()
dispatch(login({ email, password }))
dispatch(createTask(newTask))
dispatch(toggleSidebar())
```

---

### Category 3: React Router Hooks

These come from `react-router-dom` package.

| Hook | Purpose | Where Used |
|---|---|---|
| `useNavigate` | Go to a different page programmatically | After login → `/dashboard`, after logout → `/login` |
| `useParams` | Get URL parameters like `:boardId` | `KanbanPage` to know which board to load |
| `useLocation` | Get current URL path | Sidebar active menu highlight |
| `useSearchParams` | Read/write URL query params | Task filters persist in URL (`?status=DONE`) |

```jsx
// useNavigate
const navigate = useNavigate()
navigate('/dashboard')    // go to dashboard
navigate(-1)              // go back

// useParams
const { boardId } = useParams()
// URL: /board/abc123  →  boardId = "abc123"

// useSearchParams
const [searchParams, setSearchParams] = useSearchParams()
const status = searchParams.get('status')   // reads ?status=DONE
```

---

### Category 4: Custom Hooks (Built for This Project)

Located in `frontend/src/hooks/` and `frontend/src/features/*/hooks/`

| Hook | Purpose |
|---|---|
| `useAuth` | Auth state (user, isAuthenticated) + login/logout actions |
| `useBoards` | Fetch boards, create, update, delete board |
| `useTasks` | Fetch tasks for a board, create, move, filter tasks |
| `useTeams` | Team data, invite members, update roles |
| `useComments` | Fetch comments for a task, add, edit, delete |
| `useDashboard` | Dashboard stats, recent activity, my tasks |
| `useDebounce` | Delay a value — used for search input (waits 500ms) |
| `useLocalStorage` | Read/write localStorage — theme, sidebar state |
| `useMediaQuery` | Detect screen size (mobile/desktop) |
| `useOnClickOutside` | Close modal/dropdown when clicking outside |
| `usePagination` | Handle page number, next/prev, total pages |

```jsx
// useDebounce — prevents API call on every keystroke
const debouncedSearch = useDebounce(searchText, 500)
// waits 500ms after user stops typing before searching

// useOnClickOutside — close modal when clicking outside
useOnClickOutside(modalRef, () => setIsOpen(false))

// useLocalStorage — survives page refresh
const [theme, setTheme] = useLocalStorage('theme', 'dark')

// useMediaQuery — responsive logic
const isMobile = useMediaQuery('(max-width: 768px)')
```

---

### Category 5: Library Hooks

| Hook | Library | Purpose |
|---|---|---|
| `useQuery` | TanStack Query | Fetch + cache API data automatically |
| `useMutation` | TanStack Query | Create / Update / Delete via API |
| `useQueryClient` | TanStack Query | Invalidate cache after mutations |
| `useForm` | React Hook Form | Handle form inputs + validation |

```jsx
// useQuery — fetch with caching
const { data, isLoading, error } = useQuery({
  queryKey: ['tasks', boardId],
  queryFn: () => fetchTasks(boardId)
})

// useMutation — create/update/delete
const { mutate } = useMutation({
  mutationFn: createTask,
  onSuccess: () => toast.success('Task created!')
})

// useQueryClient — invalidate cache after mutation
const queryClient = useQueryClient()
queryClient.invalidateQueries(['tasks'])  // triggers refetch

// useForm — handle form inputs
const { register, handleSubmit, formState: { errors } } = useForm()
```

---

### All Hooks Summary Table

| Hook | Category | Purpose |
|---|---|---|
| `useState` | React | Store local values |
| `useEffect` | React | Side effects (fetch, timer, events) |
| `useRef` | React | Store without re-render (timer ID, DOM ref) |
| `useCallback` | React | Memoize functions |
| `useMemo` | React | Memoize computed values |
| `useContext` | React | Read from Context (theme) |
| `useReducer` | React | Complex state logic |
| `useId` | React | Generate unique IDs |
| `useSelector` | Redux | Read from Redux store |
| `useDispatch` | Redux | Send actions to Redux store |
| `useNavigate` | Router | Programmatic navigation |
| `useParams` | Router | Get `:boardId` from URL |
| `useLocation` | Router | Get current pathname |
| `useSearchParams` | Router | Read/write URL query params |
| `useAuth` | Custom | Auth state and actions |
| `useBoards` | Custom | Board CRUD |
| `useTasks` | Custom | Task CRUD + filters |
| `useTeams` | Custom | Team management |
| `useComments` | Custom | Comment operations |
| `useDashboard` | Custom | Dashboard stats |
| `useDebounce` | Custom | Delay search input |
| `useLocalStorage` | Custom | Persist in localStorage |
| `useMediaQuery` | Custom | Detect screen size |
| `useOnClickOutside` | Custom | Close on outside click |
| `usePagination` | Custom | Pagination logic |
| `useQuery` | TanStack Query | Fetch + cache API data |
| `useMutation` | TanStack Query | Create/Update/Delete API |
| `useQueryClient` | TanStack Query | Invalidate cache |
| `useForm` | React Hook Form | Handle form inputs + validation |

**Total: 29 hooks** — 8 React built-in + 2 Redux + 4 Router + 11 Custom + 4 Library

---

## How Timers Work

The **Pomodoro Timer** (`PomodoroPage.tsx`) is built using these 3 JavaScript functions:

| Function | What it does |
|---|---|
| `setInterval()` | Run code repeatedly every X milliseconds |
| `clearInterval()` | Stop the interval timer |
| `setTimeout()` | Run code once after a delay |

---

### Basic Timer in JavaScript

```javascript
// Run once after 3 seconds
setTimeout(() => {
  console.log("Runs after 3 seconds")
}, 3000)

// Run every 1 second until stopped
let count = 0
const timer = setInterval(() => {
  count++
  console.log("Count:", count)
  if (count === 10) clearInterval(timer)  // stop at 10
}, 1000)
```

---

### Countdown Timer in React (Pomodoro Style)

```jsx
import { useState, useEffect, useRef } from 'react'

function CountdownTimer() {
  const [seconds, setSeconds] = useState(25 * 60)  // 25 minutes
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)   // stores timer ID

  const start = () => {
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          return 0
        }
        return prev - 1   // decrease by 1 every second
      })
    }, 1000)
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setSeconds(25 * 60)
  }

  // Cleanup when component unmounts — VERY IMPORTANT
  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  // Format 1500 seconds → "25:00"
  const format = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div>
      <h1>{format(seconds)}</h1>
      <button onClick={start} disabled={isRunning}>Start</button>
      <button onClick={pause} disabled={!isRunning}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

---

### How the Timer Code Works (Step by Step)

```
User clicks Start
    ↓
setIsRunning(true)
    ↓
setInterval runs every 1000ms (1 second)
    ↓
Each tick: seconds - 1  →  state updates  →  UI re-renders with new time
    ↓
When seconds === 0  →  clearInterval()  →  timer stops automatically
    ↓
User clicks Pause  →  clearInterval()  →  seconds stay where they are
    ↓
User clicks Reset  →  clearInterval() + setSeconds(25 * 60)  →  back to 25:00
```

---

### Key Concepts

**Why `useRef` for timer ID, not a regular variable?**

```jsx
// WRONG — loses value on every re-render
let intervalId = setInterval(...)

// CORRECT — persists across re-renders, no re-render triggered
const intervalRef = useRef(null)
intervalRef.current = setInterval(...)
```

React re-renders the component every time state changes. A regular variable resets to `null` on every re-render. `useRef` keeps its value.

**Why cleanup in `useEffect`?**

```jsx
useEffect(() => {
  return () => clearInterval(intervalRef.current)  // runs on unmount
}, [])
```

If the user navigates away from the Pomodoro page, the component unmounts. Without cleanup, the timer keeps running in the background — wasting memory. The `return` function inside `useEffect` is the cleanup.

**What is `padStart`?**

```javascript
5..toString().padStart(2, '0')   // → "05"
// Adds a leading zero so "5:3" becomes "05:03"

Math.floor(65 / 60)   // = 1  (minutes)
65 % 60               // = 5  (remaining seconds)
// Result: "01:05"
```

---

### Pomodoro Sessions

| Session | Duration |
|---|---|
| Focus time | 25 minutes |
| Short break | 5 minutes |
| Long break | 15 minutes (after 4 focus sessions) |

---

### K. Hooks Interview Questions

---

**Q: What is a React Hook?**

A Hook is a special function that lets you use React features (like state, lifecycle) inside a functional component. Before hooks, you needed class components for state. Hooks always start with `use` — `useState`, `useEffect`, `useRef`, etc.

---

**Q: What is the difference between `useState` and `useRef`?**

| | `useState` | `useRef` |
|---|---|---|
| Triggers re-render? | Yes — every update re-renders the component | No — update is silent |
| Use case | UI values (isOpen, count, formData) | Timer IDs, DOM references |
| Access syntax | `value` directly | `ref.current` |

In the Pomodoro timer, the interval ID is stored in `useRef` — storing it in `useState` would cause unnecessary re-renders every tick.

---

**Q: What is the difference between `useCallback` and `useMemo`?**

- `useCallback` → memoizes a **function** — returns the same function reference between renders
- `useMemo` → memoizes a **value** — returns the same computed result between renders

```jsx
const handleDelete = useCallback(() => deleteTask(id), [id])       // function
const doneTasks = useMemo(() => tasks.filter(t => t.status === 'DONE'), [tasks]) // value
```

---

**Q: What is `useEffect` and what are its dependency rules?**

`useEffect` runs side effects after render. The second argument controls when it runs:

```jsx
useEffect(() => { ... })           // runs after EVERY render
useEffect(() => { ... }, [])       // runs ONCE on mount only
useEffect(() => { ... }, [id])     // runs every time `id` changes
```

Always include every value used inside `useEffect` in the dependency array — otherwise you get stale data bugs.

---

**Q: What is a custom hook and why do we create them?**

A custom hook is a reusable function that uses built-in hooks inside and starts with `use`. We create them to:
- Avoid copy-pasting the same logic in multiple components
- Keep components clean — move complex logic out
- Make code easier to test

Example: `useDebounce` is used in global search — instead of writing `useState + useEffect` for debounce in every search component, you call `useDebounce(value, 500)` once anywhere.

---

**Q: What is `useSelector` and `useDispatch`?**

These are Redux hooks:
- `useSelector` → reads data from the Redux store (takes a selector function)
- `useDispatch` → returns the dispatch function to send actions to the store

```jsx
const user = useSelector(state => state.auth.user)   // read
const dispatch = useDispatch()
dispatch(logout())                                    // write/update
```

---

**Q: What is the difference between `useQuery` and `useMutation`?**

- `useQuery` → for **fetching** (GET requests). Runs automatically, auto-caches, handles loading/error.
- `useMutation` → for **creating/updating/deleting** (POST/PATCH/DELETE). Only runs when you call `mutate()`.

```jsx
// useQuery — runs automatically on component mount
const { data, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: getTasks })

// useMutation — runs manually on demand
const { mutate } = useMutation({ mutationFn: createTask })
mutate({ title: 'New task' })   // called on button click
```

---

**Q: Why use React Hook Form instead of `useState` for forms?**

With `useState`, every single keystroke re-renders the whole form. React Hook Form uses **uncontrolled inputs** (refs internally) — the form only re-renders when needed (on submit, on validation error). Much better performance for large forms with many fields.

---

**Q: What is `useNavigate` and when do you use it?**

`useNavigate` from React Router lets you navigate programmatically — not just when user clicks a link, but after some action in code.

```jsx
const navigate = useNavigate()
navigate('/dashboard')   // after login
navigate('/login')       // after logout
navigate(-1)             // go back (browser history)
```

---

**Q: What is `useParams`?**

`useParams` reads dynamic parts of the URL.

```jsx
// Route defined as: /board/:boardId
const { boardId } = useParams()
// URL: /board/abc123  →  boardId = "abc123"
```

Used in `KanbanPage` to know which board's tasks to load from the API.

---

### L. Timer Interview Questions

---

**Q: What is `setInterval` and `clearInterval`?**

`setInterval` runs a function repeatedly every X milliseconds. It returns a numeric ID. `clearInterval(id)` stops it.

```javascript
const id = setInterval(() => console.log('tick'), 1000)  // every 1 second
clearInterval(id)   // stops the interval
```

---

**Q: What is the difference between `setTimeout` and `setInterval`?**

| | `setTimeout` | `setInterval` |
|---|---|---|
| Runs | Once after a delay | Repeatedly at fixed intervals |
| Stop with | Itself (runs once automatically) | `clearInterval(id)` |
| Use case | Delay a one-time action | Countdown timer, polling |

---

**Q: Why do we use `useRef` to store the timer ID in React?**

React re-renders the component on every state change. A regular `let` variable resets to `null` on each render — you'd lose the timer ID and could never stop it. `useRef` persists its `.current` value across renders without causing a re-render.

---

**Q: Why is cleanup important in `useEffect` for timers?**

If the user navigates away from the page, the component unmounts. Without cleanup, `setInterval` keeps running in memory — a **memory leak**. The `return` function inside `useEffect` is the cleanup that runs on unmount.

```jsx
useEffect(() => {
  const id = setInterval(() => tick(), 1000)
  return () => clearInterval(id)   // runs on unmount → stops timer
}, [])
```

---

**Q: What is `padStart` and why is it used in the timer?**

`padStart(2, '0')` adds a leading zero so numbers are always 2 digits wide.

```javascript
'5'.padStart(2, '0')    // → "05"
'12'.padStart(2, '0')   // → "12" (already 2 digits, no change)
// So the timer shows "05:03" instead of "5:3"
```

---

**Q: How would you add a sound when the Pomodoro timer finishes?**

```jsx
if (prev <= 1) {
  clearInterval(intervalRef.current)
  new Audio('/timer-end.mp3').play()   // play sound when done
  return 0
}
```

---

## Quick Cheat Sheet

| Question | Short Answer |
|---|---|
| Frontend framework? | React 19 + TypeScript |
| Backend framework? | NestJS + TypeScript |
| Database? | PostgreSQL via Prisma ORM |
| State management? | Redux Toolkit |
| HTTP client? | Axios with interceptors |
| Styling? | Tailwind CSS |
| Auth mechanism? | JWT (access token 15min + refresh token 7days) |
| Password security? | bcryptjs hashing, 12 salt rounds |
| Drag & Drop? | dnd-kit library |
| Chart library? | Recharts |
| Frontend deployment? | Vercel |
| Backend deployment? | Render |
| API style? | REST API with versioning (/api/v1) |
| What is Prisma? | ORM — TypeScript to talk to DB instead of raw SQL |
| What is a NestJS module? | Groups Controller + Service + Providers for one feature |
| What is soft delete? | `deletedAt` field set instead of removing the row |
| Why httpOnly cookie? | Protects refresh token from XSS attacks |
| What is CORS? | Allows frontend domain to call backend API |
| What is rate limiting? | Max 100 req/60s — prevents bots/brute force |
| What is Redux? | Global state — any component reads/writes shared data |
| What is JWT? | Signed digital "ID card" proving you're logged in |
| What is TypeScript? | JavaScript with types — catches bugs at compile time |
| What is a DTO? | Defines and validates the shape of request data |
| What is a Guard? | NestJS security checkpoint — validates token/roles |
| Monorepo? | Yes — frontend + backend in one git repository |
| Real-time? | No WebSockets — would be a good improvement to add |
| Testing setup? | Jest (configured but needs test files) |
| How timer works? | `setInterval` + `useRef` + `clearInterval` on unmount |
| Why `useRef` for timer ID? | Survives re-renders without causing re-render |
| Total hooks used? | 29 hooks — React + Redux + Router + Custom + Library |
| Custom hooks location? | `frontend/src/hooks/` and `features/*/hooks/` |
| What is `useDebounce`? | Delays value update — used for search (waits 500ms) |
| What is `useOnClickOutside`? | Closes modal/dropdown when clicking outside |

---

*Generated for interview preparation — Task Management Full-Stack Project*

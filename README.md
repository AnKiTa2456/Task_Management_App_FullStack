# TaskFlow — Full-Stack Task Management System

A production-ready, full-stack Task Management application built with **React**, **NestJS**, and **PostgreSQL**. Features a Kanban board with drag-and-drop, JWT authentication, team collaboration, real-time activity feeds, and a fully typed REST API.

---

## Live Demo

> Frontend: _Deploy on Vercel_
> Backend API: _Deploy on AWS EC2_
> API Docs (Swagger): `http://localhost:3000/api/docs`

---

## Screenshots



| Login | Dashboard | Kanban Board |
|-------|-----------|--------------|
| ![Login](https://placehold.co/300x200?text=Login+Page) | ![Dashboard](https://placehold.co/300x200?text=Dashboard) | ![Kanban](https://placehold.co/300x200?text=Kanban+Board) |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 3.4 | Styling |
| Redux Toolkit | 2.x | Global state management |
| React Query | 5.x | Server state & caching |
| React Router | 7.x | Client-side routing |
| dnd-kit | 6.x | Drag-and-drop Kanban |
| Axios | 1.x | HTTP client with interceptors |
| React Hook Form | 7.x | Form handling & validation |
| React Hot Toast | 2.x | Toast notifications |
| Lucide React | 0.5x | Icons |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| NestJS | 10 | Node.js framework |
| TypeScript | 5.x | Type safety |
| Prisma ORM | 5.x | Database access & migrations |
| PostgreSQL | 15 | Relational database |
| JWT + Passport | — | Authentication |
| bcryptjs | — | Password hashing |
| Helmet | — | Security headers |
| Zod | 4.x | Runtime validation |
| Swagger | 7.x | API documentation |
| @nestjs/throttler | 5.x | Rate limiting |

---

## Features

### Authentication
- Register & Login with email/password
- JWT access tokens (15min expiry)
- Refresh token rotation (7-day httpOnly cookie)
- Logout from all devices
- Password hashing with bcrypt (12 rounds)
- Protected routes (PrivateRoute / PublicRoute)

### Kanban Board
- Drag-and-drop tasks between columns (powered by dnd-kit)
- Create, update, delete tasks
- Task priorities: Low, Medium, High, Urgent
- Task statuses: To Do, In Progress, In Review, Done
- Due dates with overdue detection
- Task labels / tags
- Task assignee with avatar
- Task detail panel (side panel)
- Add / remove columns

### Task Management
- Create tasks with title, description, priority, due date, assignee
- Move tasks across columns with position persistence
- Filter tasks by status, priority, search term
- Paginated task list

### Comments & Activity
- Add, edit, delete comments on tasks
- Real-time activity feed per board and per task
- Activity types: created, updated, moved, assigned, commented

### Teams
- Create teams with name and slug
- Invite members by email
- Role-based access: Owner, Admin, Member, Viewer
- Remove members

### Boards
- Create multiple Kanban boards
- Private / public board visibility
- Board owner and column count display

### Security
- Global JWT auth guard on all routes
- `@Public()` decorator to opt-out per route
- Rate limiting: 100 requests / 60 seconds
- Helmet security headers
- CORS configured per environment
- Passwords never sent to frontend (sanitized)

---

## Project Structure

```
task-management/
├── backend/                    # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (13 models)
│   │   ├── migrations/         # SQL migration history
│   │   └── seed.ts             # Database seeder
│   ├── src/
│   │   ├── app.module.ts       # Root module
│   │   ├── main.ts             # Entry point (Swagger, CORS, pipes)
│   │   ├── common/
│   │   │   ├── decorators/     # @Public(), @CurrentUser(), @Roles()
│   │   │   ├── filters/        # GlobalExceptionFilter
│   │   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/   # TransformInterceptor, LoggingInterceptor
│   │   │   └── pipes/          # ZodValidationPipe
│   │   ├── config/
│   │   │   └── configuration.ts
│   │   └── modules/
│   │       ├── auth/           # Register, Login, Refresh, Logout, Me
│   │       ├── users/          # Profile, Password, Search
│   │       ├── boards/         # Board CRUD + Columns
│   │       ├── tasks/          # Task CRUD + Move + Assign
│   │       ├── comments/       # Comment CRUD
│   │       ├── activity/       # Activity feed (board & task)
│   │       └── teams/          # Team + Members management
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                   # React + Vite app
    ├── public/
    ├── src/
    │   ├── app/                # Redux store, providers, router
    │   ├── components/
    │   │   ├── kanban/         # KanbanColumn, TaskCard, TaskDetailPanel
    │   │   ├── layout/         # AppLayout, Navbar, Sidebar
    │   │   ├── dashboard/      # StatsCard, MyTasks, RecentActivity
    │   │   ├── ui/             # Button, Input, Modal, Select, Badge...
    │   │   └── shared/         # ErrorBoundary, PageLoader, EmptyState
    │   ├── features/
    │   │   ├── auth/           # authSlice, useAuth, LoginForm, RegisterForm
    │   │   ├── boards/         # boardsSlice, useBoards, BoardCard
    │   │   ├── tasks/          # tasksSlice, useTasks, TaskForm, TaskFilters
    │   │   ├── comments/       # useComments, CommentList
    │   │   ├── teams/          # teamsSlice, useTeams, MemberList
    │   │   └── ui/             # uiSlice (sidebar, theme, modal)
    │   ├── hooks/              # useDebounce, useLocalStorage, useMediaQuery
    │   ├── lib/                # axios client, React Query client
    │   ├── pages/              # DashboardPage, KanbanPage, TeamPage...
    │   ├── routes/             # PrivateRoute, PublicRoute
    │   ├── services/api/       # authApi, boardsApi, tasksApi, teamsApi...
    │   ├── types/              # TypeScript interfaces
    │   └── utils/              # cn, formatDate, constants, QUERY_KEYS
    ├── package.json
    └── vite.config.ts
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Create new account | Public |
| POST | `/api/v1/auth/login` | Login | Public |
| POST | `/api/v1/auth/refresh` | Rotate refresh token | Public |
| POST | `/api/v1/auth/logout` | Logout all devices | Required |
| GET | `/api/v1/auth/me` | Get current user | Required |
| GET | `/api/v1/boards` | List all boards | Required |
| POST | `/api/v1/boards` | Create board | Required |
| GET | `/api/v1/boards/:id` | Get board with columns | Required |
| PATCH | `/api/v1/boards/:id` | Update board | Required |
| DELETE | `/api/v1/boards/:id` | Delete board | Required |
| POST | `/api/v1/boards/:id/columns` | Add column | Required |
| DELETE | `/api/v1/boards/columns/:id` | Remove column | Required |
| GET | `/api/v1/boards/:id/tasks` | List tasks (paginated) | Required |
| POST | `/api/v1/boards/:id/tasks` | Create task | Required |
| GET | `/api/v1/tasks/:id` | Get task detail | Required |
| PATCH | `/api/v1/tasks/:id` | Update task | Required |
| PATCH | `/api/v1/tasks/:id/move` | Move task (drag-drop) | Required |
| PATCH | `/api/v1/tasks/:id/assign` | Assign task | Required |
| DELETE | `/api/v1/tasks/:id` | Delete task | Required |
| GET | `/api/v1/tasks/:id/comments` | List comments | Required |
| POST | `/api/v1/tasks/:id/comments` | Add comment | Required |
| PATCH | `/api/v1/comments/:id` | Edit comment | Required |
| DELETE | `/api/v1/comments/:id` | Delete comment | Required |
| GET | `/api/v1/boards/:id/activity` | Board activity feed | Required |
| GET | `/api/v1/tasks/:id/activity` | Task activity feed | Required |
| GET | `/api/v1/teams` | List teams | Required |
| POST | `/api/v1/teams` | Create team | Required |
| GET | `/api/v1/teams/:id` | Get team | Required |
| PATCH | `/api/v1/teams/:id` | Update team | Required |
| POST | `/api/v1/teams/:id/members` | Invite member | Required |
| PATCH | `/api/v1/teams/:id/members/:userId` | Update member role | Required |
| DELETE | `/api/v1/teams/:id/members/:userId` | Remove member | Required |

Full interactive docs at: `http://localhost:3000/api/docs`

---

## Getting Started

### Prerequisites

- **Node.js** v18 or v20 → [Download](https://nodejs.org)
- **PostgreSQL** v15 → [Download](https://www.postgresql.org/download)
- **Git** → [Download](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/AnKiTa2456/Task_Management_App_FullStack.git
cd Task_Management_App_FullStack
```

### 2. Setup the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow?schema=public"

# Change these to long random strings (min 32 chars)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-different-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d
```

```bash
# Create database tables
npx prisma migrate deploy

# (Optional) Seed with sample data
npx prisma db seed

# Start the backend
npm run start:dev
```

Backend runs at: `http://localhost:3000`
Swagger docs at: `http://localhost:3000/api/docs`

### 3. Setup the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > .env

# Start the frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Open the app

```
http://localhost:5173
```

Register a new account and start using the app.

---

## Mock Mode (No Backend Required)

Want to see the UI without setting up a database? Enable mock mode:

```bash
# In the frontend .env file:
VITE_MOCK_AUTH=true
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Then run `npm run dev` in the frontend folder. You can log in with **any email + any password** (6+ chars).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 3000) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: 15m) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret (min 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (default: 7d) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL |
| `VITE_MOCK_AUTH` | No | Set `true` to skip backend entirely |

---

## Available Scripts

### Backend

```bash
npm run start:dev     # Start with hot-reload (development)
npm run start:prod    # Start production build
npm run build         # Compile TypeScript → dist/
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Run tests with coverage report
npm run lint          # Run ESLint
npx prisma studio     # Open database GUI
npx prisma migrate dev       # Create a new migration
npx prisma migrate deploy    # Apply migrations (production)
npx prisma db seed    # Seed sample data
```

### Frontend

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # Production build → dist/
npm run preview       # Preview production build locally
npm run lint          # Run ESLint
```

---

## Database Schema

Key models in PostgreSQL:

```
User          → owns boards, creates tasks, has refresh tokens
RefreshToken  → JWT refresh token rotation
Board         → has many Columns
Column        → belongs to Board, has many Tasks
Task          → belongs to Column, has assignee, labels, comments
Comment       → belongs to Task, written by User
Label         → many-to-many with Task
Activity      → audit log for every board/task action
Notification  → per-user notification inbox
Team          → has many TeamMembers
TeamMember    → User ↔ Team with Role (OWNER/ADMIN/MEMBER/VIEWER)
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (auto-deploy from main branch) |
| Backend | AWS EC2 (Ubuntu 22.04, PM2, Nginx) |
| Database | AWS RDS PostgreSQL 15 |
| File Storage | AWS S3 |

See the deployment guide in the project docs for full CI/CD pipeline setup with GitHub Actions.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## Author

**Ankita** — [@AnKiTa2456](https://github.com/AnKiTa2456)

---

## License

This project is licensed under the MIT License.

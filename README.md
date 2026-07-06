# Pulse — Real-Time Collaborative Project Management Tool

A Trello/Jira-style board with **live drag-and-drop**, **real-time comments**,
a **live activity feed**, and an **interactive analytics dashboard** —
built to demonstrate complex client state management synced against a
real-time server via WebSockets.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev loop, modern React |
| Server state | **React Query** | Cache-as-source-of-truth, optimistic updates, auto-sync with sockets |
| Drag & drop | `@hello-pangea/dnd` | Actively maintained fork of react-beautiful-dnd |
| Real-time | **Socket.io** (client + server) | Bidirectional events for board mutations, comments, presence |
| Charts | Recharts | Bar / pie / line charts for the analytics dashboard |
| Backend | Node.js + Express | REST API, source of truth for writes |
| Database | MongoDB + Mongoose | Boards, Lists, Cards, Comments, ActivityLog |
| Auth | JWT + bcrypt | Simple stateless auth |

## How the real-time sync works

1. Every mutation (create card, move card, add comment, rename list…) goes
   through a normal REST endpoint. **MongoDB is always the source of truth.**
2. After a successful write, the Express route handler broadcasts an event
   (e.g. `card:moved`, `comment:created`, `activity:created`) to everyone
   currently in that board's Socket.io room (`board:<id>`).
3. On the client, `useBoardData.js` subscribes to those events and **patches
   the React Query cache directly** — no refetch, no polling. Every open
   browser tab / teammate sees the change appear instantly.
4. Drag-and-drop uses an **optimistic update** (`useBoardMutations.js` →
   `moveCard`): the UI updates the instant you drop the card, then the REST
   call confirms it in the background (and rolls back on failure).
5. Presence (who's currently viewing a board) is tracked in-memory per
   socket room and broadcast on join/leave — shown as little avatars in the
   top bar.

## Project structure

```
project-manager/
├── backend/            Express + Socket.io + MongoDB API
│   ├── models/          Mongoose schemas (User, Board, List, Card, Comment, ActivityLog)
│   ├── routes/          REST endpoints, each emits socket events after writes
│   ├── sockets/          Socket.io connection + room + presence logic
│   ├── middleware/       JWT auth guard
│   └── utils/seed.js     Demo data seeder
└── frontend/            React + Vite app
    └── src/
        ├── api/client.js         Axios instance + all API calls
        ├── context/               Auth + Socket providers
        ├── hooks/                 React Query hooks (this is where the "magic" lives)
        ├── components/           BoardColumn, CardItem, CardModal, ActivityFeed, AnalyticsDashboard…
        └── pages/                 LoginPage, BoardsListPage, BoardPage
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run seed               # optional: creates a demo board + 3 users
npm run dev                 # starts on http://localhost:5000
```

You need a MongoDB instance running — either locally (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster (paste its connection
string into `MONGO_URI`).

Demo login after seeding: `ayesha@example.com` / `password123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # starts on http://localhost:5173
```

Open two browser windows side by side on the same board — drag a card,
post a comment, or add a list in one, and watch it appear instantly in the
other. That's the real-time sync working end to end.

## Why this impresses in an interview

- **Optimistic UI + rollback** for drag-and-drop, not just a naive refetch.
- **Cache-as-truth pattern**: React Query cache is mutated directly by
  socket events instead of invalidating/refetching, which is the harder
  and more scalable approach real products use.
- **Room-scoped broadcasting**: events only go to clients viewing that
  specific board, not a global broadcast — shows you understand Socket.io
  namespacing/rooms at a production level.
- **Live analytics** recomputed from MongoDB aggregation pipelines and
  invalidated in real time via sockets — combines charts, aggregation, and
  WebSockets in one feature.
- Clean separation: **REST = writes + source of truth, Sockets = fan-out
  notifications** — a pattern that scales far better than trying to do
  everything over WebSockets alone.

## Possible extensions

- Redis adapter for Socket.io to scale horizontally across multiple server instances
- Optimistic list reordering (currently only card moves are optimistic)
- File attachments on cards (e.g. via S3 pre-signed URLs)
- Role-based permissions (admin/member) per board

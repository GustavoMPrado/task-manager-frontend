# Task Manager — Full Stack (Java + Spring Boot + React)

A full-stack **Task Manager** portfolio project showcasing real-world **CRUD**, **pagination**, **filters/search**, and a clean **UX**.

- **Backend:** Java 21 · Spring Boot · PostgreSQL · Flyway  
- **Frontend:** React · Vite · TypeScript · Tailwind CSS  
- **Local run:** Docker Compose (one command) **or** Windows scripts (two clicks)

---

## Features

- **Full CRUD:** create, list (paginated), get by id, update (PUT), partial update (PATCH), delete
- **List UI:** pagination, search (`q`), filters (status/priority), sorting, page size
- **Inline updates:** PATCH **status** and **priority** directly from the list
- **UX:** loading overlay, toast feedback, friendly error messages
- **Dev-friendly local run:** run everything locally via Docker Compose or `.bat` scripts

---

## Quick start (recommended)

### Option 1 — One command (Docker Compose)

From the folder where `docker-compose.yml` is located:

~~~bash
docker compose up --build
~~~

Open:
- Frontend: http://localhost:5173
- API: http://localhost:8081

To stop:

~~~bash
docker compose down
~~~

### Option 2 — Two clicks (Windows)

In the folder where the scripts are located:

1. Double click: `start-task-manager.bat`
2. Open: http://localhost:5173

To stop:
- Double click: `stop-task-manager.bat`

---

## What you can do (UI)

- Create tasks with title, description, status, priority, and due date
- Browse tasks with pagination
- Search by text using `q` and filter by status/priority
- Sort by fields (e.g., `id`, `title`, `dueDate`) and change page size
- Edit tasks (PUT) using form edit mode
- Delete tasks with confirmation
- Update status/priority (PATCH) directly from the list

---

## Project structure

- `springboot-api/` — Spring Boot API + Flyway migrations + Docker build
- `task-manager-frontend/` — React app (TypeScript + Tailwind)
- `docker-compose.yml` — runs Postgres + API + Frontend
- `screenshots/` — UI images

---

## Screenshots

- `screenshots/home.png`
- `screenshots/edit.png`

---

## Development (without Docker)

### Backend

Run the API at:
- http://localhost:8081

### Frontend

From `task-manager-frontend/`:

~~~bash
npm install
npm run dev
~~~

Open:
- http://localhost:5173

Note: the frontend calls `/api/...` and Vite proxies to `http://localhost:8081` (removing `/api`).

---

## Repositories

- Backend: https://github.com/GustavoMPrado/task-manager-api
- Frontend: https://github.com/GustavoMPrado/task-manager-frontend

---

## Contact

Gustavo Marinho Prado Alves  
GitHub: https://github.com/GustavoMPrado




# Task Manager — Full Stack (V2: JWT + Scaling + Observability)

A full-stack **Task Manager** portfolio project showcasing real-world **CRUD**, **pagination**, **filters/search**, a clean **UX**, and **security upgrades** with **JWT**.

- **Backend:** Java 21 · Spring Boot · PostgreSQL · Flyway · Actuator  
- **Frontend:** React · Vite · TypeScript · Tailwind CSS  
- **Production:** Render (API) + GitHub Pages (Frontend)

---

## Live Demo (Production)

- **Frontend (GitHub Pages):** https://gustavomprado.github.io/task-manager-frontend/
- **API (Render):** https://task-manager-api-njza.onrender.com  
  - Health: https://task-manager-api-njza.onrender.com/actuator/health  
  - Root status: https://task-manager-api-njza.onrender.com/  
    - Returns: `{"status":"ok","service":"task-manager-api"}`

> **Note:** Render Free may have a **cold start** (~50s) on the first request.

---

## V2 Highlights (Security + Resilience)

### JWT Auth (Frontend + Backend)
- Login via `POST /auth/login` returns `{ token }`
- Frontend stores token in `localStorage` key: `task_manager_token`
- Requests to `/tasks/**` use `Authorization: Bearer <token>`
- If API returns **401**, the frontend clears token and returns to login (session expired)

### Resilience / Scaling
- **Login rate limit**: after **5 attempts/minute/IP**, `/auth/login` returns **429**
- **Pagination cap**: requests with very large `size` are capped (e.g., `size=999` → effective `size=50`)
- **Flyway migrations**: schema versioned (includes `V2__add_indexes_timestamps.sql`)

### Observability
- Actuator health: `GET /actuator/health` → `UP`

---

## Features

- **Full CRUD:** create, list (paginated), get by id, update (PUT), partial update (PATCH), delete
- **List UI:** pagination, search (`q`), filters (status/priority), sorting, page size
- **Inline updates:** PATCH **status** and **priority** directly from the list
- **UX:** loading overlay, toast feedback, friendly error messages
- **Security UX:** login screen, protected routes, session-expired handling (401)

---

## Quick start (Local)

### Option 1 — Frontend + Backend (two terminals)

**Terminal 1 (Backend):**
```powershell
cd C:\workspace\springboot-api
docker compose up -d --build
```

Expected:
- Containers `api` and `postgres` start successfully
- API at `http://localhost:8081`

**Terminal 2 (Frontend):**
```powershell
cd C:\workspace\task-manager-frontend
npm install
npm run dev
```

Expected:
- Vite dev server at `http://localhost:5173`

---

## Configuration

### Production API URL
This repo uses `VITE_API_URL` in production.

- `.env.production`:
  - `VITE_API_URL=https://task-manager-api-njza.onrender.com`

### Dev proxy
In development, the frontend calls `/api/...` and Vite proxies to `http://localhost:8081` (removing `/api`).

---

## JWT Flow (How to test in PROD)

1) Open the frontend:
- https://gustavomprado.github.io/task-manager-frontend/

2) Login
- The app should authenticate, store the token, and load tasks.

3) Validate protected behavior
- Missing/invalid token → app returns to login.
- If API returns 401 → token is cleared and you’re redirected to login.

---

## Screenshots

You can add screenshots later in `./screenshots/`. Suggested for V2:
- Login screen
- List after login
- Create task success toast
- Session expired (redirect to login)

---

## Repositories

- Backend: https://github.com/GustavoMPrado/task-manager-api
- Frontend: https://github.com/GustavoMPrado/task-manager-frontend

---

## Contact

Gustavo Marinho Prado Alves  
GitHub: https://github.com/GustavoMPrado






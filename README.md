# Task Manager — Full Stack (Java + Spring Boot + React)

A full stack **Task Manager** built as a portfolio project to demonstrate real-world CRUD, pagination, filters, and a clean UX.

- Backend: **Java 21 + Spring Boot + PostgreSQL + Flyway**
- Frontend: **React + Vite + TypeScript + Tailwind**
- Local run: **Docker + Docker Compose (one command / two clicks)**

## Highlights
- Full CRUD: **POST / GET (paginated) / GET by id / PUT / PATCH / DELETE**
- UI features: pagination, **search**, **filters**, **sorting**, **page size**
- Inline updates: **PATCH status/priority** directly from the list
- UX: loading overlay, toast feedback, and friendly error handling
- Dev productivity: single Compose file to run everything locally

## Quick start (recommended)

Option 1 — One command
cd C:\workspace
docker compose up --build
Open: http://localhost:5173

Option 2 — Two clicks (Windows)
In C:\workspace:
- double click start-task-manager.bat
Open: http://localhost:5173

To stop:
- double click stop-task-manager.bat

## What you can do
- Create tasks with title/description/status/priority/due date
- Browse tasks with pagination
- Search by text (q) and filter by status/priority
- Sort by id/title/dueDate and change page size
- Edit tasks (PUT) in form edit mode
- Delete tasks with confirmation
- Update status/priority (PATCH) from the list

## Project structure
- springboot-api/ — Spring Boot API + Flyway migrations + Docker build
- task-manager-frontend/ — React app (TypeScript + Tailwind)
- docker-compose.yml — runs Postgres + API + Frontend
- screenshots/ — UI images for quick review

## Screenshots
Add files to screenshots/:
- 01-home.png
- 02-filters.png
- 03-edit.png

## Development (without Docker)

Backend
Run the API on: http://localhost:8081

Frontend
cd task-manager-frontend
npm install
npm run dev
Open: http://localhost:5173

The frontend calls /api/... and Vite proxies to http://localhost:8081.

## Repositories
- Backend: https://github.com/GustavoMPrado/task-manager-api
- Frontend: (add your repo link here)

## Contact
Gustavo Marinho Prado Alves
- GitHub: https://github.com/GustavoMPrado






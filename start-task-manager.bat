@echo off
cd /d C:\workspace\springboot-api
docker compose up --build -d
cd /d C:\workspace\task-manager-frontend
npm run dev
pause

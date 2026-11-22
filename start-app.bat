@echo off
title Kids AI Stylist Server
cd /d "%~dp0"
start "" http://127.0.0.1:3000
npx.cmd vite --host 127.0.0.1 --port 3000
pause

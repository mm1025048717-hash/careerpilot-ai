@echo off
chcp 65001 >nul
title BOSS直聘数字员工 - 启动器

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║           BOSS直聘数字员工 - 一键启动                      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: 启动后端 API
echo [1/3] 启动后端服务...
start "API服务" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && python app.py"
timeout /t 3 >nul

:: 启动 Worker
echo [2/3] 启动任务执行器...
start "Worker执行器" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && python worker.py"
timeout /t 2 >nul

:: 启动前端
echo [3/3] 启动前端界面...
start "前端界面" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ 所有服务已启动！
echo.
echo    前端界面: http://localhost:5173
echo    后端 API: http://localhost:5000
echo.
echo    请保持所有窗口运行
echo    在前端创建任务后，Worker 窗口会自动执行
echo.
pause

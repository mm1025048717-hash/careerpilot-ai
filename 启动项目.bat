@echo off
chcp 65001 >nul
title BOSS直聘数字员工

echo ╔════════════════════════════════════════╗
echo ║    BOSS直聘数字员工 - 一键启动        ║
echo ╚════════════════════════════════════════╝
echo.
echo 🤖 智能求职助手正在启动...
echo.

echo [1/2] 启动后端服务...
start "后端服务 - http://localhost:5000" cmd /k "cd backend && run.bat"
timeout /t 3 /nobreak >nul

echo [2/2] 启动前端界面...
start "前端界面 - http://localhost:5173" cmd /k "cd frontend && run.bat"
timeout /t 2 /nobreak >nul

echo.
echo ✅ 启动完成！
echo.
echo 📱 前端地址: http://localhost:5173
echo 📡 后端地址: http://localhost:5000
echo.
echo 💡 使用提示:
echo    1. 等待两个窗口加载完成
echo    2. 浏览器打开 http://localhost:5173
echo    3. 在"设置"中配置AI API Key
echo    4. 开始使用AI助手！
echo.
echo ⚠️  关闭此窗口不会停止服务，请分别关闭两个服务窗口
echo.
pause



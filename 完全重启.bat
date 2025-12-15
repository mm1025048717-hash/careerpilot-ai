@echo off
chcp 65001 >nul
title BOSS直聘数字员工 - 完全重启

cls
echo ╔════════════════════════════════════════╗
echo ║    BOSS直聘数字员工 - 完全重启        ║
echo ╚════════════════════════════════════════╝
echo.
echo 🔄 正在启动所有服务...
echo.

REM 启动后端（使用真实 DeepSeek AI）
echo [1/2] 启动后端服务...
start "后端服务 (DeepSeek AI)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && python app.py"
timeout /t 3 /nobreak >nul

REM 启动前端
echo [2/2] 启动前端界面...
start "前端界面" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ✅ 启动完成！
echo.
echo 📱 前端地址: http://localhost:5173
echo 📡 后端地址: http://localhost:5000
echo.
echo 💡 提示:
echo    - 两个服务窗口会自动打开
echo    - 等待几秒后浏览器会自动打开
echo    - 现在使用的是真正的 DeepSeek AI
echo    - 不再是固定回复了！
echo.
echo ⚠️  关闭此窗口不会停止服务
echo     请分别关闭两个服务窗口来停止
echo.

timeout /t 5 /nobreak >nul
start http://localhost:5173

pause



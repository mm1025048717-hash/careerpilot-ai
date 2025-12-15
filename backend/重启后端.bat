@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║      重启后端服务（启用真实AI）       ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 🔄 激活虚拟环境...
call venv\Scripts\activate

echo.
echo 🤖 启动后端服务（已集成 DeepSeek AI）...
echo.
echo ════════════════════════════════════════
echo   后端服务运行中
echo   API地址: http://localhost:5000
echo   
echo   ⚠️  不要关闭此窗口！
echo   按 Ctrl+C 可以停止服务
echo ════════════════════════════════════════
echo.

python app.py

pause



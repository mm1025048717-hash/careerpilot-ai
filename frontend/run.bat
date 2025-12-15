@echo off
chcp 65001 >nul
echo ========================================
echo   BOSS直聘数字员工 - 前端界面
echo ========================================
echo.

if not exist node_modules (
    echo 📦 首次运行，正在安装依赖...
    call npm install
)

echo.
echo 🚀 启动前端服务...
echo.
call npm run dev

pause



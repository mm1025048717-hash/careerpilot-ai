@echo off
chcp 65001 >nul
echo ========================================
echo   BOSS直聘数字员工 - 后端服务
echo ========================================
echo.

if not exist venv (
    echo 🔧 首次运行，正在创建虚拟环境...
    python -m venv venv
    call venv\Scripts\activate
    echo 📦 正在安装依赖...
    pip install -r requirements.txt
    playwright install chromium
) else (
    call venv\Scripts\activate
)

echo.
echo 🚀 启动后端服务...
echo.
python app.py

pause



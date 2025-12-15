@echo off
chcp 65001 >nul
title BOSS直聘数字员工 - 一键配置

cls
echo ╔════════════════════════════════════════╗
echo ║    BOSS直聘数字员工 - 一键配置        ║
echo ╚════════════════════════════════════════╝
echo.
echo 🚀 自动配置环境和依赖...
echo.

REM 检查 Python
echo [1/4] 检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装
    echo.
    echo 请先安装 Python 3.8+: https://www.python.org/downloads/
    echo 安装时务必勾选 "Add Python to PATH"
    pause
    exit /b 1
)
echo ✅ Python 已安装
echo.

REM 配置后端
echo [2/4] 配置后端环境...
cd backend

if not exist venv (
    echo 📦 创建虚拟环境...
    python -m venv venv
)

echo 📥 安装依赖...
call venv\Scripts\activate
python -m pip install --upgrade pip -q
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple -q
playwright install chromium

REM 创建 .env 文件
if not exist .env (
    echo 📝 创建配置文件...
    (
        echo # DeepSeek API 配置
        echo DEEPSEEK_API_KEY=sk-1203fb58062a43fdad35082e9b0aa8c3
        echo DEEPSEEK_API_BASE=https://api.deepseek.com
        echo.
        echo # Flask 配置
        echo FLASK_ENV=development
        echo FLASK_DEBUG=True
    ) > .env
    echo ✅ 配置文件已创建
) else (
    echo ✅ 配置文件已存在
)

cd ..
echo.

REM 配置前端
echo [3/4] 配置前端环境...
cd frontend

if not exist node_modules (
    echo 📦 安装前端依赖（这可能需要几分钟）...
    call npm install
)

cd ..
echo.

REM 测试 DeepSeek
echo [4/4] 测试 DeepSeek API 连接...
cd backend
call venv\Scripts\activate
python test_deepseek.py
cd ..
echo.

echo ════════════════════════════════════════
echo.
echo ✅ 配置完成！
echo.
echo 📱 下一步：
echo    1. 双击 "启动项目.bat" 启动服务
echo    2. 浏览器打开 http://localhost:5173
echo    3. 在"设置"中确认 DeepSeek 配置
echo    4. 开始使用 AI 对话功能
echo.
echo 💡 提示：你的 DeepSeek API Key 已自动配置
echo    API Key: sk-1203fb58062a43fdad35082e9b0aa8c3
echo.
pause



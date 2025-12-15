@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║      快速安装后端依赖                  ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM 激活虚拟环境
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate
) else (
    echo ❌ 虚拟环境不存在，正在创建...
    python -m venv venv
    call venv\Scripts\activate
)

echo 🔄 更新 pip...
python -m pip install --upgrade pip --quiet

echo.
echo 📦 安装核心依赖（跳过镜像源，直接从官方源安装）...
echo    这可能需要几分钟，请耐心等待...
echo.

REM 直接从官方源安装，避免镜像源超时
pip install flask==3.0.0 --quiet
pip install flask-cors==4.0.0 --quiet
pip install python-dotenv==1.0.0 --quiet
pip install requests==2.31.0 --quiet
pip install beautifulsoup4==4.12.3 --quiet

echo.
echo 🤖 安装 AI SDK（重要）...
pip install openai==1.54.0 --quiet
pip install anthropic==0.18.0 --quiet

echo.
echo 🌐 安装 Playwright...
pip install playwright==1.41.0 --quiet
playwright install chromium

echo.
echo ════════════════════════════════════════
echo ✅ 安装完成！
echo.
echo 💡 下一步：测试 DeepSeek
echo    python test_deepseek.py
echo.
pause



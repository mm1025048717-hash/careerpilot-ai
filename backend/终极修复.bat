@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║      终极修复 - OpenAI SDK            ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 🔧 激活虚拟环境...
call venv\Scripts\activate

echo.
echo 🗑️  清理旧版本...
pip uninstall -y openai 2>nul

echo.
echo 📦 安装最新版 OpenAI SDK...
echo    （不指定版本，让 pip 自动选择最新稳定版）
pip install openai --upgrade

echo.
echo ✅ 安装完成！
echo.
echo 📊 检查安装的版本...
python -c "import openai; print(f'OpenAI SDK 版本: {openai.__version__}')"

echo.
echo 🧪 测试 DeepSeek 连接...
echo.
python test_deepseek.py

echo.
pause



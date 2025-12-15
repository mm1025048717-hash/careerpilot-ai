@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║      重新安装 Python 依赖              ║
echo ╚════════════════════════════════════════╝
echo.
echo 🔄 正在重新安装依赖（修复 OpenAI SDK 版本问题）...
echo.

call venv\Scripts\activate
pip uninstall -y openai
pip install openai==1.54.0 -i https://pypi.tuna.tsinghua.edu.cn/simple

echo.
echo ✅ 依赖更新完成！
echo.
echo 💡 现在可以测试 DeepSeek 了：
echo    python test_deepseek.py
echo.
pause



@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
title 首次安装 - 浏览器自动化环境

echo ╔═══════════════════════════════════════════════════════════╗
echo ║          首次使用必须运行此脚本                           ║
echo ║          安装 Playwright 浏览器                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

call venv\Scripts\activate

echo [1/2] 安装 Playwright...
pip install playwright -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

echo.
echo [2/2] 下载 Chromium 浏览器 (这一步可能需要几分钟)...
playwright install chromium

echo.
echo ════════════════════════════════════════════════════════════
echo   ✅ 安装完成！
echo.
echo   现在你可以运行 "真·全自动运行.bat" 启动系统了
echo ════════════════════════════════════════════════════════════
pause



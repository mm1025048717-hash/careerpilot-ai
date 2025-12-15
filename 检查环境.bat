@echo off
chcp 65001 >nul
title 环境检查

echo ╔════════════════════════════════════════╗
echo ║      BOSS直聘数字员工 - 环境检查      ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/5] 检查Python版本...
python --version 2>nul
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    echo    请访问 https://www.python.org/downloads/ 下载安装
    goto :error
) else (
    echo ✅ Python已安装
)
echo.

echo [2/5] 检查Node.js版本...
node --version 2>nul
if errorlevel 1 (
    echo ❌ Node.js未安装或未添加到PATH
    echo    请访问 https://nodejs.org/ 下载安装
    goto :error
) else (
    echo ✅ Node.js已安装
)
echo.

echo [3/5] 检查npm版本...
npm --version 2>nul
if errorlevel 1 (
    echo ❌ npm未安装
    goto :error
) else (
    echo ✅ npm已安装
)
echo.

echo [4/5] 检查后端依赖...
if exist backend\venv (
    echo ✅ 后端虚拟环境已创建
) else (
    echo ⚠️  后端虚拟环境未创建
    echo    请运行: backend\setup_env.bat
)
echo.

echo [5/5] 检查前端依赖...
if exist frontend\node_modules (
    echo ✅ 前端依赖已安装
) else (
    echo ⚠️  前端依赖未安装
    echo    请进入 frontend 目录运行: npm install
)
echo.

echo ════════════════════════════════════════
echo.
echo ✅ 环境检查完成！
echo.
echo 下一步：
echo   1. 如果后端虚拟环境未创建，运行: backend\setup_env.bat
echo   2. 如果前端依赖未安装，运行: cd frontend ^&^& npm install
echo   3. 配置API Key（在前端"设置"页面）
echo   4. 双击"启动项目.bat"开始使用
echo.
goto :end

:error
echo.
echo ════════════════════════════════════════
echo.
echo ❌ 环境检查失败，请先安装缺失的软件
echo.
echo 需要的软件：
echo   - Python 3.8+ : https://www.python.org/downloads/
echo   - Node.js 18+ : https://nodejs.org/
echo.

:end
pause


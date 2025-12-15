@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║      BOSS直聘数字员工 - 环境配置      ║
echo ╚════════════════════════════════════════╝
echo.

REM 检查是否有虚拟环境
if not exist venv (
    echo 🔧 创建虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ 创建虚拟环境失败，请检查Python是否正确安装
        pause
        exit /b 1
    )
)

REM 激活虚拟环境
echo 📦 激活虚拟环境...
call venv\Scripts\activate
if errorlevel 1 (
    echo ❌ 激活虚拟环境失败
    pause
    exit /b 1
)

REM 升级pip
echo 🔄 升级pip...
python -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple

REM 安装依赖
echo 📥 安装依赖包...
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
if errorlevel 1 (
    echo ❌ 安装依赖失败
    pause
    exit /b 1
)

REM 安装Playwright浏览器
echo 🌐 安装Playwright浏览器...
playwright install chromium
if errorlevel 1 (
    echo ⚠️  安装浏览器失败，但依赖包已安装
    echo    首次使用时会自动下载浏览器
)

echo.
echo ✅ 环境配置完成！
echo.
echo 下一步：
echo   1. 复制 .env.example 为 .env
echo   2. 编辑 .env 填写你的API Key
echo   3. 运行 run.bat 启动服务
echo.
pause


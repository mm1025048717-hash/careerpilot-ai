@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在安装 LangChain Agent 框架...

:: 清除可能的代理设置
set HTTP_PROXY=
set HTTPS_PROXY=

call venv\Scripts\activate

:: 尝试直接安装
pip install langchain langchain-openai --trusted-host pypi.org --trusted-host files.pythonhosted.org

if errorlevel 1 (
    echo 直接安装失败，尝试使用阿里云镜像...
    pip install langchain langchain-openai -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
)

echo.
echo ✅ 安装完成！
pause


# PowerShell 安装脚本
# 使用方法：在 PowerShell 中运行 .\setup_env.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BOSS直聘数字员工 - 环境配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python
Write-Host "[1/5] 检查 Python..." -ForegroundColor Yellow
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python 未安装" -ForegroundColor Red
    Write-Host "   请访问 https://www.python.org/downloads/ 下载安装" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 创建虚拟环境
Write-Host "[2/5] 创建虚拟环境..." -ForegroundColor Yellow
if (!(Test-Path "venv")) {
    & python -m venv venv
    Write-Host "✅ 虚拟环境创建成功" -ForegroundColor Green
} else {
    Write-Host "✅ 虚拟环境已存在" -ForegroundColor Green
}
Write-Host ""

# 激活虚拟环境并安装依赖
Write-Host "[3/5] 安装 Python 依赖..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
& python -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
& pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
Write-Host "✅ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 安装 Playwright
Write-Host "[4/5] 安装 Playwright 浏览器..." -ForegroundColor Yellow
& playwright install chromium
Write-Host "✅ Playwright 安装完成" -ForegroundColor Green
Write-Host ""

# 检查 .env 文件
Write-Host "[5/5] 检查配置文件..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env 文件不存在" -ForegroundColor Yellow
    Write-Host "   请复制 .env.example 为 .env 并填入你的 API Key" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env 文件已存在" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 环境配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "  1. 确保 .env 文件中填入了 DeepSeek API Key" -ForegroundColor White
Write-Host "  2. 运行 '.\run.bat' 或 '.\run.ps1' 启动后端" -ForegroundColor White
Write-Host "  3. 在前端配置 AI 服务" -ForegroundColor White
Write-Host ""
pause



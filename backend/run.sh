#!/bin/bash

echo "========================================"
echo "  BOSS直聘数字员工 - 后端服务"
echo "========================================"
echo ""

if [ ! -d "venv" ]; then
    echo "🔧 首次运行，正在创建虚拟环境..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 正在安装依赖..."
    pip install -r requirements.txt
    playwright install chromium
else
    source venv/bin/activate
fi

echo ""
echo "🚀 启动后端服务..."
echo ""
python app.py



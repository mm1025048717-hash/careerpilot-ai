#!/bin/bash

echo "========================================"
echo "  安装Python依赖"
echo "========================================"
echo ""

# 检查Python版本
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
echo "检测到Python版本: $python_version"

# 检查是否有虚拟环境
if [ ! -d "venv" ]; then
    echo "🔧 创建虚拟环境..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ 创建虚拟环境失败，请检查Python是否正确安装"
        exit 1
    fi
fi

# 激活虚拟环境
echo "📦 激活虚拟环境..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ 激活虚拟环境失败"
    exit 1
fi

# 升级pip
echo "🔄 升级pip..."
python -m pip install --upgrade pip

# 安装依赖
echo "📥 安装依赖包..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ 安装依赖失败"
    exit 1
fi

# 安装Playwright浏览器
echo "🌐 安装Playwright浏览器..."
playwright install chromium
if [ $? -ne 0 ]; then
    echo "⚠️  安装浏览器失败，但依赖包已安装"
    echo "   首次使用时会自动下载浏览器"
fi

echo ""
echo "✅ 环境配置完成！"
echo ""
echo "下一步："
echo "  1. 复制 .env.example 为 .env"
echo "  2. 编辑 .env 填写你的API Key"
echo "  3. 运行 ./run.sh 启动服务"
echo ""



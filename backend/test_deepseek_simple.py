"""
简化版 DeepSeek 测试脚本
兼容所有 OpenAI SDK 版本
"""

print('🧪 测试 DeepSeek API...\n')

try:
    from openai import OpenAI
    
    # 使用你的 API Key
    client = OpenAI(
        api_key='sk-1203fb58062a43fdad35082e9b0aa8c3',
        base_url='https://api.deepseek.com'
    )
    
    print('📡 发送测试请求...')
    
    response = client.chat.completions.create(
        model='deepseek-chat',
        messages=[
            {'role': 'user', 'content': '你好，用一句话介绍你自己'}
        ],
        max_tokens=100
    )
    
    print('\n✅ 连接成功！\n')
    print('AI 回复：')
    print('-' * 60)
    print(response.choices[0].message.content)
    print('-' * 60)
    print(f'\n💰 Token 使用：{response.usage.total_tokens} tokens')
    print(f'💵 费用：约 ¥{response.usage.total_tokens * 0.000001:.6f}')
    print('\n🎉 DeepSeek 配置成功！可以正常使用了！')
    
except ImportError as e:
    print(f'❌ 导入错误：{e}')
    print('\n请运行：pip install openai')
    
except Exception as e:
    print(f'❌ 连接失败：{e}')
    print('\n请检查：')
    print('  1. API Key 是否正确')
    print('  2. 网络连接是否正常')
    print('  3. DeepSeek 账户余额是否充足')

input('\n按 Enter 键退出...')



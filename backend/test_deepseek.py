"""
测试 DeepSeek API 连接
使用前请先设置环境变量或直接填入 API Key
"""

import os
from openai import OpenAI

def test_deepseek_connection():
    """测试 DeepSeek API 基础连接"""
    print('🧪 测试 DeepSeek API 连接...\n')
    
    # 从环境变量获取 API Key，或使用硬编码（仅测试用）
    api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-1203fb58062a43fdad35082e9b0aa8c3')
    
    try:
        client = OpenAI(
            api_key=api_key,
            base_url='https://api.deepseek.com'
        )
        
        print('📡 发送测试请求...')
        response = client.chat.completions.create(
            model='deepseek-chat',
            messages=[
                {'role': 'system', 'content': '你是一个专业的求职助手，帮助用户找工作。'},
                {'role': 'user', 'content': '你好，请简单介绍一下你的功能。'}
            ],
            stream=False
        )
        
        print('✅ 连接成功！\n')
        print('AI 回复：')
        print('-' * 60)
        print(response.choices[0].message.content)
        print('-' * 60)
        print(f'\n📊 使用情况：')
        print(f'   - 模型：{response.model}')
        print(f'   - 输入 tokens：{response.usage.prompt_tokens}')
        print(f'   - 输出 tokens：{response.usage.completion_tokens}')
        print(f'   - 总计 tokens：{response.usage.total_tokens}')
        print(f'   - 预计费用：¥{response.usage.total_tokens * 0.000001:.6f}')
        
        return True
        
    except Exception as e:
        print(f'❌ 连接失败：{e}\n')
        print('请检查：')
        print('  1. API Key 是否正确')
        print('  2. 网络连接是否正常')
        print('  3. DeepSeek 服务是否可用')
        print('  4. 账户余额是否充足')
        return False


def test_job_scenario():
    """测试求职场景对话"""
    print('\n\n🎯 测试求职场景...\n')
    
    api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-1203fb58062a43fdad35082e9b0aa8c3')
    
    try:
        client = OpenAI(
            api_key=api_key,
            base_url='https://api.deepseek.com'
        )
        
        scenarios = [
            {
                'title': '生成 HR 回复',
                'system': '你是一个求职者，需要礼貌专业地回复 HR 的消息。',
                'user': 'HR 说："您好，看了您的简历，想邀请您明天下午3点来面试，方便吗？" 请帮我生成一个合适的回复。'
            },
            {
                'title': '优化简历描述',
                'system': '你是一个简历优化专家。',
                'user': '我的项目经验：做了一个电商网站。请帮我优化成更专业的描述。'
            },
            {
                'title': '解析求职意图',
                'system': '你是一个意图识别助手，将用户需求转换为结构化参数。',
                'user': '帮我投递北京的前端开发岗位，薪资15-25K，工作经验3年以上。只返回JSON格式：{"intent":"apply","city":"","position":"","salary":"","experience":""}'
            }
        ]
        
        for i, scenario in enumerate(scenarios, 1):
            print(f'[{i}/{len(scenarios)}] {scenario["title"]}')
            print('-' * 60)
            
            response = client.chat.completions.create(
                model='deepseek-chat',
                messages=[
                    {'role': 'system', 'content': scenario['system']},
                    {'role': 'user', 'content': scenario['user']}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            print(f'回复：{response.choices[0].message.content}')
            print(f'Tokens：{response.usage.total_tokens}\n')
        
        print('✅ 场景测试完成！DeepSeek 可以很好地处理求职场景。')
        return True
        
    except Exception as e:
        print(f'❌ 场景测试失败：{e}')
        return False


def test_streaming():
    """测试流式输出"""
    print('\n\n📡 测试流式输出...\n')
    
    api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-1203fb58062a43fdad35082e9b0aa8c3')
    
    try:
        client = OpenAI(
            api_key=api_key,
            base_url='https://api.deepseek.com'
        )
        
        print('AI 回复（流式）：')
        print('-' * 60)
        
        stream = client.chat.completions.create(
            model='deepseek-chat',
            messages=[
                {'role': 'user', 'content': '用一句话介绍 BOSS 直聘数字员工的功能。'}
            ],
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                print(chunk.choices[0].delta.content, end='', flush=True)
        
        print('\n' + '-' * 60)
        print('✅ 流式输出测试成功！')
        return True
        
    except Exception as e:
        print(f'❌ 流式输出测试失败：{e}')
        return False


if __name__ == '__main__':
    print('╔════════════════════════════════════════╗')
    print('║    DeepSeek API 测试工具              ║')
    print('╚════════════════════════════════════════╝\n')
    
    # 测试1：基础连接
    test1 = test_deepseek_connection()
    
    if test1:
        # 测试2：求职场景
        test2 = test_job_scenario()
        
        # 测试3：流式输出
        test3 = test_streaming()
        
        print('\n\n' + '=' * 60)
        print('📊 测试总结：')
        print(f'   - 基础连接：{"✅ 通过" if test1 else "❌ 失败"}')
        print(f'   - 求职场景：{"✅ 通过" if test2 else "❌ 失败"}')
        print(f'   - 流式输出：{"✅ 通过" if test3 else "❌ 失败"}')
        print('=' * 60)
        
        if test1 and test2 and test3:
            print('\n🎉 所有测试通过！DeepSeek API 配置正确，可以正常使用。')
            print('\n下一步：')
            print('  1. 在前端"设置"页面配置 DeepSeek')
            print('  2. 开始使用 AI 对话功能')
            print('  3. 尝试自动投递和回复')
        else:
            print('\n⚠️  部分测试失败，请检查配置。')
    else:
        print('\n❌ 基础连接测试失败，请先解决连接问题。')
    
    print('\n💡 提示：这个测试脚本可以随时运行来检查 DeepSeek API 状态。')



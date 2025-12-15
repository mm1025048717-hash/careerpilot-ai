"""
AI服务模块
支持多个AI提供商：OpenAI、Anthropic、DeepSeek等
"""

import os
from typing import Optional, Dict, List
import openai
import anthropic
import requests


class AIService:
    """AI服务统一接口"""
    
    def __init__(self, provider: str = 'openai', 
                 api_key: Optional[str] = None,
                 api_endpoint: Optional[str] = None,
                 model: Optional[str] = None):
        """
        初始化AI服务
        
        Args:
            provider: AI提供商 (openai/anthropic/deepseek/custom)
            api_key: API密钥
            api_endpoint: API端点（自定义时使用）
            model: 模型名称
        """
        self.provider = provider.lower()
        self.api_key = api_key or os.getenv(f'{provider.upper()}_API_KEY')
        self.model = model or self._get_default_model()
        self.api_endpoint = api_endpoint
        
        if not self.api_key:
            raise ValueError(f'未设置 {provider} API Key')
        
        # 初始化客户端（使用新版 OpenAI SDK）
        if self.provider == 'openai':
            self.client = openai.OpenAI(
                api_key=self.api_key,
                base_url=api_endpoint
            )
        elif self.provider == 'anthropic':
            self.client = anthropic.Anthropic(api_key=self.api_key)
        elif self.provider == 'deepseek':
            self.client = openai.OpenAI(
                api_key=self.api_key,
                base_url=api_endpoint or 'https://api.deepseek.com'
            )
    
    def _get_default_model(self) -> str:
        """获取默认模型"""
        defaults = {
            'openai': 'gpt-4',
            'anthropic': 'claude-3-5-sonnet-20241022',
            'deepseek': 'deepseek-chat',  # DeepSeek-V3.2 非思考模式
            'custom': 'gpt-3.5-turbo'
        }
        return defaults.get(self.provider, 'gpt-3.5-turbo')
    
    def chat(self, messages: List[Dict[str, str]], 
             temperature: float = 0.7,
             max_tokens: int = 2000) -> str:
        """
        发送对话请求
        
        Args:
            messages: 对话历史，格式：[{"role": "user", "content": "..."}]
            temperature: 温度参数
            max_tokens: 最大token数
            
        Returns:
            AI回复内容
        """
        try:
            if self.provider == 'anthropic':
                return self._chat_anthropic(messages, temperature, max_tokens)
            else:
                return self._chat_openai_compatible(messages, temperature, max_tokens)
        except Exception as e:
            raise Exception(f'AI服务调用失败: {str(e)}')
    
    def _chat_openai_compatible(self, messages: List[Dict], 
                                temperature: float,
                                max_tokens: int) -> str:
        """OpenAI兼容的对话接口（OpenAI、DeepSeek等）"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    
    def _chat_anthropic(self, messages: List[Dict],
                       temperature: float,
                       max_tokens: int) -> str:
        """Anthropic Claude对话接口"""
        # Claude需要将system消息分离
        system_message = None
        claude_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                claude_messages.append(msg)
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_message,
            messages=claude_messages
        )
        return response.content[0].text
    
    def parse_intent(self, user_message: str) -> Dict:
        """
        解析用户意图
        
        识别用户想要执行的操作类型：
        - apply: 投递简历
        - reply: 回复消息
        - update_resume: 更新简历
        - query: 查询信息
        """
        prompt = f"""分析用户的需求，识别意图类型和参数。

用户消息: {user_message}

请以JSON格式返回，包含以下字段：
- intent: 意图类型 (apply/reply/update_resume/query/other)
- params: 相关参数（如城市、岗位、薪资范围等）
- confidence: 置信度 (0-1)

只返回JSON，不要其他内容。"""

        messages = [
            {"role": "system", "content": "你是一个智能求职助手，擅长理解用户的求职需求。"},
            {"role": "user", "content": prompt}
        ]
        
        response = self.chat(messages, temperature=0.3, max_tokens=500)
        
        # 解析JSON响应
        import json
        try:
            # 尝试提取JSON（去除可能的markdown标记）
            response = response.strip()
            if response.startswith('```'):
                response = response.split('```')[1]
                if response.startswith('json'):
                    response = response[4:]
            return json.loads(response.strip())
        except:
            return {
                'intent': 'other',
                'params': {},
                'confidence': 0.5
            }
    
    def generate_reply(self, hr_message: str, 
                      resume_info: Optional[Dict] = None) -> str:
        """
        生成对HR消息的回复
        
        Args:
            hr_message: HR发送的消息
            resume_info: 简历信息（可选）
            
        Returns:
            AI生成的回复内容
        """
        system_prompt = """你是一个专业的求职者，正在与HR沟通。
请根据HR的消息生成合适的回复：
- 礼貌、专业
- 简洁明了
- 体现出对职位的兴趣
- 如果是面试邀请，表示感谢并确认时间
"""
        
        user_prompt = f"HR说: {hr_message}\n\n请生成一个合适的回复（100字以内）："
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        return self.chat(messages, temperature=0.7, max_tokens=200)
    
    def optimize_resume(self, resume_text: str, job_description: str) -> str:
        """
        针对特定职位优化简历
        
        Args:
            resume_text: 原始简历内容
            job_description: 职位描述
            
        Returns:
            优化后的简历建议
        """
        prompt = f"""请分析以下简历和职位描述，给出简历优化建议：

职位描述:
{job_description}

当前简历:
{resume_text}

请提供：
1. 需要强调的技能和经验
2. 可以删减的内容
3. 需要补充的信息
4. 关键词优化建议
"""
        
        messages = [
            {"role": "system", "content": "你是一个资深的简历优化顾问。"},
            {"role": "user", "content": prompt}
        ]
        
        return self.chat(messages, temperature=0.7, max_tokens=1500)


def test_ai_service():
    """测试AI服务"""
    print('🧪 测试AI服务模块...\n')
    
    # 注意：需要设置环境变量 OPENAI_API_KEY
    try:
        ai = AIService(provider='openai')
        
        # 测试对话
        print('1️⃣ 测试基本对话:')
        response = ai.chat([
            {"role": "user", "content": "你好，请介绍一下自己"}
        ])
        print(f'AI: {response}\n')
        
        # 测试意图识别
        print('2️⃣ 测试意图识别:')
        intent = ai.parse_intent("帮我投递北京的Python开发岗位，薪资20-30K")
        print(f'意图: {intent}\n')
        
        # 测试回复生成
        print('3️⃣ 测试回复生成:')
        reply = ai.generate_reply("您好，看了您的简历，想邀请您明天下午3点来面试，方便吗？")
        print(f'回复: {reply}\n')
        
        print('✅ 测试完成')
        
    except Exception as e:
        print(f'❌ 测试失败: {e}')
        print('\n💡 提示: 请确保已设置环境变量 OPENAI_API_KEY')


if __name__ == '__main__':
    test_ai_service()


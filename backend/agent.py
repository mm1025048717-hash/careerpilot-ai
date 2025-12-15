"""
智职通 CareerPilot AI - DeepSeek + Agent 双重架构
简化版本 - 不依赖复杂的 LangChain Agent
"""
import json
import os
from typing import Dict, List, Any
from openai import OpenAI

# 导入记忆和知识库模块
from memory import conversation_manager, memory_system
from knowledge_base import knowledge_base


def load_config():
    """加载用户配置"""
    config_path = os.path.join(os.path.dirname(__file__), 'user_config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


class SemanticUnderstanding:
    """语义理解层 - 使用 DeepSeek 进行深度语义分析"""
    
    def __init__(self):
        config = load_config()
        self.api_key = config.get('deepseekApiKey', os.getenv('DEEPSEEK_API_KEY', ''))
        self.base_url = config.get('deepseekBaseUrl', 'https://api.deepseek.com')
    
    def _get_llm(self):
        return OpenAI(api_key=self.api_key, base_url=self.base_url)
    
    def understand(self, user_input: str, conversation_history: List[Dict] = None, user_profile: str = "") -> Dict:
        """深度理解用户输入"""
        config = load_config()
        llm = self._get_llm()
        
        system_prompt = f"""你是一个语义理解专家。分析用户输入并提取结构化信息。

用户画像：{user_profile}

用户配置：
- 姓名：{config.get('name', '未知')}
- 目标城市：{config.get('targetCity', '北京')}
- 目标岗位：{config.get('targetRole', '')}
- 期望薪资：{config.get('salary', '')}

请分析用户输入，返回JSON格式：
{{
    "intent": "意图类型: apply_job/search_job/optimize_resume/interview_prep/general_chat/knowledge_query/preference_update",
    "entities": {{
        "keyword": "职位关键词（如有）",
        "city": "城市（如有，否则用默认）",
        "count": "数量（默认5）"
    }},
    "sentiment": "情感: positive/negative/neutral",
    "confidence": 0.9
}}

只返回JSON，不要其他内容。"""

        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            for msg in conversation_history[-6:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
        messages.append({"role": "user", "content": user_input})
        
        try:
            response = llm.chat.completions.create(model="deepseek-chat", messages=messages, temperature=0)
            result_text = response.choices[0].message.content.strip()
            
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            return json.loads(result_text)
        except Exception as e:
            print(f"语义理解出错: {e}")
            return {"intent": "general_chat", "entities": {}, "sentiment": "neutral", "confidence": 0.5}


class TaskExecutor:
    """任务执行层"""
    
    def __init__(self):
        self.tasks_file = os.path.join(os.path.dirname(__file__), 'user_tasks.json')
    
    def execute_apply_task(self, keyword: str, city: str, count: int = 5) -> Dict:
        """创建投递任务"""
        import uuid
        from datetime import datetime
        
        task = {
            "id": str(uuid.uuid4()),
            "type": "apply",
            "keyword": keyword,
            "city": city,
            "count": count,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "progress": 0
        }
        
        tasks = self._load_tasks()
        tasks.append(task)
        self._save_tasks(tasks)
        
        return {"success": True, "task_id": task["id"], "message": f"已创建投递任务：在{city}投递{count}个{keyword}岗位", "task": task}
    
    def search_knowledge(self, query: str, doc_type: str = None) -> str:
        """搜索知识库"""
        context = knowledge_base.get_context_for_ai(query, doc_type)
        return context if context else "知识库中没有找到相关信息"
    
    def update_preference(self, key: str, value: Any) -> Dict:
        """更新用户偏好"""
        memory_system.update_preference(key, value)
        return {"success": True, "message": f"已记住你的偏好：{key} = {value}"}
    
    def _load_tasks(self) -> List[Dict]:
        if os.path.exists(self.tasks_file):
            with open(self.tasks_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def _save_tasks(self, tasks: List[Dict]):
        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)


class DualAgent:
    """双重架构 Agent - 结合语义理解和任务执行"""
    
    def __init__(self):
        self.semantic = SemanticUnderstanding()
        self.executor = TaskExecutor()
    
    def _get_llm(self):
        config = load_config()
        return OpenAI(
            api_key=config.get('deepseekApiKey', os.getenv('DEEPSEEK_API_KEY', '')),
            base_url=config.get('deepseekBaseUrl', 'https://api.deepseek.com')
        )
    
    def run(self, user_input: str, conversation_id: str = None) -> str:
        """运行双重架构处理"""
        result = self.run_with_details(user_input, conversation_id)
        return result.get("response", "抱歉，我无法处理这个请求。")
    
    def run_with_details(self, user_input: str, conversation_id: str = None) -> Dict:
        """运行并返回详细结果"""
        try:
            # 获取对话历史
            history = []
            if conversation_id:
                history = conversation_manager.get_messages(conversation_id)
            
            # 获取用户画像
            user_profile = memory_system.get_user_profile_summary()
            
            # 第一层：语义理解
            understanding = self.semantic.understand(user_input, history, user_profile)
            print(f"语义理解结果: {understanding}")
            
            # 第二层：根据意图执行任务
            task_created = None
            intent = understanding.get("intent", "general_chat")
            entities = understanding.get("entities", {})
            
            # 处理投递任务
            if intent == "apply_job":
                config = load_config()
                keyword = entities.get("keyword") or config.get("targetRole", "产品经理")
                city = entities.get("city") or config.get("targetCity", "北京")
                count = int(entities.get("count", 5))
                
                task_result = self.executor.execute_apply_task(keyword, city, count)
                task_created = task_result.get("task")
            
            # 生成回复
            response = self._generate_response(user_input, understanding, history, task_created)
            
            # 生成智能推荐（问题和动作）
            suggestions = self._generate_suggestions(user_input, understanding, task_created)
            
            # 保存对话
            if conversation_id:
                conversation_manager.add_message(conversation_id, "user", user_input)
                conversation_manager.add_message(conversation_id, "assistant", response)
            
            return {
                "response": response,
                "understanding": understanding,
                "task_created": task_created,
                "suggestions": suggestions
            }
            
        except Exception as e:
            print(f"Agent 执行出错: {e}")
            import traceback
            traceback.print_exc()
            return {
                "response": f"抱歉，处理请求时出错了：{str(e)}",
                "understanding": {},
                "task_created": None
            }
    
    def _generate_response(self, user_input: str, understanding: Dict, history: List[Dict], task_created: Dict = None) -> str:
        """生成自然语言回复"""
        try:
            llm = self._get_llm()
            config = load_config()
            
            # 构建上下文
            context_parts = []
            
            if task_created:
                context_parts.append(f"[已创建任务] 类型: {task_created.get('type')}, 关键词: {task_created.get('keyword')}, 城市: {task_created.get('city')}, 数量: {task_created.get('count')}")
            
            # 获取知识库上下文
            kb_context = knowledge_base.get_context_for_ai(user_input)
            if kb_context:
                context_parts.append(f"[知识库] {kb_context[:500]}")
            
            system_prompt = f"""你是智职通AI助手，一个专业友好的求职顾问。

用户信息：
- 姓名：{config.get('name', '用户')}
- 目标城市：{config.get('targetCity', '北京')}
- 目标岗位：{config.get('targetRole', '')}

语义理解结果：{json.dumps(understanding, ensure_ascii=False)}

{chr(10).join(context_parts) if context_parts else ''}

请根据以上信息，用友好专业的语气回复用户。如果已创建任务，请确认并说明后续步骤。回复请简洁明了，使用中文。"""

            messages = [{"role": "system", "content": system_prompt}]
            
            # 添加对话历史
            for msg in history[-4:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
            messages.append({"role": "user", "content": user_input})
            
            response = llm.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"生成回复出错: {e}")
            
            # 降级回复
            if task_created:
                return f"好的，我已经为你创建了投递任务！将在{task_created.get('city')}投递{task_created.get('count')}个{task_created.get('keyword')}岗位。任务正在后台执行中，你可以在「任务」页面查看进度。"
            
            return "收到你的消息了！有什么我可以帮你的吗？"
    
    def _generate_suggestions(self, user_input: str, understanding: Dict, task_created: Dict = None) -> Dict:
        """根据用户意图生成智能推荐"""
        config = load_config()
        intent = understanding.get("intent", "general_chat")
        entities = understanding.get("entities", {})
        
        # 获取用户配置
        user_name = config.get("name", "用户")
        target_city = config.get("targetCity", "北京")
        target_role = config.get("targetRole", "产品经理")
        
        # 推荐问题列表
        questions = []
        # 推荐动作列表
        actions = []
        
        # 根据意图动态生成推荐
        if task_created:
            # 刚创建任务后的推荐
            questions = [
                f"查看其他城市的{target_role}岗位",
                "帮我优化简历",
                "查看任务进度"
            ]
            actions = [
                {"label": "📊 查看任务", "type": "navigate", "target": "tasks"},
                {"label": f"🔍 搜索更多{target_role}", "type": "send", "message": f"帮我搜索更多{target_role}岗位"}
            ]
        elif intent == "apply_job":
            # 投递相关
            keyword = entities.get("keyword", target_role)
            city = entities.get("city", target_city)
            questions = [
                f"帮我投递{city}的{keyword}岗位",
                f"搜索深圳的{keyword}岗位",
                f"推荐高薪{keyword}职位"
            ]
            actions = [
                {"label": f"🚀 立即投递 {keyword}", "type": "send", "message": f"帮我投递{city}的{keyword}岗位，投5个"},
                {"label": "📝 优化简历", "type": "send", "message": "帮我优化简历"}
            ]
        elif intent == "search_job":
            # 搜索相关
            questions = [
                f"帮我投递{target_city}的岗位",
                "推荐互联网大厂的职位",
                "查看最新的招聘信息"
            ]
            actions = [
                {"label": "🔍 开始搜索", "type": "send", "message": f"搜索{target_city}的{target_role}岗位"},
                {"label": "📋 查看知识库", "type": "navigate", "target": "knowledge"}
            ]
        elif intent == "optimize_resume":
            # 简历优化
            questions = [
                "帮我分析简历的不足",
                "推荐简历模板",
                "如何突出我的项目经验"
            ]
            actions = [
                {"label": "📤 上传简历", "type": "upload", "target": "resume"},
                {"label": "💡 获取建议", "type": "send", "message": "给我一些简历优化的具体建议"}
            ]
        elif intent == "interview_prep":
            # 面试准备
            questions = [
                f"{target_role}常见面试问题",
                "如何回答职业规划问题",
                "薪资谈判技巧"
            ]
            actions = [
                {"label": "📚 面试题库", "type": "send", "message": f"给我一些{target_role}的面试问题"},
                {"label": "🎯 模拟面试", "type": "send", "message": "帮我模拟一次面试"}
            ]
        else:
            # 通用推荐
            questions = [
                f"帮我投递{target_city}的{target_role}岗位",
                "帮我优化简历",
                "推荐一些高薪职位",
                "面试准备建议"
            ]
            actions = [
                {"label": f"🚀 快速投递", "type": "send", "message": f"帮我投递{target_city}的{target_role}，投5个"},
                {"label": "⚙️ 修改偏好", "type": "navigate", "target": "settings"}
            ]
        
        return {
            "questions": questions[:4],  # 最多4个问题
            "actions": actions[:3]  # 最多3个动作
        }


# 全局实例
dual_agent = DualAgent()


def run_agent(user_input: str, conversation_id: str = None) -> str:
    """运行 Agent（兼容旧接口）"""
    return dual_agent.run(user_input, conversation_id)


def run_agent_with_details(user_input: str, conversation_id: str = None) -> Dict:
    """运行 Agent 并返回详细结果"""
    return dual_agent.run_with_details(user_input, conversation_id)


def parse_user_intent(user_input: str) -> Dict:
    """解析用户意图（供 Worker 使用）"""
    config = load_config()
    
    # 简单解析
    result = {
        "keyword": config.get("targetRole", "产品经理"),
        "city": config.get("targetCity", "北京"),
        "count": 5
    }
    
    # 尝试从输入中提取信息
    import re
    
    # 提取城市
    cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "苏州"]
    for city in cities:
        if city in user_input:
            result["city"] = city
            break
    
    # 提取数量
    count_match = re.search(r'(\d+)\s*(个|份)', user_input)
    if count_match:
        result["count"] = int(count_match.group(1))
    
    # 提取关键词（简单逻辑）
    keywords = ["产品经理", "前端", "后端", "全栈", "运营", "设计", "测试", "数据分析", "算法", "Java", "Python"]
    for kw in keywords:
        if kw.lower() in user_input.lower():
            result["keyword"] = kw
            break
    
    return result


def execute_apply_task(keyword: str, city: str, count: int) -> int:
    """执行投递任务（供 Worker 使用）"""
    try:
        from boss_automation import BossAutomation
        
        config = load_config()
        
        bot = BossAutomation(
            keywords=keyword,
            city=city,
            phone=config.get('phone', ''),
            max_apply=count
        )
        
        # 执行投递
        applied_count = bot.run()
        return applied_count
        
    except Exception as e:
        print(f"执行投递失败: {e}")
        import traceback
        traceback.print_exc()
        return 0

    def understand(self, 
                   user_input: str, 
                   conversation_history: List[Dict] = None,
                   user_profile: str = "") -> Dict:
        """
        深度理解用户输入
        
        返回:
        {
            "intent": "apply_job",
            "entities": {"keyword": "产品经理", "city": "北京"},
            "sentiment": "neutral",
            "context_needs": ["resume", "job_preferences"],
            "suggested_action": "执行投递任务",
            "response_tone": "professional"
        }
        """
        config = load_config()
        llm = self._get_llm()
        
        system_prompt = f"""你是一个语义理解专家。分析用户输入并提取结构化信息。

用户画像：
{user_profile}

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
        "count": "数量（默认5）",
        "other": "其他实体"
    }},
    "sentiment": "情感: positive/negative/neutral",
    "context_needs": ["需要的上下文信息列表"],
    "confidence": 0.9,
    "clarification_needed": false,
    "clarification_question": ""
}}

只返回JSON，不要其他内容。"""

        # 构建消息历史
        messages = [{"role": "system", "content": system_prompt}]
        
        # 添加最近的对话历史
        if conversation_history:
            for msg in conversation_history[-6:]:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        messages.append({"role": "user", "content": user_input})
        
        try:
            response = llm.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                temperature=0
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # 解析JSON
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            return json.loads(result_text)
        
        except Exception as e:
            print(f"语义理解出错: {e}")
            return {
                "intent": "general_chat",
                "entities": {},
                "sentiment": "neutral",
                "confidence": 0.5
            }

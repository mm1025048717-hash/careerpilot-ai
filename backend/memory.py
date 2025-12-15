"""
长期记忆系统 - 用户偏好、习惯与上下文记忆
支持 DeepSeek + Agent 双重架构
"""
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import hashlib

MEMORY_DIR = os.path.join(os.path.dirname(__file__), 'data', 'memory')
CONVERSATIONS_DIR = os.path.join(os.path.dirname(__file__), 'data', 'conversations')

os.makedirs(MEMORY_DIR, exist_ok=True)
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)


class ConversationManager:
    """会话管理器 - 管理历史会话"""
    
    def __init__(self):
        self.conversations_file = os.path.join(CONVERSATIONS_DIR, 'conversations.json')
        self._ensure_file()
    
    def _ensure_file(self):
        if not os.path.exists(self.conversations_file):
            self._save_conversations([])
    
    def _load_conversations(self) -> List[Dict]:
        try:
            with open(self.conversations_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    
    def _save_conversations(self, conversations: List[Dict]):
        with open(self.conversations_file, 'w', encoding='utf-8') as f:
            json.dump(conversations, f, ensure_ascii=False, indent=2)
    
    def create_conversation(self, title: str = "新对话") -> Dict:
        """创建新会话"""
        conversations = self._load_conversations()
        
        conv_id = hashlib.md5(f"{datetime.now().timestamp()}".encode()).hexdigest()[:12]
        
        new_conv = {
            "id": conv_id,
            "title": title,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "messages": [],
            "summary": "",
            "tags": []
        }
        
        conversations.insert(0, new_conv)
        self._save_conversations(conversations)
        
        return new_conv
    
    def get_conversation(self, conv_id: str) -> Optional[Dict]:
        """获取指定会话"""
        conversations = self._load_conversations()
        for conv in conversations:
            if conv['id'] == conv_id:
                return conv
        return None
    
    def list_conversations(self, limit: int = 50) -> List[Dict]:
        """列出所有会话"""
        conversations = self._load_conversations()
        # 返回简要信息，不含完整消息
        return [{
            "id": c['id'],
            "title": c['title'],
            "created_at": c['created_at'],
            "updated_at": c['updated_at'],
            "summary": c.get('summary', ''),
            "tags": c.get('tags', []),
            "message_count": len(c.get('messages', []))
        } for c in conversations[:limit]]
    
    def add_message(self, conv_id: str, role: str, content: str) -> bool:
        """添加消息到会话"""
        conversations = self._load_conversations()
        
        for conv in conversations:
            if conv['id'] == conv_id:
                conv['messages'].append({
                    "id": hashlib.md5(f"{datetime.now().timestamp()}".encode()).hexdigest()[:8],
                    "role": role,
                    "content": content,
                    "timestamp": datetime.now().isoformat()
                })
                conv['updated_at'] = datetime.now().isoformat()
                
                # 自动更新标题（基于第一条用户消息）
                if len(conv['messages']) == 1 and role == 'user':
                    conv['title'] = content[:30] + ('...' if len(content) > 30 else '')
                
                self._save_conversations(conversations)
                return True
        
        return False
    
    def update_conversation(self, conv_id: str, updates: Dict) -> bool:
        """更新会话信息"""
        conversations = self._load_conversations()
        
        for conv in conversations:
            if conv['id'] == conv_id:
                conv.update(updates)
                conv['updated_at'] = datetime.now().isoformat()
                self._save_conversations(conversations)
                return True
        
        return False
    
    def delete_conversation(self, conv_id: str) -> bool:
        """删除会话"""
        conversations = self._load_conversations()
        original_len = len(conversations)
        conversations = [c for c in conversations if c['id'] != conv_id]
        
        if len(conversations) < original_len:
            self._save_conversations(conversations)
            return True
        return False
    
    def get_recent_messages(self, conv_id: str, limit: int = 10) -> List[Dict]:
        """获取最近的消息"""
        conv = self.get_conversation(conv_id)
        if conv:
            return conv.get('messages', [])[-limit:]
        return []
    
    def get_messages(self, conv_id: str) -> List[Dict]:
        """获取会话的所有消息"""
        conv = self.get_conversation(conv_id)
        if conv:
            return conv.get('messages', [])
        return []


class MemorySystem:
    """长期记忆系统 - 用户偏好与习惯"""
    
    def __init__(self):
        self.memory_file = os.path.join(MEMORY_DIR, 'long_term_memory.json')
        self.context_file = os.path.join(MEMORY_DIR, 'context_memory.json')
        self._ensure_files()
    
    def _ensure_files(self):
        for f in [self.memory_file, self.context_file]:
            if not os.path.exists(f):
                with open(f, 'w', encoding='utf-8') as file:
                    json.dump({}, file)
    
    def _load_memory(self, file_path: str) -> Dict:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    
    def _save_memory(self, file_path: str, data: Dict):
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    # ========== 长期记忆 ==========
    
    def remember(self, key: str, value: Any, category: str = "general"):
        """存储长期记忆"""
        memory = self._load_memory(self.memory_file)
        
        if category not in memory:
            memory[category] = {}
        
        memory[category][key] = {
            "value": value,
            "created_at": datetime.now().isoformat(),
            "access_count": 0
        }
        
        self._save_memory(self.memory_file, memory)
    
    def recall(self, key: str, category: str = "general") -> Optional[Any]:
        """回忆长期记忆"""
        memory = self._load_memory(self.memory_file)
        
        if category in memory and key in memory[category]:
            # 增加访问计数
            memory[category][key]['access_count'] += 1
            memory[category][key]['last_accessed'] = datetime.now().isoformat()
            self._save_memory(self.memory_file, memory)
            return memory[category][key]['value']
        
        return None
    
    def get_all_memories(self, category: Optional[str] = None) -> Dict:
        """获取所有记忆"""
        memory = self._load_memory(self.memory_file)
        
        if category:
            return memory.get(category, {})
        return memory
    
    def forget(self, key: str, category: str = "general") -> bool:
        """删除记忆"""
        memory = self._load_memory(self.memory_file)
        
        if category in memory and key in memory[category]:
            del memory[category][key]
            self._save_memory(self.memory_file, memory)
            return True
        return False
    
    # ========== 上下文记忆 ==========
    
    def set_context(self, key: str, value: Any, ttl_hours: int = 24):
        """设置上下文（短期记忆，有过期时间）"""
        context = self._load_memory(self.context_file)
        
        context[key] = {
            "value": value,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now().timestamp() + ttl_hours * 3600)
        }
        
        self._save_memory(self.context_file, context)
    
    def get_context(self, key: str) -> Optional[Any]:
        """获取上下文"""
        context = self._load_memory(self.context_file)
        
        if key in context:
            item = context[key]
            # 检查是否过期
            if item.get('expires_at', 0) > datetime.now().timestamp():
                return item['value']
            else:
                # 已过期，删除
                del context[key]
                self._save_memory(self.context_file, context)
        
        return None
    
    def get_all_context(self) -> Dict:
        """获取所有有效上下文"""
        context = self._load_memory(self.context_file)
        now = datetime.now().timestamp()
        
        # 过滤过期的
        valid = {k: v['value'] for k, v in context.items() 
                 if v.get('expires_at', 0) > now}
        
        return valid
    
    def clear_expired_context(self):
        """清理过期上下文"""
        context = self._load_memory(self.context_file)
        now = datetime.now().timestamp()
        
        valid = {k: v for k, v in context.items() 
                 if v.get('expires_at', 0) > now}
        
        self._save_memory(self.context_file, valid)
    
    # ========== 用户偏好 ==========
    
    def update_preference(self, pref_key: str, pref_value: Any):
        """更新用户偏好"""
        self.remember(pref_key, pref_value, category="preferences")
    
    def get_preference(self, pref_key: str, default: Any = None) -> Any:
        """获取用户偏好"""
        result = self.recall(pref_key, category="preferences")
        return result if result is not None else default
    
    def get_all_preferences(self) -> Dict:
        """获取所有偏好"""
        prefs = self.get_all_memories(category="preferences")
        return {k: v['value'] for k, v in prefs.items()}
    
    # ========== 用户习惯学习 ==========
    
    def learn_habit(self, action: str, details: Dict):
        """学习用户习惯"""
        memory = self._load_memory(self.memory_file)
        
        if "habits" not in memory:
            memory["habits"] = {}
        
        if action not in memory["habits"]:
            memory["habits"][action] = {
                "count": 0,
                "details": [],
                "first_seen": datetime.now().isoformat()
            }
        
        memory["habits"][action]["count"] += 1
        memory["habits"][action]["last_seen"] = datetime.now().isoformat()
        memory["habits"][action]["details"].append({
            **details,
            "timestamp": datetime.now().isoformat()
        })
        
        # 只保留最近20条
        memory["habits"][action]["details"] = memory["habits"][action]["details"][-20:]
        
        self._save_memory(self.memory_file, memory)
    
    def get_habits(self) -> Dict:
        """获取用户习惯"""
        memory = self._load_memory(self.memory_file)
        return memory.get("habits", {})
    
    # ========== 智能摘要 ==========
    
    def generate_user_profile(self) -> str:
        """生成用户画像（供AI使用）"""
        prefs = self.get_all_preferences()
        habits = self.get_habits()
        context = self.get_all_context()
        
        profile_parts = []
        
        if prefs:
            profile_parts.append("【用户偏好】")
            for k, v in prefs.items():
                profile_parts.append(f"- {k}: {v}")
        
        if habits:
            profile_parts.append("\n【用户习惯】")
            for action, data in habits.items():
                profile_parts.append(f"- {action}: 执行{data['count']}次")
        
        if context:
            profile_parts.append("\n【当前上下文】")
            for k, v in context.items():
                profile_parts.append(f"- {k}: {v}")
        
        return "\n".join(profile_parts) if profile_parts else "暂无用户画像数据"
    
    def get_user_profile_summary(self) -> str:
        """获取用户画像摘要（别名）"""
        return self.generate_user_profile()


# 单例实例
conversation_manager = ConversationManager()
memory_system = MemorySystem()



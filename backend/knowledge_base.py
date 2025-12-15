"""
个人知识库管理系统
支持多种文档类型的存储、检索和管理
"""
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import hashlib

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'knowledge')
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)


class KnowledgeBase:
    """个人知识库"""
    
    DOC_TYPES = ['note', 'resume', 'job', 'reference', 'template', 'experience']
    
    def __init__(self):
        self.index_file = os.path.join(KNOWLEDGE_DIR, 'index.json')
        self._ensure_index()
    
    def _ensure_index(self):
        if not os.path.exists(self.index_file):
            self._save_index([])
    
    def _load_index(self) -> List[Dict]:
        try:
            with open(self.index_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    
    def _save_index(self, index: List[Dict]):
        with open(self.index_file, 'w', encoding='utf-8') as f:
            json.dump(index, f, ensure_ascii=False, indent=2)
    
    def _get_doc_path(self, doc_id: str) -> str:
        return os.path.join(KNOWLEDGE_DIR, f"{doc_id}.json")
    
    def add_document(self, 
                     title: str, 
                     content: str, 
                     doc_type: str = 'note',
                     tags: List[str] = None) -> Dict:
        """添加文档"""
        if doc_type not in self.DOC_TYPES:
            doc_type = 'note'
        
        doc_id = hashlib.md5(f"{title}{datetime.now().timestamp()}".encode()).hexdigest()[:12]
        
        doc = {
            "id": doc_id,
            "title": title,
            "content": content,
            "type": doc_type,
            "tags": tags or [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "word_count": len(content),
            "summary": content[:100] + "..." if len(content) > 100 else content
        }
        
        # 保存文档内容
        with open(self._get_doc_path(doc_id), 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        
        # 更新索引
        index = self._load_index()
        index_entry = {k: v for k, v in doc.items() if k != 'content'}
        index.insert(0, index_entry)
        self._save_index(index)
        
        return doc
    
    def get_document(self, doc_id: str) -> Optional[Dict]:
        """获取文档详情"""
        doc_path = self._get_doc_path(doc_id)
        if os.path.exists(doc_path):
            with open(doc_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def list_documents(self, doc_type: str = None, limit: int = 50) -> List[Dict]:
        """列出文档"""
        index = self._load_index()
        
        if doc_type:
            index = [d for d in index if d.get('type') == doc_type]
        
        return index[:limit]
    
    def update_document(self, doc_id: str, updates: Dict) -> bool:
        """更新文档"""
        doc = self.get_document(doc_id)
        if not doc:
            return False
        
        # 更新文档
        for key in ['title', 'content', 'tags']:
            if key in updates:
                doc[key] = updates[key]
        
        doc['updated_at'] = datetime.now().isoformat()
        doc['word_count'] = len(doc.get('content', ''))
        doc['summary'] = doc['content'][:100] + "..." if len(doc.get('content', '')) > 100 else doc.get('content', '')
        
        # 保存
        with open(self._get_doc_path(doc_id), 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        
        # 更新索引
        index = self._load_index()
        for i, entry in enumerate(index):
            if entry['id'] == doc_id:
                index[i] = {k: v for k, v in doc.items() if k != 'content'}
                break
        self._save_index(index)
        
        return True
    
    def delete_document(self, doc_id: str) -> bool:
        """删除文档"""
        doc_path = self._get_doc_path(doc_id)
        
        if os.path.exists(doc_path):
            os.remove(doc_path)
        
        index = self._load_index()
        original_len = len(index)
        index = [d for d in index if d['id'] != doc_id]
        
        if len(index) < original_len:
            self._save_index(index)
            return True
        return False
    
    def search(self, query: str, doc_type: str = None) -> List[Dict]:
        """搜索文档"""
        index = self._load_index()
        query_lower = query.lower()
        
        results = []
        for doc in index:
            if doc_type and doc.get('type') != doc_type:
                continue
            
            # 搜索标题、摘要、标签
            if (query_lower in doc.get('title', '').lower() or
                query_lower in doc.get('summary', '').lower() or
                any(query_lower in tag.lower() for tag in doc.get('tags', []))):
                results.append(doc)
        
        return results
    
    def get_context_for_ai(self, query: str, doc_type: str = None) -> str:
        """获取相关文档作为 AI 上下文"""
        results = self.search(query, doc_type)
        
        if not results:
            return ""
        
        context_parts = []
        for doc in results[:3]:  # 最多3个
            full_doc = self.get_document(doc['id'])
            if full_doc:
                context_parts.append(f"【{doc['title']}】\n{full_doc.get('content', '')[:500]}")
        
        return "\n\n".join(context_parts)


# 单例实例
knowledge_base = KnowledgeBase()

# 导出文档类型
DOC_TYPES = KnowledgeBase.DOC_TYPES


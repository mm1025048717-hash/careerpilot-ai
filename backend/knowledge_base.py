"""
个人知识库系统 - 文档管理与检索
支持简历、笔记、职位信息等
"""
import os
import json
import hashlib
from datetime import datetime
from typing import Optional, List, Dict, Any

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'knowledge')
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)


class KnowledgeBase:
    """个人知识库"""
    
    def __init__(self):
        self.index_file = os.path.join(KNOWLEDGE_DIR, 'index.json')
        self.docs_dir = os.path.join(KNOWLEDGE_DIR, 'documents')
        os.makedirs(self.docs_dir, exist_ok=True)
        self._ensure_index()
    
    def _ensure_index(self):
        if not os.path.exists(self.index_file):
            self._save_index({"documents": [], "tags": {}, "categories": {}})
    
    def _load_index(self) -> Dict:
        try:
            with open(self.index_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {"documents": [], "tags": {}, "categories": {}}
    
    def _save_index(self, index: Dict):
        with open(self.index_file, 'w', encoding='utf-8') as f:
            json.dump(index, f, ensure_ascii=False, indent=2)
    
    def add_document(self, 
                     title: str, 
                     content: str, 
                     doc_type: str = "note",
                     tags: List[str] = None,
                     metadata: Dict = None) -> Dict:
        """
        添加文档到知识库
        
        Args:
            title: 文档标题
            content: 文档内容
            doc_type: 类型 (note/resume/job/reference)
            tags: 标签列表
            metadata: 额外元数据
        """
        doc_id = hashlib.md5(f"{title}{datetime.now().timestamp()}".encode()).hexdigest()[:12]
        
        doc = {
            "id": doc_id,
            "title": title,
            "type": doc_type,
            "tags": tags or [],
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "word_count": len(content),
            "summary": content[:200] + "..." if len(content) > 200 else content
        }
        
        # 保存完整内容到单独文件
        content_file = os.path.join(self.docs_dir, f"{doc_id}.json")
        with open(content_file, 'w', encoding='utf-8') as f:
            json.dump({
                "id": doc_id,
                "content": content,
                "created_at": doc['created_at']
            }, f, ensure_ascii=False, indent=2)
        
        # 更新索引
        index = self._load_index()
        index["documents"].insert(0, doc)
        
        # 更新标签索引
        for tag in (tags or []):
            if tag not in index["tags"]:
                index["tags"][tag] = []
            index["tags"][tag].append(doc_id)
        
        # 更新分类索引
        if doc_type not in index["categories"]:
            index["categories"][doc_type] = []
        index["categories"][doc_type].append(doc_id)
        
        self._save_index(index)
        
        return doc
    
    def get_document(self, doc_id: str) -> Optional[Dict]:
        """获取文档完整内容"""
        content_file = os.path.join(self.docs_dir, f"{doc_id}.json")
        
        if not os.path.exists(content_file):
            return None
        
        try:
            with open(content_file, 'r', encoding='utf-8') as f:
                content_data = json.load(f)
            
            # 合并索引信息
            index = self._load_index()
            for doc in index["documents"]:
                if doc["id"] == doc_id:
                    return {**doc, "content": content_data["content"]}
            
            return content_data
        except:
            return None
    
    def list_documents(self, 
                       doc_type: str = None, 
                       tag: str = None, 
                       limit: int = 50) -> List[Dict]:
        """列出文档（不含完整内容）"""
        index = self._load_index()
        docs = index["documents"]
        
        if doc_type:
            type_ids = set(index["categories"].get(doc_type, []))
            docs = [d for d in docs if d["id"] in type_ids]
        
        if tag:
            tag_ids = set(index["tags"].get(tag, []))
            docs = [d for d in docs if d["id"] in tag_ids]
        
        return docs[:limit]
    
    def update_document(self, doc_id: str, updates: Dict) -> bool:
        """更新文档"""
        index = self._load_index()
        
        for doc in index["documents"]:
            if doc["id"] == doc_id:
                # 更新内容
                if "content" in updates:
                    content_file = os.path.join(self.docs_dir, f"{doc_id}.json")
                    with open(content_file, 'r+', encoding='utf-8') as f:
                        content_data = json.load(f)
                        content_data["content"] = updates["content"]
                        content_data["updated_at"] = datetime.now().isoformat()
                        f.seek(0)
                        json.dump(content_data, f, ensure_ascii=False, indent=2)
                        f.truncate()
                    
                    doc["word_count"] = len(updates["content"])
                    doc["summary"] = updates["content"][:200] + "..."
                    del updates["content"]
                
                # 更新元数据
                doc.update(updates)
                doc["updated_at"] = datetime.now().isoformat()
                
                self._save_index(index)
                return True
        
        return False
    
    def delete_document(self, doc_id: str) -> bool:
        """删除文档"""
        index = self._load_index()
        
        # 从索引中移除
        original_len = len(index["documents"])
        index["documents"] = [d for d in index["documents"] if d["id"] != doc_id]
        
        if len(index["documents"]) < original_len:
            # 从标签索引中移除
            for tag, ids in index["tags"].items():
                index["tags"][tag] = [i for i in ids if i != doc_id]
            
            # 从分类索引中移除
            for cat, ids in index["categories"].items():
                index["categories"][cat] = [i for i in ids if i != doc_id]
            
            self._save_index(index)
            
            # 删除内容文件
            content_file = os.path.join(self.docs_dir, f"{doc_id}.json")
            if os.path.exists(content_file):
                os.remove(content_file)
            
            return True
        
        return False
    
    def search(self, query: str, limit: int = 10) -> List[Dict]:
        """简单关键词搜索"""
        index = self._load_index()
        results = []
        query_lower = query.lower()
        
        for doc in index["documents"]:
            score = 0
            
            # 标题匹配（权重高）
            if query_lower in doc["title"].lower():
                score += 10
            
            # 摘要匹配
            if query_lower in doc.get("summary", "").lower():
                score += 5
            
            # 标签匹配
            for tag in doc.get("tags", []):
                if query_lower in tag.lower():
                    score += 3
            
            if score > 0:
                results.append({**doc, "_score": score})
        
        # 按分数排序
        results.sort(key=lambda x: x["_score"], reverse=True)
        
        return results[:limit]
    
    def get_all_tags(self) -> List[str]:
        """获取所有标签"""
        index = self._load_index()
        return list(index["tags"].keys())
    
    def get_statistics(self) -> Dict:
        """获取知识库统计"""
        index = self._load_index()
        
        return {
            "total_documents": len(index["documents"]),
            "by_type": {k: len(v) for k, v in index["categories"].items()},
            "total_tags": len(index["tags"]),
            "popular_tags": sorted(
                [(tag, len(ids)) for tag, ids in index["tags"].items()],
                key=lambda x: x[1],
                reverse=True
            )[:10]
        }
    
    def get_context_for_ai(self, query: str = "", limit: int = 5) -> str:
        """
        生成供AI使用的知识库上下文
        """
        relevant_docs = []
        
        if query:
            relevant_docs = self.search(query, limit=limit)
        else:
            # 获取最近的文档
            relevant_docs = self.list_documents(limit=limit)
        
        if not relevant_docs:
            return ""
        
        context_parts = ["【个人知识库相关内容】"]
        
        for doc in relevant_docs:
            full_doc = self.get_document(doc["id"])
            if full_doc:
                context_parts.append(f"\n## {full_doc['title']} ({full_doc['type']})")
                context_parts.append(full_doc.get('content', full_doc.get('summary', ''))[:500])
        
        return "\n".join(context_parts)


# 预设文档类型
DOC_TYPES = {
    "note": "笔记",
    "resume": "简历",
    "job": "职位信息",
    "reference": "参考资料",
    "template": "模板",
    "experience": "经历"
}

# 单例实例
knowledge_base = KnowledgeBase()



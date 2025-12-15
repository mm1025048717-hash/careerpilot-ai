"""
BOSS直聘数字员工 - 后端API
增强版：支持会话管理、知识库、长期记忆

架构：
├─ /api/chat - 智能对话（双重架构Agent）
├─ /api/conversations - 会话历史管理
├─ /api/knowledge - 个人知识库
├─ /api/memory - 长期记忆与偏好
├─ /api/config - 用户配置
└─ /api/tasks - 任务管理
"""
import os
import json
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
CORS(app)

# ============ 配置 ============
CONFIG_FILE = 'user_config.json'
TASKS_FILE = 'user_tasks.json'
UPLOAD_FOLDER = 'uploads'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ============ 导入核心模块 ============
from ai_service import AIService
from memory import conversation_manager, memory_system
from knowledge_base import knowledge_base, DOC_TYPES
from agent import dual_agent, run_agent_with_details

# AI 服务初始化
try:
    ai_service = AIService(
        provider='deepseek',
        api_key=os.getenv('DEEPSEEK_API_KEY'),
        api_endpoint=os.getenv('DEEPSEEK_API_BASE'),
        model='deepseek-chat'
    )
    print('✅ AI 服务初始化成功')
except Exception as e:
    print(f'⚠️ AI 服务初始化失败: {e}')
    ai_service = None

# ============ 工具函数 ============
def load_json(f, d): 
    try: 
        return json.load(open(f, 'r', encoding='utf-8')) if os.path.exists(f) else d
    except: 
        return d

def save_json(f, d): 
    json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

def create_task(task_type, title, desc, extra=None):
    tasks = load_json(TASKS_FILE, [])
    t = {
        'id': str(uuid.uuid4())[:8],
        'type': task_type,
        'status': 'pending',
        'title': title,
        'description': desc,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'progress': 0,
        'log': '等待执行...',
        **(extra or {})
    }
    tasks.insert(0, t)
    save_json(TASKS_FILE, tasks)
    return t

def extract_resume(path):
    try:
        import pdfplumber, docx, pypdf
        _, ext = os.path.splitext(path)
        ext = ext.lower().replace('.', '')
        text = ""
        if ext == 'pdf':
            try:
                with pdfplumber.open(path) as pdf:
                    for p in pdf.pages: 
                        text += (p.extract_text() or "") + "\n"
            except: 
                pass
            if not text.strip():
                try:
                    for p in pypdf.PdfReader(path).pages: 
                        text += (p.extract_text() or "") + "\n"
                except: 
                    pass
        elif ext in ['docx', 'doc']:
            for p in docx.Document(path).paragraphs: 
                text += p.text + "\n"
        elif ext in ['txt', 'md']:
            text = open(path, 'r', encoding='utf-8').read()
        return text.strip() if text.strip() else "(无法解析)"
    except Exception as e:
        return f"(解析错误: {e})"

# ============ 配置 API ============
@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    if request.method == 'GET':
        return jsonify(load_json(CONFIG_FILE, {}))
    config = load_json(CONFIG_FILE, {})
    config.update(request.json)
    save_json(CONFIG_FILE, config)
    return jsonify({'message': '保存成功'})

# ============ 任务 API ============
@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'GET':
        return jsonify(load_json(TASKS_FILE, []))
    d = request.json
    t = create_task(
        d.get('type', 'apply'), 
        d.get('title', '新任务'), 
        d.get('description', ''),
        d.get('extra')
    )
    return jsonify(t)

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_json(TASKS_FILE, [])
    tasks = [t for t in tasks if t['id'] != task_id]
    save_json(TASKS_FILE, tasks)
    return jsonify({'message': '删除成功'})

# ============ 简历上传 API ============
@app.route('/api/resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': '无文件'}), 400
    file = request.files['file']
    filename = secure_filename(file.filename) or "resume.pdf"
    path = os.path.join(UPLOAD_FOLDER, f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}")
    file.save(path)
    content = extract_resume(path)
    
    # 保存到配置
    config = load_json(CONFIG_FILE, {})
    config.update({
        'resume_path': path, 
        'resume_name': file.filename, 
        'resume_content': content[:3000]
    })
    save_json(CONFIG_FILE, config)
    
    # 同时添加到知识库
    knowledge_base.add_document(
        title=f"简历 - {file.filename}",
        content=content,
        doc_type="resume",
        tags=["简历", "个人资料"]
    )
    
    return jsonify({'message': '上传成功', 'parsed': '无法解析' not in content})

# ============ 会话管理 API ============
@app.route('/api/conversations', methods=['GET', 'POST'])
def handle_conversations():
    if request.method == 'GET':
        limit = request.args.get('limit', 50, type=int)
        conversations = conversation_manager.list_conversations(limit)
        return jsonify(conversations)
    
    # 创建新会话
    title = request.json.get('title', '新对话')
    conv = conversation_manager.create_conversation(title)
    return jsonify(conv)

@app.route('/api/conversations/<conv_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_conversation(conv_id):
    if request.method == 'GET':
        conv = conversation_manager.get_conversation(conv_id)
        if conv:
            return jsonify(conv)
        return jsonify({'error': '会话不存在'}), 404
    
    elif request.method == 'PUT':
        updates = request.json
        success = conversation_manager.update_conversation(conv_id, updates)
        return jsonify({'success': success})
    
    elif request.method == 'DELETE':
        success = conversation_manager.delete_conversation(conv_id)
        return jsonify({'success': success})

# ============ 知识库 API ============
@app.route('/api/knowledge', methods=['GET', 'POST'])
def handle_knowledge():
    if request.method == 'GET':
        doc_type = request.args.get('type')
        tag = request.args.get('tag')
        limit = request.args.get('limit', 50, type=int)
        docs = knowledge_base.list_documents(doc_type, tag, limit)
        return jsonify(docs)
    
    # 添加文档
    data = request.json
    doc = knowledge_base.add_document(
        title=data.get('title', '未命名'),
        content=data.get('content', ''),
        doc_type=data.get('type', 'note'),
        tags=data.get('tags', []),
        metadata=data.get('metadata')
    )
    return jsonify(doc)

@app.route('/api/knowledge/<doc_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_knowledge_doc(doc_id):
    if request.method == 'GET':
        doc = knowledge_base.get_document(doc_id)
        if doc:
            return jsonify(doc)
        return jsonify({'error': '文档不存在'}), 404
    
    elif request.method == 'PUT':
        updates = request.json
        success = knowledge_base.update_document(doc_id, updates)
        return jsonify({'success': success})
    
    elif request.method == 'DELETE':
        success = knowledge_base.delete_document(doc_id)
        return jsonify({'success': success})

@app.route('/api/knowledge/search', methods=['GET'])
def search_knowledge():
    query = request.args.get('q', '')
    limit = request.args.get('limit', 10, type=int)
    results = knowledge_base.search(query, limit)
    return jsonify(results)

@app.route('/api/knowledge/stats', methods=['GET'])
def knowledge_stats():
    stats = knowledge_base.get_statistics()
    return jsonify(stats)

@app.route('/api/knowledge/types', methods=['GET'])
def knowledge_types():
    return jsonify(DOC_TYPES)

@app.route('/api/knowledge/tags', methods=['GET'])
def knowledge_tags():
    tags = knowledge_base.get_all_tags()
    return jsonify(tags)

# ============ 记忆系统 API ============
@app.route('/api/memory', methods=['GET'])
def get_memory():
    """获取用户画像"""
    profile = memory_system.generate_user_profile()
    memories = memory_system.get_all_memories()
    preferences = memory_system.get_all_preferences()
    habits = memory_system.get_habits()
    
    return jsonify({
        'profile': profile,
        'memories': memories,
        'preferences': preferences,
        'habits': habits
    })

@app.route('/api/memory/preferences', methods=['GET', 'POST'])
def handle_preferences():
    if request.method == 'GET':
        return jsonify(memory_system.get_all_preferences())
    
    # 更新偏好
    data = request.json
    for key, value in data.items():
        memory_system.update_preference(key, value)
    return jsonify({'message': '偏好已更新'})

@app.route('/api/memory/context', methods=['GET', 'POST'])
def handle_context():
    if request.method == 'GET':
        return jsonify(memory_system.get_all_context())
    
    # 设置上下文
    data = request.json
    key = data.get('key')
    value = data.get('value')
    ttl = data.get('ttl_hours', 24)
    
    if key and value:
        memory_system.set_context(key, value, ttl)
        return jsonify({'message': '上下文已设置'})
    return jsonify({'error': '缺少参数'}), 400

# ============ 智能对话 API (双重架构) ============
@app.route('/api/chat', methods=['POST'])
def chat():
    """智能对话 - 使用双重架构Agent"""
    msg = request.json.get('message', '')
    conv_id = request.json.get('conversation_id')
    
    if not msg:
        return jsonify({'error': '空消息'}), 400
    
    # 如果没有指定会话，创建新会话
    if not conv_id:
        conv = conversation_manager.create_conversation()
        conv_id = conv['id']
    
    try:
        # 使用双重架构Agent处理
        result = run_agent_with_details(msg, conv_id)
        
        response = result.get('response', '无回复')
        task_created = result.get('task_created')
        
        # 如果需要创建任务
        if task_created:
            task = create_task(
                task_created.get('type', 'apply'),
                f"投递-{task_created.get('keyword', '未知')}",
                f"城市：{task_created.get('city', '未知')}，数量：{task_created.get('count', 5)}",
                {'keyword': task_created.get('keyword'), 'city': task_created.get('city'), 'count': task_created.get('count')}
            )
            response += f"\n\n✅ 任务已创建 (ID: {task['id']})\n\n**请确保 Worker 窗口正在运行，任务将自动执行。**"
        
        return jsonify({
            'reply': response,
            'conversation_id': conv_id,
            'understanding': result.get('understanding'),
            'suggestions': result.get('suggestions', [])
        })
        
    except Exception as e:
        print(f"对话处理错误: {e}")
        import traceback
        traceback.print_exc()
        
        # 降级到简单模式
        if ai_service:
            try:
                config = load_json(CONFIG_FILE, {})
                system = f'''你是BOSS直聘求职助手。用户：{config.get('name', '用户')}'''
                history = [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': msg}
                ]
                reply = ai_service.chat(history)
                return jsonify({'reply': reply, 'conversation_id': conv_id})
            except:
                pass
        
        return jsonify({'reply': f'处理出错: {e}', 'conversation_id': conv_id})

# ============ 健康检查 ============
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'features': {
            'ai_service': ai_service is not None,
            'conversations': True,
            'knowledge_base': True,
            'memory_system': True,
            'dual_architecture': True
        }
    })

# ============ 启动 ============
if __name__ == '__main__':
    print()
    print("=" * 60)
    print("  BOSS直聘数字员工 - 增强版 API 服务")
    print("=" * 60)
    print()
    print("✨ 新功能:")
    print("   - 会话历史管理")
    print("   - 个人知识库")
    print("   - 长期记忆系统")
    print("   - DeepSeek + Agent 双重架构")
    print()
    print("⚠️  注意：这只是API服务器")
    print("    真正的任务执行需要另开窗口运行 worker.py")
    print()
    app.run(host='0.0.0.0', port=5000, debug=True)

"""
任务执行器 Worker
监控任务队列，使用 Agent 执行任务
"""
import time
import json
import os

TASKS_FILE = os.path.join(os.path.dirname(__file__), 'user_tasks.json')
CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'user_config.json')

def load_json(filepath, default):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return default
    return default

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_task(task_id, **kwargs):
    tasks = load_json(TASKS_FILE, [])
    for t in tasks:
        if t['id'] == task_id:
            t.update(kwargs)
            break
    save_json(TASKS_FILE, tasks)

def main():
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║           BOSS直聘数字员工 - Worker 执行器                ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print("║  当你通过 AI 对话创建任务后，我会自动执行                  ║")
    print("║  请保持这个窗口运行                                       ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    
    # 导入执行模块
    try:
        from agent import run_agent, execute_apply_task, parse_user_intent
        print("✅ Agent 模块已加载")
    except Exception as e:
        print(f"❌ Agent 加载失败: {e}")
        return
    
    print("👀 正在监视任务队列...\n")
    
    while True:
        try:
            tasks = load_json(TASKS_FILE, [])
            pending = next((t for t in tasks if t['status'] == 'pending'), None)
            
            if pending:
                task_id = pending['id']
                title = pending.get('title', '')
                desc = pending.get('description', '')
                
                print()
                print("═" * 60)
                print(f"🚀 发现新任务!")
                print(f"   标题: {title}")
                print(f"   描述: {desc}")
                print("═" * 60)
                
                update_task(task_id, status='running', progress=10, log='正在解析任务...')
                
                # 组合标题和描述作为用户输入
                user_input = f"{title} {desc}"
                
                try:
                    # 使用 Agent 执行
                    print(f"\n💭 DeepSeek 解析用户意图...")
                    intent = parse_user_intent(user_input)
                    print(f"   → 关键词: {intent.get('keyword')}")
                    print(f"   → 城市: {intent.get('city')}")
                    print(f"   → 数量: {intent.get('count')}")
                    
                    update_task(task_id, progress=20, log=f"准备投递: {intent.get('keyword')} @ {intent.get('city')}")
                    
                    # 执行投递
                    def progress_callback(percent, msg):
                        real_percent = 20 + int(percent * 0.7)  # 20-90%
                        update_task(task_id, progress=real_percent, log=msg)
                    
                    result = execute_apply_task(
                        intent.get('keyword', ''),
                        intent.get('city', '北京'),
                        intent.get('count', 5)
                    )
                    
                    update_task(task_id, 
                              status='completed', 
                              progress=100, 
                              log=f'✅ 完成！成功投递 {result} 个职位')
                    
                    print()
                    print("═" * 60)
                    print(f"✅ 任务完成! 成功投递 {result} 个职位")
                    print("═" * 60)
                    
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    print(f"\n❌ 任务执行失败: {e}")
                    update_task(task_id, status='failed', log=f'失败: {str(e)}')
            
            time.sleep(2)  # 每2秒检查一次
            
        except KeyboardInterrupt:
            print("\n👋 Worker 已停止")
            break
        except Exception as e:
            print(f"⚠️ 监控出错: {e}")
            time.sleep(5)

if __name__ == '__main__':
    main()

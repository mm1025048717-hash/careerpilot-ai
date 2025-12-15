import { useState, useEffect } from 'react'

interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  title: string
  description: string
  created_at: string
  progress: number
  log: string
  keyword?: string
  city?: string
  count?: number
}

const STATUS_STYLES = {
  pending: { label: '等待中', bg: 'bg-amber-50 text-amber-600 border border-amber-100', icon: '⏳' },
  running: { label: '执行中', bg: 'bg-blue-50 text-blue-600 border border-blue-100', icon: '⚡' },
  completed: { label: '已完成', bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: '✅' },
  failed: { label: '失败', bg: 'bg-rose-50 text-rose-600 border border-rose-100', icon: '❌' }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks')
      const data = await res.json()
      setTasks(data)
      if (selectedTask) {
        const updated = data.find((t: Task) => t.id === selectedTask.id)
        if (updated) setSelectedTask(updated)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个任务吗？')) return
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
      if (selectedTask?.id === id) setSelectedTask(null)
    } catch (e) {
      console.error(e)
    }
  }

  const formatDate = (str: string) => {
    return new Date(str).toLocaleString('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="h-full flex bg-[#F5F5F7]">
      {/* 任务列表 */}
      <div className="w-[360px] flex flex-col bg-white border-r border-[#E5E5EA]">
        <div className="p-6 border-b border-[#F5F5F7]">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[20px] font-bold text-[#1D1D1F]">任务队列</h2>
            <span className="text-[12px] font-medium text-[#86868B] bg-[#F2F2F7] px-2.5 py-1 rounded-full">
              共 {tasks.length} 个
            </span>
          </div>
          <p className="text-[13px] text-[#86868B]">监控自动化流程执行状态</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="w-6 h-6 border-[3px] border-[#E5E5EA] border-t-[#007AFF] rounded-full animate-spin" />
             </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <p>暂无活跃任务</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-[18px] border cursor-pointer transition-all duration-200 ${
                  selectedTask?.id === task.id
                    ? 'bg-[#007AFF] border-[#007AFF] shadow-lg shadow-blue-500/20 transform scale-[1.02]'
                    : 'bg-white border-transparent hover:border-[#E5E5EA] hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[6px] ${
                    selectedTask?.id === task.id 
                      ? 'bg-white/20 text-white border border-white/10' 
                      : STATUS_STYLES[task.status].bg
                  }`}>
                    {STATUS_STYLES[task.status].label}
                  </span>
                  <span className={`text-[11px] font-medium ${
                    selectedTask?.id === task.id ? 'text-white/80' : 'text-[#86868B]'
                  }`}>
                    {formatDate(task.created_at)}
                  </span>
                </div>
                
                <h4 className={`text-[15px] font-semibold mb-1 truncate ${
                  selectedTask?.id === task.id ? 'text-white' : 'text-[#1D1D1F]'
                }`}>
                  {task.title}
                </h4>
                
                <p className={`text-[13px] line-clamp-1 mb-3.5 leading-relaxed ${
                  selectedTask?.id === task.id ? 'text-white/80' : 'text-[#86868B]'
                }`}>
                  {task.description}
                </p>

                {task.status === 'running' && (
                  <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/90 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                
                {selectedTask?.id !== task.id && (
                  <button 
                    onClick={(e) => handleDelete(task.id, e)}
                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 text-gray-400 hover:text-[#FF3B30] transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 详情视图 */}
      <div className="flex-1 bg-[#F5F5F7] flex flex-col p-6 overflow-hidden">
        {selectedTask ? (
          <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5EA] h-full flex flex-col overflow-hidden animate-scale">
            <div className="p-8 border-b border-[#F5F5F7] bg-white z-10">
              <div className="flex items-center gap-5 mb-2">
                <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-[28px] shadow-sm ${
                  STATUS_STYLES[selectedTask.status].bg.replace('text-', 'text-').replace('border', '')
                }`}>
                  {STATUS_STYLES[selectedTask.status].icon}
                </div>
                <div>
                  <h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">{selectedTask.title}</h2>
                  <p className="text-[13px] text-[#86868B] font-mono mt-1 flex items-center gap-2">
                    <span>ID: {selectedTask.id}</span>
                    <span className="w-1 h-1 bg-[#D1D1D6] rounded-full"></span>
                    <span>{formatDate(selectedTask.created_at)}</span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <InfoCard label="任务类型" value={selectedTask.type === 'apply' ? '投递简历' : selectedTask.type} />
                <InfoCard label="关键词" value={selectedTask.keyword || '-'} />
                <InfoCard label="目标城市" value={selectedTask.city || '-'} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {selectedTask.status === 'running' && (
                <div className="mb-8 bg-[#F9FAFB] p-5 rounded-[16px] border border-[#F2F2F7]">
                  <div className="flex justify-between text-[13px] font-medium mb-3">
                    <span className="text-[#1D1D1F]">执行进度</span>
                    <span className="text-[#007AFF]">{selectedTask.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] rounded-full transition-all duration-300 ease-out relative" 
                      style={{ width: `${selectedTask.progress}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%]" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                 <h3 className="text-[15px] font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                   <svg className="w-4 h-4 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                   </svg>
                   系统日志
                 </h3>
                 <div className="bg-[#1D1D1F] rounded-[16px] p-6 text-[#E5E5EA] font-mono text-[13px] leading-relaxed shadow-inner overflow-x-auto border border-black/10">
                   <pre>{selectedTask.log || '> 正在初始化任务...'}</pre>
                 </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#F5F5F7] bg-[#FAFBFC] flex justify-end">
              <button 
                onClick={(e) => handleDelete(selectedTask.id, e)}
                className="text-[#FF3B30] text-[14px] font-medium hover:bg-[#FF3B30]/10 px-5 py-2.5 rounded-[12px] transition-colors"
              >
                删除任务
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-[32px] mb-6 shadow-sm flex items-center justify-center border border-[#E5E5EA]">
              <span className="text-[40px]">⚡️</span>
            </div>
            <h3 className="text-[18px] font-semibold text-[#1D1D1F]">选择一个任务</h3>
            <p className="text-[14px] text-[#86868B] mt-2">查看详细日志和执行进度</p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-[#F9FAFB] p-3.5 rounded-[14px] border border-[#F2F2F7]">
      <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{value}</p>
    </div>
  )
}

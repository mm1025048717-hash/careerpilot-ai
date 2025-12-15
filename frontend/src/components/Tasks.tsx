import { useState, useEffect } from 'react'

interface Task {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  created_at: string
  result?: any
}

const STATUS_STYLES = {
  pending: { bg: 'bg-[#F5F5F7]', text: 'text-[#86868B]', label: '等待中' },
  running: { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', label: '执行中' },
  completed: { bg: 'bg-[#34C759]/10', text: 'text-[#34C759]', label: '已完成' },
  failed: { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]', label: '失败' }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks')
      const data = await res.json()
      setTasks(data)
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, { method: 'DELETE' })
      setTasks(tasks.filter(t => t.id !== taskId))
      if (selectedTask?.id === taskId) setSelectedTask(null)
    } catch (e) {
      console.error(e)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* 任务列表 */}
      <div className="w-[380px] flex-shrink-0 border-r border-[#F5F5F7] flex flex-col">
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-[#F5F5F7]">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">任务队列</h2>
            <p className="text-[12px] text-[#86868B] mt-0.5">{tasks.length} 个任务</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-[#86868B]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#C7C7CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-[14px] font-medium">暂无任务</p>
              <p className="text-[12px] mt-1">通过对话创建投递任务</p>
            </div>
          ) : (
            tasks.map(task => {
              const style = STATUS_STYLES[task.status]
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTask?.id === task.id 
                      ? 'border-[#007AFF]/30 bg-[#007AFF]/5 shadow-md' 
                      : 'border-[#E5E5EA] bg-white hover:border-[#007AFF]/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[14px] font-semibold text-[#1D1D1F] leading-tight">{task.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                  
                  <p className="text-[12px] text-[#86868B] mb-3 line-clamp-2">{task.description}</p>
                  
                  {task.status === 'running' && task.progress !== undefined && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#007AFF] to-[#0A84FF] rounded-full transition-all duration-500 relative"
                          style={{ width: `${task.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#86868B] mt-1 text-right">{task.progress}%</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#86868B]">{formatDate(task.created_at)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
                      className="text-[#FF3B30] hover:text-[#FF453A] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 任务详情 */}
      <div className="flex-1 flex flex-col">
        {selectedTask ? (
          <>
            <header className="h-[72px] flex items-center px-8 border-b border-[#F5F5F7]">
              <h2 className="text-[17px] font-semibold text-[#1D1D1F]">任务详情</h2>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${STATUS_STYLES[selectedTask.status].bg}`}>
                    {selectedTask.status === 'running' ? (
                      <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
                    ) : selectedTask.status === 'completed' ? (
                      <svg className="w-6 h-6 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : selectedTask.status === 'failed' ? (
                      <svg className="w-6 h-6 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-[#1D1D1F]">{selectedTask.title}</h3>
                    <p className="text-[13px] text-[#86868B]">创建于 {formatDate(selectedTask.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E5EA]">
                    <h4 className="text-[13px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">描述</h4>
                    <p className="text-[15px] text-[#1D1D1F] leading-relaxed">{selectedTask.description}</p>
                  </div>

                  {selectedTask.status === 'running' && selectedTask.progress !== undefined && (
                    <div className="p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E5EA]">
                      <h4 className="text-[13px] font-semibold text-[#86868B] uppercase tracking-wide mb-3">进度</h4>
                      <div className="h-3 bg-[#E5E5EA] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#007AFF] to-[#0A84FF] rounded-full transition-all duration-500"
                          style={{ width: `${selectedTask.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-[14px] font-semibold text-[#007AFF] mt-2">{selectedTask.progress}% 完成</p>
                    </div>
                  )}

                  {selectedTask.result && (
                    <div className="p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E5EA]">
                      <h4 className="text-[13px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">执行结果</h4>
                      <pre className="text-[13px] text-[#1D1D1F] whitespace-pre-wrap font-mono bg-white p-4 rounded-xl border border-[#E5E5EA]">
                        {JSON.stringify(selectedTask.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#86868B]">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#C7C7CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-[14px] font-medium">选择任务查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  summary: string
  tags: string[]
  message_count: number
}

interface HistoryProps {
  onSelectConversation: (convId: string) => void
  currentConversationId?: string
}

export default function History({ onSelectConversation, currentConversationId }: HistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/conversations')
      const data = await res.json()
      setConversations(data)
    } catch (e) {
      console.error('Failed to fetch conversations', e)
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' })
      })
      const conv = await res.json()
      setConversations(prev => [conv, ...prev])
      onSelectConversation(conv.id)
    } catch (e) {
      console.error('Failed to create conversation', e)
    }
  }

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个对话吗？')) return

    try {
      await fetch(`http://localhost:5000/api/conversations/${convId}`, {
        method: 'DELETE'
      })
      setConversations(prev => prev.filter(c => c.id !== convId))
    } catch (e) {
      console.error('Failed to delete', e)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = formatDate(conv.updated_at)
    if (!groups[date]) groups[date] = []
    groups[date].push(conv)
    return groups
  }, {} as Record<string, Conversation[]>)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-[#F5F5F7] sticky top-0 bg-white/90 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">历史会话</h2>
            <p className="text-[13px] text-[#86868B] font-medium mt-1">{conversations.length} 个对话</p>
          </div>
          <button
            onClick={createNewConversation}
            className="ios-btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            新对话
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-[#007AFF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F2F7] rounded-[12px] text-[15px] text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.1)] focus:outline-none transition-all duration-200"
          />
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-[3px] border-[#E5E5EA] border-t-[#007AFF] rounded-full animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
            <div className="w-16 h-16 bg-[#F5F5F7] rounded-[24px] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#86868B] text-[15px] font-medium">暂无对话记录</p>
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            {Object.entries(groupedConversations).map(([date, convs], groupIdx) => (
              <div key={date} className="animate-slide-up" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                <h3 className="text-[13px] font-semibold text-[#86868B] uppercase tracking-wide px-4 mb-3 sticky top-0 bg-white/95 backdrop-blur py-2 z-10">
                  {date}
                </h3>
                <div className="space-y-2">
                  {convs.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className={`group relative p-4 rounded-[18px] transition-all duration-200 cursor-pointer border ${currentConversationId === conv.id
                        ? 'bg-[#007AFF]/5 border-[#007AFF]/20 shadow-sm'
                        : 'bg-white border-transparent hover:bg-[#F5F5F7]'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-[16px] font-semibold truncate pr-8 transition-colors ${currentConversationId === conv.id ? 'text-[#007AFF]' : 'text-[#1D1D1F]'
                          }`}>
                          {conv.title || '未命名对话'}
                        </h4>

                        <button
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-all absolute right-3 top-3"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-[14px] text-[#86868B] line-clamp-2 leading-relaxed mb-3">
                        {conv.summary || '暂无摘要...'}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-[12px] text-[#86868B] bg-[#F2F2F7] px-2 py-1 rounded-[6px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          {conv.message_count}
                        </span>
                        {conv.tags?.map((tag, i) => (
                          <span key={i} className="text-[12px] text-[#007AFF] bg-[#007AFF]/10 px-2 py-1 rounded-[6px] font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

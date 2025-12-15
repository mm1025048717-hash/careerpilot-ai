import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface Action {
  label: string
  type: 'send' | 'navigate' | 'upload'
  message?: string
  target?: string
}

interface Suggestions {
  questions: string[]
  actions: Action[]
}

interface ChatProps {
  conversationId?: string
  onConversationChange: (convId: string) => void
  onNavigate?: (target: string) => void
}

export default function Chat({ conversationId, onConversationChange, onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [userConfig, setUserConfig] = useState<any>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/config')
      .then(res => res.json())
      .then(setUserConfig)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    } else {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: generateWelcomeMessage()
      }])
    }
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateWelcomeMessage = () => {
    const name = userConfig.name || '用户'
    return `### 👋 你好 ${name} \n我是你的智能求职助理。我可以帮你投递简历、优化职业档案或解答求职疑惑。\n\n**你可以试着问我：**\n- 帮我投递北京的产品经理岗位\n- 优化我的简历\n- 推荐一些高薪职位`
  }

  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/conversations/${convId}`)
      const conv = await res.json()
      
      if (conv.messages && conv.messages.length > 0) {
        setMessages(conv.messages.map((m: any) => ({
          id: m.id || Date.now().toString(),
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        })))
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: generateWelcomeMessage()
        }])
      }
    } catch (e) {
      console.error('Failed to load conversation', e)
    }
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: messageText 
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSuggestions(null)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          conversation_id: conversationId
        })
      })
      const data = await res.json()
      
      if (data.conversation_id && data.conversation_id !== conversationId) {
        onConversationChange(data.conversation_id)
      }
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || '无回复'
      }])

      // 处理智能推荐
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }

    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络错误，请检查连接。'
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const startNewConversation = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' })
      })
      const conv = await res.json()
      onConversationChange(conv.id)
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: generateWelcomeMessage()
      }])
    } catch (e) {
      console.error('Failed to create conversation', e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] relative">
      {/* 头部 - 极简磨砂质感 */}
      <header className="h-[72px] flex-shrink-0 flex items-center justify-between px-8 border-b border-[#F5F5F7] bg-white/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.4)]"></div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">AI 对话</h2>
            {conversationId && (
              <p className="text-[11px] text-[#86868B] font-medium mt-0.5">会话进行中</p>
            )}
          </div>
        </div>
        <button
          onClick={startNewConversation}
          className="ios-btn-ghost flex items-center gap-1.5 px-3 py-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[13px] font-medium">新对话</span>
        </button>
      </header>

      {/* 消息区域 - 自动填充剩余空间 */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8 scroll-smooth">
        {messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* 头像 */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-bold shadow-sm mt-1
                ${msg.role === 'assistant' 
                  ? 'bg-gradient-to-br from-[#007AFF] to-[#0A84FF] text-white' 
                  : 'bg-[#F2F2F7] text-[#1D1D1F]'
                }`}>
                {msg.role === 'assistant' ? 'AI' : '我'}
              </div>

              {/* 气泡 */}
              <div className={`relative px-5 py-3.5 rounded-[20px] text-[15px] leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md
                ${msg.role === 'user' 
                  ? 'bg-[#007AFF] text-white rounded-tr-sm' 
                  : 'bg-[#F9FAFB] text-[#1D1D1F] rounded-tl-sm border border-[#F2F2F7]'
                }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap tracking-wide">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <p className="mb-3 last:mb-0 leading-7 text-[#1D1D1F]">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold text-[#007AFF]">{children}</strong>,
                        ul: ({children}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-[#3A3A3C]">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-[#3A3A3C]">{children}</ol>,
                        h1: ({children}) => <h1 className="text-lg font-bold mb-3 mt-4 text-[#1D1D1F] tracking-tight">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-bold mb-2 mt-3 text-[#1D1D1F] tracking-tight">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold mb-1 mt-2 text-[#1D1D1F] tracking-tight">{children}</h3>,
                        code: ({children}) => <code className="bg-[#F2F2F7] px-1.5 py-0.5 rounded-[6px] text-[13px] font-mono text-[#FF2D55] border border-[#E5E5EA]">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-[3px] border-[#007AFF]/30 pl-4 py-1 my-3 bg-[#F5F5F7]/50 rounded-r-lg text-[#86868B] italic">{children}</blockquote>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in pl-12">
            <div className="bg-[#F9FAFB] px-5 py-4 rounded-[20px] rounded-tl-sm border border-[#F2F2F7] shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* 输入区域 - 固定在底部 */}
      <div className="flex-shrink-0 px-4 sm:px-8 pb-6 pt-2 bg-white/95 backdrop-blur-sm z-20">
        <div className="max-w-4xl mx-auto relative group">
          
          {/* 智能推荐 - 浮动在输入框上方 */}
          {suggestions && !loading && (
            <div className="absolute bottom-full left-0 right-0 mb-4 animate-slide-up px-1">
              {/* 推荐问题 */}
              {suggestions.questions && suggestions.questions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestions.questions.map((q, i) => (
                    <button
                      key={`q-${i}`}
                      onClick={() => handleSend(q)}
                      className="px-4 py-2 bg-white text-[#1D1D1F] text-[13px] font-medium rounded-full border border-[#E5E5EA] shadow-sm hover:bg-[#F5F5F7] hover:border-[#007AFF]/30 transition-all hover:-translate-y-0.5"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 快捷动作 */}
              {suggestions.actions && suggestions.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.actions.map((action, i) => (
                    <button
                      key={`a-${i}`}
                      onClick={() => {
                        if (action.type === 'send' && action.message) {
                          handleSend(action.message)
                        } else if (action.type === 'navigate' && action.target && onNavigate) {
                          onNavigate(action.target)
                        }
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-[#007AFF] to-[#0A84FF] text-white text-[13px] font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 hover:scale-105"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative flex items-center bg-[#F9FAFB] rounded-[24px] shadow-sm border border-[#E5E5EA] transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(0,122,255,0.12)] focus-within:border-[#007AFF]/30">
            {/* 附件图标 */}
            <button className="pl-4 pr-2 text-[#86868B] hover:text-[#007AFF] transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="输入你的需求，或直接说'帮我投递简历'..."
              className="flex-1 bg-transparent py-4 px-2 text-[16px] text-[#1D1D1F] placeholder-[#86868B] outline-none"
            />
            
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="m-2 p-2.5 rounded-[16px] bg-[#007AFF] text-white shadow-md transition-all hover:bg-[#0066CC] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-center mt-3">
             <span className="text-[10px] font-medium text-[#86868B] tracking-wide uppercase opacity-60">DeepSeek V3 驱动 · 智能双重架构</span>
          </div>
        </div>
      </div>
    </div>
  )
}

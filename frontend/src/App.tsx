import { useState, useEffect } from 'react'
import Chat from './components/Chat'
import Settings from './components/Settings'
import Tasks from './components/Tasks'
import History from './components/History'
import KnowledgeBase from './components/KnowledgeBase'
import Onboarding from './components/Onboarding'

type Tab = 'chat' | 'history' | 'knowledge' | 'tasks' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()

  useEffect(() => {
    fetch('http://localhost:5000/api/config')
      .then(res => res.json())
      .then(config => {
        if (!config.apiKey) setShowOnboarding(true)
        localStorage.setItem('boss_ai_config', JSON.stringify(config))
      })
      .catch(() => {
        if (!localStorage.getItem('boss_ai_config')) setShowOnboarding(true)
      })
  }, [])

  const handleSelectConversation = (convId: string) => {
    setCurrentConversationId(convId)
    setActiveTab('chat')
  }

  const handleNavigate = (target: string) => {
    const tabMap: Record<string, Tab> = {
      'tasks': 'tasks',
      'settings': 'settings',
      'knowledge': 'knowledge',
      'history': 'history',
      'chat': 'chat'
    }
    if (tabMap[target]) {
      setActiveTab(tabMap[target])
    }
  }

  return (
    <>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      
      <div className="flex h-screen w-screen bg-[#F5F5F7] p-4 gap-5 overflow-hidden font-sans selection:bg-[#007AFF]/20">
        {/* Sidebar */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col py-2 animate-fade-in">
          {/* Logo Area */}
          <div className="px-5 mb-10 mt-4 flex items-center gap-3.5">
            <div className="h-11 w-11 bg-gradient-to-br from-[#007AFF] to-[#0A84FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold tracking-tight text-[#1D1D1F] leading-tight">数字员工</span>
              <span className="text-[11px] font-medium text-[#86868B] tracking-wide uppercase mt-0.5">AI Assistant</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-2">
            <NavButton 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
              label="对话"
            />
            
            <NavButton 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
              label="历史会话"
            />
            
            <NavButton 
              active={activeTab === 'knowledge'} 
              onClick={() => setActiveTab('knowledge')}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
              label="知识库"
            />
            
            <NavButton 
              active={activeTab === 'tasks'} 
              onClick={() => setActiveTab('tasks')}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
              label="任务"
            />
            
            <div className="my-6 mx-4 border-t border-[#E5E5EA]" />
            
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
              label="设置"
            />
          </nav>

          {/* Status Badge */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
              </span>
              <span className="text-[12px] font-medium text-[#1D1D1F]">DeepSeek Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden border border-white/50 relative animate-scale">
          {activeTab === 'chat' && (
            <Chat 
              conversationId={currentConversationId} 
              onConversationChange={setCurrentConversationId}
              onNavigate={handleNavigate}
            />
          )}
          {activeTab === 'history' && (
            <History 
              onSelectConversation={handleSelectConversation}
              currentConversationId={currentConversationId}
            />
          )}
          {activeTab === 'knowledge' && <KnowledgeBase />}
          {activeTab === 'tasks' && <Tasks />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </>
  )
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`ios-nav-item w-full ${active ? 'ios-nav-item-active' : 'ios-nav-item-inactive'}`}
    >
      <svg className={`h-[20px] w-[20px] transition-transform duration-300 ${active ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
      <span className="font-medium tracking-tight">{label}</span>
    </button>
  )
}

export default App

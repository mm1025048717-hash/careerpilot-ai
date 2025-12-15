import { useState, useEffect } from 'react'

interface Config {
  apiKey: string
  apiEndpoint: string
  model: string
  bossAccount: string
  name: string
  targetCity: string
  targetRole: string
  salary: string
}

export default function Settings() {
  const [config, setConfig] = useState<Config>({
    apiKey: '',
    apiEndpoint: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    bossAccount: '',
    name: '',
    targetCity: '',
    targetRole: '',
    salary: ''
  })
  const [saved, setSaved] = useState(false)
  const [memory, setMemory] = useState<any>(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setConfig(prev => ({ ...prev, ...data }))
        }
      })
    
    fetch('http://localhost:5000/api/memory')
      .then(res => res.json())
      .then(setMemory)
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    try {
      await fetch('http://localhost:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      localStorage.setItem('boss_ai_config', JSON.stringify(config))
      localStorage.setItem('deepseek_api_key', config.apiKey)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('保存失败')
    }
  }

  const clearMemory = async () => {
    if (!confirm('确定要清除所有记忆数据吗？这将删除所有学习到的偏好和习惯。')) return
    // TODO: 实现清除记忆的API
    alert('记忆已清除')
  }

  return (
    <div className="h-full bg-[#F5F5F7] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
        
        {/* 标题 */}
        <div>
          <h2 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">设置</h2>
          <p className="text-[15px] text-[#86868B] mt-1">管理你的 AI 助手、账号和偏好配置</p>
        </div>

        {/* 个人信息卡片 */}
        <div className="ios-card p-6">
          <div className="flex items-center gap-4 border-b border-[#F5F5F7] pb-5 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[#34C759] to-[#30B350] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">个人信息</h3>
              <p className="text-[13px] text-[#86868B]">AI 会根据这些信息为你提供个性化服务</p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">姓名</label>
                <input 
                  type="text" 
                  className="ios-input"
                  placeholder="你的名字"
                  value={config.name}
                  onChange={e => setConfig({...config, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">目标城市</label>
                <div className="relative">
                  <select 
                    className="ios-input appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                    value={config.targetCity}
                    onChange={e => setConfig({...config, targetCity: e.target.value})}
                  >
                    <option value="">选择城市</option>
                    <option value="北京">北京</option>
                    <option value="上海">上海</option>
                    <option value="深圳">深圳</option>
                    <option value="广州">广州</option>
                    <option value="杭州">杭州</option>
                    <option value="成都">成都</option>
                    <option value="南京">南京</option>
                    <option value="武汉">武汉</option>
                    <option value="西安">西安</option>
                    <option value="苏州">苏州</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">目标岗位</label>
                <input 
                  type="text" 
                  className="ios-input"
                  placeholder="如：产品经理"
                  value={config.targetRole}
                  onChange={e => setConfig({...config, targetRole: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">期望薪资</label>
                <div className="relative">
                  <select 
                    className="ios-input appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                    value={config.salary}
                    onChange={e => setConfig({...config, salary: e.target.value})}
                  >
                    <option value="">选择薪资范围</option>
                    <option value="5-10K">5-10K</option>
                    <option value="10-15K">10-15K</option>
                    <option value="15-20K">15-20K</option>
                    <option value="20-30K">20-30K</option>
                    <option value="30-50K">30-50K</option>
                    <option value="50K+">50K+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI 配置卡片 */}
        <div className="ios-card p-6">
          <div className="flex items-center gap-4 border-b border-[#F5F5F7] pb-5 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">AI 服务配置</h3>
              <p className="text-[13px] text-[#86868B]">DeepSeek API 连接设置</p>
            </div>
          </div>

          <div className="grid gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">API Endpoint</label>
              <input 
                type="text" 
                className="ios-input font-mono text-[13px]"
                value={config.apiEndpoint}
                onChange={e => setConfig({...config, apiEndpoint: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">API Key</label>
              <input 
                type="password" 
                className="ios-input font-mono text-[13px] tracking-wider"
                placeholder="sk-..."
                value={config.apiKey}
                onChange={e => setConfig({...config, apiKey: e.target.value})}
              />
              <p className="text-[12px] text-[#86868B] mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                在 <a href="https://platform.deepseek.com" target="_blank" rel="noopener" className="text-[#007AFF] hover:underline font-medium">DeepSeek 平台</a> 获取 API Key
              </p>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">模型</label>
              <div className="relative">
                <select 
                  className="ios-input appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                  value={config.model}
                  onChange={e => setConfig({...config, model: e.target.value})}
                >
                  <option value="deepseek-chat">DeepSeek Chat (推荐)</option>
                  <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BOSS 账号卡片 */}
        <div className="ios-card p-6">
          <div className="flex items-center gap-4 border-b border-[#F5F5F7] pb-5 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF9500] to-[#FF6B00] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">招聘平台账号</h3>
              <p className="text-[13px] text-[#86868B]">BOSS直聘登录信息</p>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">手机号/账号</label>
            <input 
              type="text" 
              className="ios-input"
              placeholder="用于自动登录"
              value={config.bossAccount}
              onChange={e => setConfig({...config, bossAccount: e.target.value})}
            />
            <p className="text-[12px] text-orange-500 mt-2 flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              敏感信息仅保存在本地，请勿在公共设备使用
            </p>
          </div>
        </div>

        {/* AI 记忆信息 */}
        {memory && (
          <div className="ios-card p-6">
            <div className="flex items-center justify-between border-b border-[#F5F5F7] pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#AF52DE] to-[#9747FF] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">AI 记忆</h3>
                  <p className="text-[13px] text-[#86868B]">AI 学习到的偏好和习惯</p>
                </div>
              </div>
              <button
                onClick={clearMemory}
                className="text-[13px] font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                清除记忆
              </button>
            </div>

            <div className="space-y-4">
              {memory.preferences && Object.keys(memory.preferences).length > 0 ? (
                <div>
                  <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wide mb-3">偏好设置</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(memory.preferences).map(([key, value]) => (
                      <span key={key} className="px-3 py-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium rounded-[8px] border border-[#E5E5EA]">
                        {key}: <span className="text-[#007AFF]">{String(value)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-[#86868B] italic">暂无记忆数据。与 AI 对话后，它会学习你的偏好。</p>
              )}

              {memory.habits && Object.keys(memory.habits).length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wide mb-3 mt-2">使用习惯</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(memory.habits).map(([action, data]: [string, any]) => (
                      <span key={action} className="px-3 py-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium rounded-[8px] border border-[#E5E5EA]">
                        {action}: <span className="text-[#007AFF]">{data.count}次</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 保存按钮 */}
        <div className="flex justify-end pt-2 pb-10">
          <button 
            onClick={handleSave}
            className={`ios-btn-primary px-10 ${
              saved ? 'bg-[#34C759] hover:bg-[#2FB350] shadow-green-500/30' : ''
            }`}
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                已保存
              </span>
            ) : '保存设置'}
          </button>
        </div>

      </div>
    </div>
  )
}

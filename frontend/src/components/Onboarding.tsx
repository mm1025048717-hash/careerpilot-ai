import { useState, useRef, useEffect } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州']
const SALARIES = ['10-15K', '15-20K', '20-30K', '30-50K', '50K+']

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    apiKey: '',
    name: '',
    targetCity: '',
    targetRole: '',
    salary: '',
    bossPhone: ''  // BOSS 直聘手机号
  })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setConfig(prev => ({ ...prev, ...data }))
        }
      })
      .catch(console.error)
  }, [])

  const saveConfig = async () => {
    try {
      await fetch('http://localhost:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
    } catch (e) {
      console.error('保存失败', e)
    }
  }

  const handleNext = async () => {
    await saveConfig()
    if (step < 3) {
      setStep(step + 1)
    } else {
      localStorage.setItem('boss_ai_config', JSON.stringify(config))
      onComplete()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('http://localhost:5000/api/resume', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        setTimeout(() => handleNext(), 500)
      } else {
        alert('上传失败')
      }
    } catch {
      alert('网络错误')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5F5F7]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        
        {/* 进度指示 */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-[#007AFF]' : i < step ? 'w-1.5 bg-[#007AFF]/40' : 'w-1.5 bg-gray-200'
            }`} />
          ))}
        </div>

        {/* Step 1: API Key */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="h-16 w-16 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-[#1D1D1F]">配置 AI 服务</h2>
              <p className="text-[#86868B] mt-2 text-sm">输入 DeepSeek API Key</p>
            </div>

            <div className="pt-2">
              <input 
                type="password" 
                className="input-apple text-center tracking-widest font-mono"
                placeholder="sk-..."
                value={config.apiKey}
                onChange={e => setConfig({...config, apiKey: e.target.value})}
              />
            </div>

            <button 
              onClick={handleNext} 
              disabled={!config.apiKey} 
              className="w-full btn-primary"
            >
              继续
            </button>
          </div>
        )}

        {/* Step 2: 个人信息 + 手机号 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1D1D1F]">完善信息</h2>
              <p className="text-[#86868B] text-sm mt-1">让 AI 更懂你的求职需求</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">称呼</label>
                <input 
                  type="text" 
                  className="input-apple" 
                  placeholder="例如：陈先生"
                  value={config.name}
                  onChange={e => setConfig({...config, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">期望城市</label>
                  <select 
                    className="select-apple"
                    value={config.targetCity}
                    onChange={e => setConfig({...config, targetCity: e.target.value})}
                  >
                    <option value="">请选择</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">期望薪资</label>
                  <select 
                    className="select-apple"
                    value={config.salary}
                    onChange={e => setConfig({...config, salary: e.target.value})}
                  >
                    <option value="">请选择</option>
                    {SALARIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">目标岗位</label>
                <input 
                  type="text" 
                  className="input-apple" 
                  placeholder="例如：产品经理、Java开发"
                  value={config.targetRole}
                  onChange={e => setConfig({...config, targetRole: e.target.value})}
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                  BOSS 直聘手机号
                  <span className="text-[#86868B] font-normal ml-2">用于自动登录</span>
                </label>
                <input 
                  type="tel" 
                  className="input-apple" 
                  placeholder="13800138000"
                  value={config.bossPhone}
                  onChange={e => setConfig({...config, bossPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">返回</button>
              <button onClick={handleNext} className="btn-primary flex-[2]">下一步</button>
            </div>
          </div>
        )}

        {/* Step 3: 上传简历 */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="h-16 w-16 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1D1D1F]">上传简历</h2>
              <p className="text-[#86868B] text-sm mt-1">支持 PDF / Word / Markdown</p>
            </div>

            <div 
              className="group relative aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 bg-[#F5F5F7]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" hidden ref={fileInputRef} accept=".pdf,.doc,.docx,.md" onChange={handleFileUpload} />
              
              {isUploading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#007AFF] border-t-transparent"></div>
              ) : (
                <>
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-[#007AFF] shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#86868B]">点击上传</span>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">返回</button>
              <button onClick={handleNext} className="btn-primary flex-[2]">
                完成设置
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

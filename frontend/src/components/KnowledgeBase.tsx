import { useState, useEffect } from 'react'

interface Document {
  id: string
  title: string
  type: string
  tags: string[]
  created_at: string
  updated_at: string
  word_count: number
  summary: string
  content?: string
}

const DOC_CONFIG: Record<string, { icon: string, color: string, bg: string }> = {
  note: { icon: '📝', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  resume: { icon: '📄', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  job: { icon: '💼', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  reference: { icon: '📚', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  template: { icon: '📋', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  experience: { icon: '🎯', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' }
}

const DOC_TYPE_NAMES: Record<string, string> = {
  note: '笔记',
  resume: '简历',
  job: '职位信息',
  reference: '参考资料',
  template: '模板',
  experience: '经历'
}

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showNewDoc, setShowNewDoc] = useState(false)
  const [newDoc, setNewDoc] = useState({ title: '', content: '', type: 'note', tags: '' })

  useEffect(() => {
    fetchDocuments()
  }, [selectedType])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      let url = 'http://localhost:5000/api/knowledge'
      if (selectedType) url += `?type=${selectedType}`
      const res = await fetch(url)
      const data = await res.json()
      setDocuments(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newDoc.title.trim()) return
    try {
      const res = await fetch('http://localhost:5000/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDoc,
          tags: newDoc.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      const doc = await res.json()
      setDocuments(prev => [doc, ...prev])
      setShowNewDoc(false)
      setNewDoc({ title: '', content: '', type: 'note', tags: '' })
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return
    try {
      await fetch(`http://localhost:5000/api/knowledge/${id}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    if (!selectedDoc) return
    try {
      await fetch(`http://localhost:5000/api/knowledge/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedDoc.title,
          content: selectedDoc.content,
          tags: selectedDoc.tags
        })
      })
      setIsEditing(false)
      fetchDocuments()
    } catch (e) {
      console.error(e)
    }
  }

  const viewDocument = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/knowledge/${id}`)
      const doc = await res.json()
      setSelectedDoc(doc)
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="h-full flex bg-[#F5F5F7]">
      {/* 侧边栏列表 */}
      <div className="w-[320px] flex flex-col bg-white border-r border-[#E5E5EA]">
        <div className="p-5 border-b border-[#F5F5F7]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[20px] font-bold text-[#1D1D1F]">知识库</h2>
            <button onClick={() => setShowNewDoc(true)} className="ios-btn-ghost p-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA]">
              <svg className="w-5 h-5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索文档..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F2F2F7] rounded-[12px] text-[14px] text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.1)] focus:outline-none transition-all duration-200"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto mt-4 pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${!selectedType ? 'bg-[#1D1D1F] text-white' : 'bg-[#F2F2F7] text-[#86868B] hover:bg-[#E5E5EA]'
                }`}
            >
              全部
            </button>
            {Object.keys(DOC_TYPE_NAMES).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${selectedType === type ? 'bg-[#007AFF] text-white' : 'bg-[#F2F2F7] text-[#86868B] hover:bg-[#E5E5EA]'
                  }`}
              >
                {DOC_TYPE_NAMES[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-[3px] border-[#E5E5EA] border-t-[#007AFF] rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-[#86868B] text-[13px]">
              暂无文档
            </div>
          ) : (
            documents.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
              <div
                key={doc.id}
                onClick={() => viewDocument(doc.id)}
                className={`p-3 rounded-[14px] cursor-pointer transition-all border ${selectedDoc?.id === doc.id
                    ? 'bg-[#007AFF]/5 border-[#007AFF]/20 shadow-sm'
                    : 'bg-white border-transparent hover:bg-[#F9FAFB]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] border ${DOC_CONFIG[doc.type]?.bg || 'bg-gray-50 border-gray-100'
                    }`}>
                    {DOC_CONFIG[doc.type]?.icon || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[14px] font-semibold truncate ${selectedDoc?.id === doc.id ? 'text-[#007AFF]' : 'text-[#1D1D1F]'
                      }`}>
                      {doc.title}
                    </h4>
                    <p className="text-[12px] text-[#86868B] mt-0.5 truncate">{doc.summary || '无内容预览'}</p>
                  </div>
                </div>
              </div>
            )))}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedDoc ? (
          <>
            <header className="px-8 py-5 border-b border-[#F5F5F7] flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-[24px] shadow-sm border ${DOC_CONFIG[selectedDoc.type]?.bg
                  }`}>
                  {DOC_CONFIG[selectedDoc.type]?.icon}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      value={selectedDoc.title}
                      onChange={e => setSelectedDoc({ ...selectedDoc, title: e.target.value })}
                      className="text-[20px] font-bold text-[#1D1D1F] bg-transparent border-b-2 border-[#007AFF] outline-none w-full"
                    />
                  ) : (
                    <h2 className="text-[20px] font-bold text-[#1D1D1F]">{selectedDoc.title}</h2>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[12px] font-medium px-2 py-0.5 rounded-[6px] ${DOC_CONFIG[selectedDoc.type]?.bg.replace('border', 'bg-opacity-50') || 'bg-gray-100 text-gray-600'
                      } ${DOC_CONFIG[selectedDoc.type]?.color || ''}`}>
                      {DOC_TYPE_NAMES[selectedDoc.type]}
                    </span>
                    <span className="text-[12px] text-[#86868B]">•</span>
                    <span className="text-[12px] text-[#86868B]">{selectedDoc.word_count} 字</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="ios-btn-secondary py-2 px-4 text-[14px] rounded-[12px]">取消</button>
                    <button onClick={handleSave} className="ios-btn-primary py-2 px-4 text-[14px] rounded-[12px]">保存</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleDelete(selectedDoc.id)} className="p-2.5 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-[12px] transition-all">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button onClick={() => setIsEditing(true)} className="ios-btn-secondary py-2 px-4 text-[14px] rounded-[12px] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      编辑
                    </button>
                  </>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              {isEditing ? (
                <textarea
                  value={selectedDoc.content || ''}
                  onChange={e => setSelectedDoc({ ...selectedDoc, content: e.target.value })}
                  className="w-full h-full min-h-[500px] p-6 bg-[#F9FAFB] rounded-[20px] border border-[#E5E5EA] text-[#1D1D1F] leading-relaxed resize-none focus:outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 transition-all text-[15px]"
                  placeholder="在此输入内容..."
                />
              ) : (
                <div className="prose prose-lg max-w-none text-[#1D1D1F]">
                  <p className="whitespace-pre-wrap leading-8 text-[16px]">{selectedDoc.content || selectedDoc.summary}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in opacity-60">
            <div className="w-24 h-24 bg-[#F5F5F7] rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-[#E5E5EA]">
              <svg className="w-12 h-12 text-[#C7C7CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-[#1D1D1F] mb-2">未选择文档</h3>
            <p className="text-[#86868B]">从左侧列表选择一个文档，或创建新文档</p>
            <button onClick={() => setShowNewDoc(true)} className="mt-8 ios-btn-primary rounded-[14px]">创建新文档</button>
          </div>
        )}
      </div>

      {/* 新建文档弹窗 */}
      {showNewDoc && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl p-6 animate-scale">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[20px] font-bold text-[#1D1D1F]">新建文档</h3>
              <button onClick={() => setShowNewDoc(false)} className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-full hover:bg-[#F5F5F7] transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">标题</label>
                <input
                  placeholder="输入文档标题"
                  value={newDoc.title}
                  onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="ios-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">类型</label>
                  <div className="relative">
                    <select
                      value={newDoc.type}
                      onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
                      className="ios-input appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                    >
                      {Object.entries(DOC_TYPE_NAMES).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">标签</label>
                  <input
                    placeholder="逗号分隔"
                    value={newDoc.tags}
                    onChange={e => setNewDoc({ ...newDoc, tags: e.target.value })}
                    className="ios-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">内容</label>
                <textarea
                  placeholder="输入文档内容..."
                  value={newDoc.content}
                  onChange={e => setNewDoc({ ...newDoc, content: e.target.value })}
                  className="ios-input min-h-[150px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F5F7] mt-2">
                <button onClick={() => setShowNewDoc(false)} className="ios-btn-secondary px-6 rounded-[14px]">取消</button>
                <button onClick={handleCreate} className="ios-btn-primary px-6 rounded-[14px]">创建</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

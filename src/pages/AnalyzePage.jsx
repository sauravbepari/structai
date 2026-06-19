import { useState, useRef, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAppStore } from '../store'
import { buildSystemPrompt } from '../utils/calculations'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const API_KEY = import.meta.env.VITE_GROQ_KEY

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 loading-dots py-2">
      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block" />
      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block" />
      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block" />
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div className={`w-7 h-7 rounded shrink-0 flex items-center justify-center text-xs mono font-bold ${
        isUser ? 'bg-steel-600 text-steel-200' : 'bg-blue-600/30 border border-blue-500/40 text-blue-300'
      }`}>
        {isUser ? 'R' : 'AI'}
      </div>
      <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-steel-700/60 text-steel-200 rounded-tr-none'
          : 'bg-steel-800/80 border border-steel-700/50 text-steel-200 rounded-tl-none'
      }`}>
        {msg.files && msg.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {msg.files.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-steel-700/60 border border-steel-600/50 rounded px-2 py-1">
                <span className="text-blue-400 text-xs">⬡</span>
                <span className="text-xs mono text-steel-300">{f.name}</span>
              </div>
            ))}
          </div>
        )}
        {msg.loading ? <LoadingDots /> : (
          <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
        )}
      </div>
    </div>
  )
}

// ─── TRAINING BOX ───────────────────────────────────────────
function TrainingBox() {
  const { addTrainingData, trainingData } = useAppStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('foundation')
  const [files, setFiles] = useState([])
  const [saved, setSaved] = useState(false)

  const onDrop = useCallback((accepted) => setFiles(p => [...p, ...accepted]), [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, noClick: true,
    accept: { 'image/*': [], 'application/pdf': ['.pdf'], '.dxf': [], 'text/*': [] },
    maxSize: 20 * 1024 * 1024,
  })

  const readFile = (file) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    if (file.name.endsWith('.dxf') || file.type.startsWith('text/')) reader.readAsText(file)
    else resolve(`[File: ${file.name}]`)
  })

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && files.length === 0) return
    let fileContents = []
    for (const f of files) {
      const c = await readFile(f)
      fileContents.push({ name: f.name, type: f.type, content: typeof c === 'string' ? c.slice(0, 8000) : c })
    }
    addTrainingData({
      category, title: title || files.map(f => f.name).join(', '),
      content, files: fileContents, fileNames: files.map(f => f.name),
    })
    setTitle(''); setContent(''); setFiles([])
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const CATS = [
    { id: 'foundation', label: 'Foundation' },
    { id: 'section', label: 'Section' },
    { id: 'rebar', label: 'Rebar' },
    { id: 'beam_column', label: 'Beam/Column' },
    { id: 'boss_style', label: "Boss Style" },
    { id: 'general_note', label: 'General' },
  ]

  return (
    <div className="border border-green-700/40 rounded-xl bg-green-900/10 p-4 space-y-3" {...getRootProps()}>
      <input {...getInputProps()} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-green-300 text-xs font-medium mono">TRAINING INPUT</span>
          <span className="text-steel-500 text-xs mono">— AI এখানে শুধু শিখবে, জবাব দেবে না</span>
        </div>
        <span className="text-steel-500 text-xs mono">{trainingData?.length || 0} saved</span>
      </div>

      {/* Category */}
      <div className="flex flex-wrap gap-1">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-2 py-0.5 rounded text-xs mono transition-all border ${
              category === c.id
                ? 'bg-green-700/40 border-green-600/50 text-green-300'
                : 'border-steel-700/40 text-steel-500 hover:border-steel-600'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Title (e.g. Isolated Footing Type-A, Boss এর standard section)"
        className="w-full bg-steel-900/60 border border-steel-700/40 rounded-lg px-3 py-2 text-white mono text-xs focus:outline-none focus:border-green-600/50" />

      {/* Content */}
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Details, specifications, dimensions, notes লিখো... অথবা নিচে file drag করো"
        rows={3}
        className="w-full bg-steel-900/60 border border-steel-700/40 rounded-lg px-3 py-2 text-white mono text-xs focus:outline-none focus:border-green-600/50 resize-none" />

      {/* File zone */}
      <div className={`border border-dashed rounded-lg px-3 py-2 text-center transition-all ${
        isDragActive ? 'border-green-500 bg-green-900/20' : 'border-steel-700/40'
      }`}>
        <label className="cursor-pointer flex items-center justify-center gap-2">
          <input type="file" multiple className="hidden"
            accept=".dxf,.pdf,.png,.jpg,.jpeg,.txt"
            onChange={e => setFiles(p => [...p, ...Array.from(e.target.files)])} />
          <span className="text-steel-500 text-xs mono">⬡ DXF · PDF · Image drag করো বা </span>
          <span className="text-green-400 text-xs mono underline cursor-pointer">Browse</span>
        </label>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-green-900/30 border border-green-700/40 rounded px-1.5 py-0.5">
                <span className="text-green-400 text-xs">⬡</span>
                <span className="text-xs mono text-green-300">{f.name}</span>
                <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                  className="text-steel-500 hover:text-red-400 text-xs ml-0.5">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <button onClick={handleSave}
        className={`w-full py-2 rounded-lg text-xs mono font-medium transition-all border ${
          saved
            ? 'bg-green-700/40 border-green-500/50 text-green-200'
            : 'bg-green-800/20 border-green-700/40 text-green-300 hover:bg-green-700/30'
        }`}>
        {saved ? '✓ Training Data Saved!' : '◈ Save to Training Hub'}
      </button>
    </div>
  )
}

// ─── WORK AREA ───────────────────────────────────────────────
export default function AnalyzePage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 0, role: 'assistant',
      content: `StructAI ready. প্রশ্ন করুন বা drawing দিন।\n\n✅ DXF / PDF / Image upload\n✅ Foundation, Beam, Column, Slab\n✅ Rebar sizing & spacing\n✅ RL / EL / GL calculations\n✅ ACI 318-19 & BNBC 2020`
    }
  ])
  const [pendingFiles, setPendingFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('work') // 'work' | 'train'
  const bottomRef = useRef(null)
  const { codeStandard, knowledgeBase, trainingData, addMessage } = useAppStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onDrop = useCallback((accepted) => {
    setPendingFiles((prev) => [...prev, ...accepted])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, noClick: true,
    accept: { 'image/*': [], 'application/pdf': ['.pdf'], '.dxf': [] },
    maxSize: 20 * 1024 * 1024,
  })

  const readDXFFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })

  const buildUserMessage = async (text, files) => {
    let parts = []
    for (const file of files) {
      if (file.name.toLowerCase().endsWith('.dxf')) {
        const dxfText = await readDXFFile(file)
        parts.push(`[DXF FILE: ${file.name}]\n\`\`\`\n${dxfText.slice(0, 12000)}\n\`\`\``)
      } else {
        parts.push(`[File uploaded: ${file.name}] — Analyze this structural drawing.`)
      }
    }
    if (text.trim()) parts.push(text)
    return parts.join('\n\n') || 'Hello'
  }

  const buildTrainingSummary = () => {
    if (!trainingData || trainingData.length === 0) return ''
    const summary = trainingData.slice(0, 15).map((t, i) =>
      `[Training ${i+1}] ${t.category}: ${t.title}\n${t.content?.slice(0, 600) || ''}`
    ).join('\n\n')
    return `\n\nUSER TRAINING DATA (reference this):\n${summary}`
  }

  const sendMessage = async () => {
    if (!input.trim() && pendingFiles.length === 0) return
    if (isLoading) return

    const userMsg = {
      id: Date.now(), role: 'user',
      content: input,
      files: pendingFiles.map(f => ({ name: f.name, type: f.type }))
    }
    const loadingMsg = { id: Date.now() + 1, role: 'assistant', loading: true, content: '' }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput('')
    const filesToProcess = [...pendingFiles]
    setPendingFiles([])
    setIsLoading(true)

    try {
      const userContent = await buildUserMessage(input, filesToProcess)
      const { buildSystemPrompt: bsp } = await import('../utils/calculations')
      const systemPrompt = bsp(codeStandard, knowledgeBase) + buildTrainingSummary()

      const historyMessages = messages
        .filter(m => !m.loading)
        .slice(-8)
        .map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' }))
        .concat([{ role: 'user', content: userContent }])

      const resp = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2048,
          messages: [{ role: 'system', content: systemPrompt }, ...historyMessages],
        })
      })

      const data = await resp.json()
      const assistantText = data.choices?.[0]?.message?.content || data.error?.message || 'API Error'

      setMessages((prev) => prev.map(m =>
        m.id === loadingMsg.id ? { ...m, loading: false, content: assistantText } : m
      ))
      addMessage({ role: 'user', content: input })
      addMessage({ role: 'assistant', content: assistantText })

    } catch (err) {
      setMessages((prev) => prev.map(m =>
        m.id === loadingMsg.id ? { ...m, loading: false, content: `Error: ${err.message}` } : m
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header with tabs */}
      <div className="px-5 py-3 border-b border-steel-700/50 flex items-center justify-between shrink-0">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('work')}
            className={`px-4 py-1.5 rounded-lg text-xs mono font-medium transition-all border ${
              activeTab === 'work'
                ? 'bg-blue-600/30 border-blue-500/40 text-blue-300'
                : 'border-steel-700/40 text-steel-400 hover:border-steel-600'
            }`}>
            ⬡ Work Area
          </button>
          <button onClick={() => setActiveTab('train')}
            className={`px-4 py-1.5 rounded-lg text-xs mono font-medium transition-all border ${
              activeTab === 'train'
                ? 'bg-green-700/30 border-green-600/40 text-green-300'
                : 'border-steel-700/40 text-steel-400 hover:border-steel-600'
            }`}>
            ◈ Training Input
            {(trainingData?.length || 0) > 0 && (
              <span className="ml-1.5 bg-green-800/50 text-green-400 rounded px-1 text-xs">{trainingData.length}</span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-steel-400 mono">Groq AI Ready</span>
        </div>
      </div>

      {/* TRAINING TAB */}
      {activeTab === 'train' && (
        <div className="flex-1 overflow-y-auto p-4">
          <TrainingBox />

          {/* Saved training list */}
          {(trainingData?.length || 0) > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-steel-500 text-xs mono px-1">Saved training entries:</p>
              {trainingData.slice().reverse().map(item => (
                <div key={item.id} className="bg-steel-900/60 border border-steel-700/40 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs mono">{item.category}</span>
                    <span className="text-steel-600 text-xs">·</span>
                    <span className="text-steel-300 text-xs mono">{item.title}</span>
                  </div>
                  {item.fileNames?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.fileNames.map((n, i) => (
                        <span key={i} className="text-xs mono text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">⬡ {n}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORK AREA TAB */}
      {activeTab === 'work' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4" {...getRootProps()}>
            <input {...getInputProps()} />

            {isDragActive && (
              <div className="absolute inset-0 z-50 bg-blue-900/80 flex items-center justify-center border-2 border-dashed border-blue-400">
                <div className="text-center">
                  <div className="text-4xl mb-3">⬡</div>
                  <p className="text-blue-300 mono font-medium">Drop DXF / PDF / Image here</p>
                </div>
              </div>
            )}

            {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {pendingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 rounded-lg px-2 py-1">
                  <span className="text-blue-400 text-xs">⬡</span>
                  <span className="text-xs mono text-blue-300">{f.name}</span>
                  <button onClick={() => setPendingFiles(p => p.filter((_, j) => j !== i))}
                    className="text-steel-400 hover:text-red-400 ml-1 text-xs">×</button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 shrink-0">
            <div className="flex gap-2 bg-steel-800/60 border border-steel-600/50 rounded-xl p-2 focus-within:border-blue-500/50 transition-all">
              <label className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-steel-700/60 cursor-pointer transition-colors text-steel-400 hover:text-blue-400 shrink-0">
                <input type="file" className="hidden" multiple
                  accept=".dxf,.pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setPendingFiles(p => [...p, ...Array.from(e.target.files)])} />
                <span className="text-lg">⬡</span>
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="প্রশ্ন করুন বা drawing দিন... (Enter to send)"
                rows={1}
                className="flex-1 bg-transparent text-steel-200 placeholder-steel-500 text-sm mono resize-none outline-none leading-6 py-1 min-h-[32px] max-h-32"
              />
              <button onClick={sendMessage} disabled={isLoading || (!input.trim() && !pendingFiles.length)}
                className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 hover:bg-blue-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0">
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

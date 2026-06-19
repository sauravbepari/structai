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

export default function AnalyzePage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 0, role: 'assistant',
      content: `StructAI ready. আপনার drawing বা প্রশ্ন দিন।\n\n✅ DXF / PDF / Image upload করুন\n✅ Foundation, Beam, Column, Slab analyze\n✅ Rebar sizing & spacing\n✅ RL / EL / GL calculations\n✅ ACI 318-19 & BNBC 2020\n✅ Training Hub এর data automatically use হবে`
    }
  ])
  const [pendingFiles, setPendingFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  const { codeStandard, knowledgeBase, trainingData, addMessage } = useAppStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onDrop = useCallback((accepted) => {
    setPendingFiles((prev) => [...prev, ...accepted])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
      '.dxf': [],
    },
    noClick: true,
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
      const isDXF = file.name.toLowerCase().endsWith('.dxf')
      const isPDF = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')

      if (isDXF) {
        const dxfText = await readDXFFile(file)
        parts.push(`[DXF FILE: ${file.name}]\n\`\`\`\n${dxfText.slice(0, 12000)}\n\`\`\``)
      } else if (isPDF) {
        parts.push(`[PDF FILE uploaded: ${file.name}] — Please analyze this structural drawing/document.`)
      } else if (isImage) {
        parts.push(`[IMAGE uploaded: ${file.name}] — Please analyze this structural drawing/image.`)
      }
    }

    if (text.trim()) parts.push(text)
    return parts.join('\n\n') || 'Hello'
  }

  const buildTrainingSummary = () => {
    if (!trainingData || trainingData.length === 0) return ''
    const summary = trainingData.slice(0, 10).map((t, i) =>
      `[Training ${i+1}] ${t.category}: ${t.title}\n${t.content.slice(0, 500)}`
    ).join('\n\n')
    return `\n\nTRAINING DATA FROM USER (use as reference):\n${summary}`
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
      const systemPrompt = buildSystemPrompt(codeStandard, knowledgeBase) + buildTrainingSummary()

      const historyMessages = messages
        .filter(m => !m.loading)
        .slice(-8)
        .map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' }))
        .concat([{ role: 'user', content: userContent }])

      const resp = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2048,
          messages: [
            { role: 'system', content: systemPrompt },
            ...historyMessages
          ],
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const trainingCount = trainingData?.length || 0

  return (
    <div className="flex flex-col h-full" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Header */}
      <div className="px-5 py-3 border-b border-steel-700/50 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white mono">Drawing Analysis</h1>
          <p className="text-xs text-steel-500 mono">Upload DXF · PDF · Image for AI analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {trainingCount > 0 && (
            <span className="text-xs text-green-400 mono bg-green-900/20 border border-green-700/40 px-2 py-0.5 rounded">
              ◈ {trainingCount} training entries
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-steel-400 mono">Groq AI Ready</span>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-blue-900/80 flex items-center justify-center border-2 border-dashed border-blue-400 rounded-xl">
          <div className="text-center">
            <div className="text-4xl mb-3">⬡</div>
            <p className="text-blue-300 mono font-medium">Drop DXF / PDF / Image here</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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

      {/* Input area */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex gap-2 bg-steel-800/60 border border-steel-600/50 rounded-xl p-2 focus-within:border-blue-500/50 transition-all">
          <label className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-steel-700/60 cursor-pointer transition-colors text-steel-400 hover:text-blue-400 shrink-0">
            <input type="file" className="hidden" multiple
              accept=".dxf,.pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setPendingFiles(p => [...p, ...Array.from(e.target.files)])}
            />
            <span className="text-lg">⬡</span>
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Drawing পাঠান বা প্রশ্ন করুন... (Enter to send, Shift+Enter নতুন লাইন)"
            rows={1}
            className="flex-1 bg-transparent text-steel-200 placeholder-steel-500 text-sm mono resize-none outline-none leading-6 py-1 min-h-[32px] max-h-32"
          />

          <button onClick={sendMessage} disabled={isLoading || (!input.trim() && !pendingFiles.length)}
            className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 hover:bg-blue-600/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0">
            <span className="text-sm">→</span>
          </button>
        </div>
        <p className="text-center text-steel-600 text-xs mono mt-1.5">
          Drag & drop DXF · PDF · Image · Groq LLaMA 3.3
        </p>
      </div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAppStore } from '../store'

const CATEGORIES = [
  { id: 'foundation', label: 'Foundation', icon: '⬡', color: 'text-blue-400' },
  { id: 'section', label: 'Section Detail', icon: '◈', color: 'text-green-400' },
  { id: 'rebar', label: 'Rebar Schedule', icon: '≡', color: 'text-amber-400' },
  { id: 'beam_column', label: 'Beam / Column', icon: '▣', color: 'text-purple-400' },
  { id: 'general_note', label: 'General Notes', icon: '◷', color: 'text-steel-300' },
  { id: 'boss_style', label: "Boss's Style", icon: '★', color: 'text-yellow-400' },
  { id: 'material', label: 'Materials', icon: '◉', color: 'text-red-400' },
  { id: 'other', label: 'Other', icon: '○', color: 'text-steel-400' },
]

export default function TrainingHubPage() {
  const { trainingData, addTrainingData, removeTrainingData } = useAppStore()
  const [activeCategory, setActiveCategory] = useState('foundation')
  const [form, setForm] = useState({ title: '', content: '', notes: '' })
  const [showForm, setShowForm] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterCat, setFilterCat] = useState('all')

  const onDrop = useCallback((accepted) => {
    setPendingFiles(prev => [...prev, ...accepted])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      '.dxf': [],
      'text/*': ['.txt', '.md'],
    },
    noClick: true,
    maxSize: 20 * 1024 * 1024,
  })

  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    if (file.name.endsWith('.dxf') || file.type.startsWith('text/')) {
      reader.readAsText(file)
    } else {
      resolve(`[Binary file: ${file.name} — ${file.type}]`)
    }
  })

  const handleSave = async () => {
    if (!form.title.trim() && pendingFiles.length === 0) return
    setIsProcessing(true)

    try {
      let fileContents = []
      for (const file of pendingFiles) {
        const content = await readFile(file)
        fileContents.push({
          name: file.name,
          type: file.type,
          content: typeof content === 'string' ? content.slice(0, 8000) : content
        })
      }

      addTrainingData({
        category: activeCategory,
        title: form.title || pendingFiles.map(f => f.name).join(', '),
        content: form.content,
        notes: form.notes,
        files: fileContents,
        fileNames: pendingFiles.map(f => f.name),
      })

      setForm({ title: '', content: '', notes: '' })
      setPendingFiles([])
      setShowForm(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const filtered = (trainingData || []).filter(t =>
    filterCat === 'all' ? true : t.category === filterCat
  )

  const getCatInfo = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-4" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white mono">Training Hub</h1>
          <p className="text-steel-500 text-xs mono">
            AI এই data দেখে শিখবে · একবার দিলে সবসময় মনে থাকবে · {(trainingData || []).length} entries
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="px-3 py-1.5 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-xs mono hover:bg-green-600/30 transition-all">
          + Add Training Data
        </button>
      </div>

      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-green-900/80 flex items-center justify-center border-2 border-dashed border-green-400">
          <div className="text-center">
            <div className="text-5xl mb-3">◈</div>
            <p className="text-green-300 mono font-medium text-lg">Drop training file here</p>
            <p className="text-green-400 mono text-sm mt-1">DXF · PDF · Image · Text</p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="glow-border rounded-xl bg-steel-900/70 p-5 space-y-4">
          <h3 className="text-sm font-medium text-white mono">নতুন Training Data Add করো</h3>

          {/* Category selector */}
          <div>
            <p className="text-xs text-steel-500 mono mb-2">Category:</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs mono transition-all border ${
                    activeCategory === cat.id
                      ? 'bg-steel-700 border-steel-500 text-white'
                      : 'border-steel-700/50 text-steel-400 hover:border-steel-600'
                  }`}>
                  <span className={cat.color}>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title (e.g. Isolated Footing Type-A, Boss এর foundation style)"
            className="w-full bg-steel-800/60 border border-steel-600/50 rounded-lg px-3 py-2 text-white mono text-sm focus:outline-none focus:border-green-500/50" />

          {/* File drop zone */}
          <div className="border border-dashed border-steel-600/60 rounded-xl p-4 text-center">
            <p className="text-steel-500 mono text-xs mb-2">DXF · PDF · Image drag করো বা:</p>
            <label className="cursor-pointer">
              <input type="file" multiple className="hidden"
                accept=".dxf,.pdf,.png,.jpg,.jpeg,.txt,.md"
                onChange={e => setPendingFiles(p => [...p, ...Array.from(e.target.files)])} />
              <span className="px-3 py-1.5 bg-steel-700/60 border border-steel-600/50 text-steel-300 rounded-lg text-xs mono hover:bg-steel-700 transition-all cursor-pointer">
                Browse Files
              </span>
            </label>

            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-green-900/30 border border-green-700/40 rounded px-2 py-1">
                    <span className="text-green-400 text-xs">◈</span>
                    <span className="text-xs mono text-green-300">{f.name}</span>
                    <button onClick={() => setPendingFiles(p => p.filter((_, j) => j !== i))}
                      className="text-steel-500 hover:text-red-400 text-xs ml-1">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content / description */}
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="বিস্তারিত লিখো: specifications, dimensions, notes, boss এর instruction যা video তে দেখেছো..."
            rows={4}
            className="w-full bg-steel-800/60 border border-steel-600/50 rounded-lg px-3 py-2 text-white mono text-sm focus:outline-none focus:border-green-500/50 resize-none" />

          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Extra notes (optional): কখন use করতে হয়, কোন project type এ..."
            rows={2}
            className="w-full bg-steel-800/60 border border-steel-600/50 rounded-lg px-3 py-2 text-white mono text-sm focus:outline-none focus:border-green-500/50 resize-none" />

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={isProcessing}
              className="px-4 py-2 bg-green-600/30 border border-green-500/40 text-green-300 rounded-lg text-xs mono hover:bg-green-600/40 transition-all disabled:opacity-50">
              {isProcessing ? 'Saving...' : '◈ Save to Training Hub'}
            </button>
            <button onClick={() => { setShowForm(false); setPendingFiles([]); setForm({ title: '', content: '', notes: '' }) }}
              className="px-4 py-2 text-steel-400 hover:text-steel-200 text-xs mono transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        <button onClick={() => setFilterCat('all')}
          className={`px-2.5 py-1 rounded-lg text-xs mono transition-all border ${
            filterCat === 'all' ? 'bg-steel-700 border-steel-500 text-white' : 'border-steel-700/50 text-steel-400 hover:border-steel-600'
          }`}>
          All ({(trainingData || []).length})
        </button>
        {CATEGORIES.map(cat => {
          const count = (trainingData || []).filter(t => t.category === cat.id).length
          if (count === 0) return null
          return (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs mono transition-all border ${
                filterCat === cat.id ? 'bg-steel-700 border-steel-500 text-white' : 'border-steel-700/50 text-steel-400 hover:border-steel-600'
              }`}>
              <span className={cat.color}>{cat.icon}</span> {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Training entries */}
      {filtered.length === 0 ? (
        <div className="glow-border rounded-xl bg-steel-900/40 p-10 text-center">
          <div className="text-3xl mb-3 opacity-30">◈</div>
          <p className="text-steel-500 mono text-sm">কোনো training data নেই।</p>
          <p className="text-steel-600 mono text-xs mt-1">
            তোমার DXF files, boss এর style, standard sections এখানে add করো।<br/>
            AI প্রতিটা analysis এ এগুলো reference করবে।
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.slice().reverse().map((item) => {
            const cat = getCatInfo(item.category)
            return (
              <div key={item.id} className="glow-border rounded-xl bg-steel-900/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs mono ${cat.color}`}>{cat.icon} {cat.label}</span>
                      <span className="text-steel-600 text-xs mono">·</span>
                      <span className="text-steel-500 text-xs mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white mono truncate">{item.title}</h3>
                    {item.content && (
                      <p className="text-steel-400 text-xs mono mt-1 line-clamp-2 leading-relaxed">{item.content}</p>
                    )}
                    {item.fileNames?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.fileNames.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-900/30 border border-green-800/40 text-green-400 rounded text-xs mono">
                            ⬡ {name}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-steel-500 text-xs mono mt-1 italic">{item.notes}</p>
                    )}
                  </div>
                  <button onClick={() => removeTrainingData(item.id)}
                    className="text-steel-600 hover:text-red-400 text-xs mono shrink-0 transition-colors p-1">
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

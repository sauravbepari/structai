import { useState, useEffect } from 'react'
import { useAppStore } from '../store'

const BLUEPRINT_LINES = [
  { x1: 60, y1: 40, x2: 340, y2: 40 },
  { x1: 60, y1: 40, x2: 60, y2: 260 },
  { x1: 340, y1: 40, x2: 340, y2: 260 },
  { x1: 60, y1: 260, x2: 340, y2: 260 },
  { x1: 150, y1: 40, x2: 150, y2: 130 },
  { x1: 250, y1: 40, x2: 250, y2: 130 },
  { x1: 60, y1: 130, x2: 340, y2: 130 },
  { x1: 60, y1: 180, x2: 340, y2: 180 },
  { x1: 100, y1: 180, x2: 100, y2: 260 },
  { x1: 300, y1: 180, x2: 300, y2: 260 },
  { x1: 200, y1: 130, x2: 200, y2: 260 },
]

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [animStep, setAnimStep] = useState(0)
  const [typedTitle, setTypedTitle] = useState('')
  const login = useAppStore((s) => s.login)

  const TITLE = 'StructAI'

  useEffect(() => {
    // Draw lines one by one
    const lineTimer = setInterval(() => {
      setAnimStep((s) => {
        if (s >= BLUEPRINT_LINES.length) { clearInterval(lineTimer); return s }
        return s + 1
      })
    }, 120)
    return () => clearInterval(lineTimer)
  }, [])

  useEffect(() => {
    if (animStep < BLUEPRINT_LINES.length) return
    // Type the title after lines drawn
    let i = 0
    const typeTimer = setInterval(() => {
      setTypedTitle(TITLE.slice(0, i + 1))
      i++
      if (i >= TITLE.length) clearInterval(typeTimer)
    }, 100)
    return () => clearInterval(typeTimer)
  }, [animStep])

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = login(password)
    if (!ok) {
      setError('Access denied. Check your password.')
      setPassword('')
      setTimeout(() => setError(''), 3000)
    }
  }

  const showForm = typedTitle.length === TITLE.length

  return (
    <div className="min-h-screen blueprint-grid flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Blueprint animation card */}
        <div className="glow-border rounded-xl bg-steel-900/80 backdrop-blur-sm p-8 blueprint-corner relative">

          {/* SVG Blueprint drawing */}
          <div className="flex justify-center mb-6">
            <svg width="400" height="300" viewBox="0 0 400 300" className="w-full max-w-xs opacity-60">
              {/* Grid dots */}
              {[...Array(8)].map((_, row) =>
                [...Array(10)].map((_, col) => (
                  <circle key={`${row}-${col}`}
                    cx={40 + col * 36} cy={20 + row * 36}
                    r="1" fill="rgba(49,130,206,0.3)" />
                ))
              )}

              {/* Animated structural lines */}
              {BLUEPRINT_LINES.slice(0, animStep).map((line, i) => (
                <line key={i}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="#63b3ed" strokeWidth="1.5"
                  className="draw-path"
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}

              {/* Dimension annotations */}
              {animStep > 6 && (
                <>
                  <text x="195" y="275" fill="#4299e1" fontSize="9" textAnchor="middle" fontFamily="monospace">28'-0"</text>
                  <text x="20" y="155" fill="#4299e1" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(-90,20,155)">18'-0"</text>
                  <text x="200" y="100" fill="#90cdf4" fontSize="8" textAnchor="middle" fontFamily="monospace">FOUNDATION PLAN</text>
                </>
              )}

              {/* Column markers */}
              {animStep > 4 && [
                [60,40],[150,40],[250,40],[340,40],
                [60,130],[340,130],
                [60,260],[200,260],[340,260]
              ].map(([x,y], i) => (
                <rect key={i} x={x-5} y={y-5} width="10" height="10"
                  fill="#2b6cb0" stroke="#63b3ed" strokeWidth="1" />
              ))}

              {/* Rebar indicators */}
              {animStep >= BLUEPRINT_LINES.length && (
                <>
                  <circle cx="200" cy="200" r="3" fill="#F6AD55" />
                  <circle cx="185" cy="200" r="2" fill="#F6AD55" opacity="0.7" />
                  <circle cx="215" cy="200" r="2" fill="#F6AD55" opacity="0.7" />
                  <text x="200" y="220" fill="#F6AD55" fontSize="7" textAnchor="middle" fontFamily="monospace">#5 REBAR</text>
                </>
              )}
            </svg>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold text-white mono tracking-widest">
              {typedTitle}
              {typedTitle.length < TITLE.length && (
                <span className="text-blue-400 animate-pulse">|</span>
              )}
            </h1>
            {showForm && (
              <p className="text-steel-400 text-sm mt-1 animate-fade-up mono">
                Structural Engineering AI Assistant
              </p>
            )}
          </div>

          {/* Login form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mt-6 animate-fade-up space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full bg-steel-800/60 border border-steel-600/50 rounded-lg px-4 py-3 text-white placeholder-steel-400 mono text-sm focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs mono text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-white rounded-lg py-3 mono text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              >
                ACCESS SYSTEM →
              </button>

              <p className="text-center text-steel-500 text-xs mono mt-2">
                ACI 318-19 · BNBC 2020 · Personal Use Only
              </p>
            </form>
          )}
        </div>

        {/* Bottom tag */}
        <p className="text-center text-steel-600 text-xs mono mt-4">
          v1.0.0 · Built for Rajdip · SH Engineering
        </p>
      </div>
    </div>
  )
}

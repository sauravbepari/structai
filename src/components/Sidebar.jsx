import { NavLink } from 'react-router-dom'
import { useAppStore } from '../store'

const navItems = [
  { to: '/', icon: '⬡', label: 'Analyze Drawing', exact: true },
  { to: '/calculate', icon: '∑', label: 'Calculator' },
  { to: '/units', icon: '⇄', label: 'Unit Converter' },
  { to: '/knowledge', icon: '◈', label: 'Knowledge Base' },
  { to: '/floorplan', icon: '▣', label: 'Floor Plan' },
  { to: '/training', icon: '◈', label: 'Training Hub' },
  { to: '/history', icon: '◷', label: 'History' },
]

export default function Sidebar() {
  const { codeStandard, setCodeStandard, logout } = useAppStore()

  return (
    <aside className="w-56 shrink-0 bg-steel-900/90 border-r border-steel-700/50 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-steel-700/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600/30 border border-blue-500/50 rounded flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold mono">S</span>
          </div>
          <span className="text-white font-semibold mono tracking-wider text-sm">StructAI</span>
        </div>
        <p className="text-steel-500 text-xs mono mt-0.5">Engineering Assistant</p>
      </div>

      {/* Code standard toggle */}
      <div className="px-4 py-3 border-b border-steel-700/50">
        <p className="text-steel-500 text-xs mono mb-2">CODE STANDARD</p>
        <div className="flex rounded-lg overflow-hidden border border-steel-600/50">
          <button
            onClick={() => setCodeStandard('ACI318')}
            className={`flex-1 py-1.5 text-xs mono transition-all ${
              codeStandard === 'ACI318'
                ? 'bg-blue-600/40 text-blue-300 font-medium'
                : 'text-steel-400 hover:bg-steel-700/50'
            }`}
          >
            ACI 318
          </button>
          <button
            onClick={() => setCodeStandard('BNBC2020')}
            className={`flex-1 py-1.5 text-xs mono transition-all ${
              codeStandard === 'BNBC2020'
                ? 'bg-green-600/40 text-green-300 font-medium'
                : 'text-steel-400 hover:bg-steel-700/50'
            }`}
          >
            BNBC
          </button>
        </div>
        <p className="text-steel-600 text-xs mono mt-1 text-center">
          {codeStandard === 'ACI318' ? 'ACI 318-19 Active' : 'BNBC 2020 Active'}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mono ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-steel-400 hover:text-steel-200 hover:bg-steel-700/40'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-steel-700/50">
        <button
          onClick={logout}
          className="w-full text-steel-500 hover:text-red-400 text-xs mono py-1 transition-colors"
        >
          ⊗ Logout
        </button>
      </div>
    </aside>
  )
}

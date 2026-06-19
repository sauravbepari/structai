import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from './store'
import LoginPage from './pages/LoginPage'
import Sidebar from './components/Sidebar'
import AnalyzePage from './pages/AnalyzePage'
import CalculatorPage from './pages/CalculatorPage'
import UnitConverterPage from './pages/UnitConverterPage'
import KnowledgePage from './pages/KnowledgePage'
import HistoryPage from './pages/HistoryPage'
import TrainingHubPage from './pages/TrainingHubPage'

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden blueprint-grid">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/" element={<AnalyzePage />} />
          <Route path="/calculate" element={<CalculatorPage />} />
          <Route path="/units" element={<UnitConverterPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#243b53',
            color: '#e2e8f0',
            border: '1px solid rgba(49,130,206,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          },
        }}
      />
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  )
}

import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { Brain, LayoutDashboard, Wand2, Cpu, Zap, Menu, X, Rocket, Laugh } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LearnPage from './pages/LearnPage'
import OperatePage from './pages/OperatePage'
import CreatePage from './pages/CreatePage'
import LandingPage from './pages/LandingPage'
import PageTransition from './components/PageTransition'
import MemePage from './pages/MemePage'
import './App.css'

const navItems = [
  { to: '/learn', icon: Brain, label: 'LEARN', sub: 'AI Tutor', color: 'var(--primary)' },
  { to: '/operate', icon: LayoutDashboard, label: 'OPERATE', sub: 'Campus OS', color: 'var(--secondary)' },
  { to: '/create', icon: Wand2, label: 'CREATE', sub: 'App Builder', color: 'var(--accent)' },
  { to: '/memes', icon: Laugh, label: 'MEMES', sub: 'Humor Engine', color: '#ec4899' },
]

function Sidebar({ open, setOpen }) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon"><Cpu size={22} className="text-primary" /></div>
          <div>
            <div className="logo-name">VIDYA OS</div>
            <div className="logo-sub">2.0 · Agentic Era</div>
          </div>
        </div>

        {/* Savant Status */}
        <div className="sidebar-status glass">
          <div className="pulse-dot" style={{ background: 'var(--secondary-emerald)' }} />
          <span style={{ color: 'var(--text-pure)', fontWeight: 700 }}>SOVEREIGN ACTIVE</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Intelligence Pillars</div>
          {navItems.map(({ to, icon: Icon, label, sub, color }, idx) => (
            <motion.div
              key={to}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
            >
              <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon"><Icon size={20} alt={label} /></div>
                <div>
                  <NavLabel label={label} />
                  <div className="nav-sub">{sub}</div>
                </div>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Hardware Badge */}
        <div className="sidebar-footer">
          <div className="hw-badge glass">
            <Zap size={14} className="text-accent" />
            <div>
              <div className="hw-title">AMD ROCm Engine</div>
              <div className="hw-sub">Sovereign Campus Compute</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavLabel({ label }) {
  return <div className="nav-label">{label}</div>
}

function TopBar({ setOpen }) {
  return (
    <header className="topbar glass">
      <button className="topbar-menu" onClick={() => setOpen(o => !o)}>
        <Menu size={20} />
      </button>
      <div className="topbar-title gradient-text">VIDYA OS</div>
      <div className="topbar-right">
        <div className="live-pill">
          <span className="pulse-dot"></span>
          <span>BHarat-v1</span>
        </div>
      </div>
    </header>
  )
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/learn" element={<PageTransition><LearnPage /></PageTransition>} />
        <Route path="/operate" element={<PageTransition><OperatePage /></PageTransition>} />
        <Route path="/create" element={<PageTransition><CreatePage /></PageTransition>} />
        <Route path="/memes" element={<PageTransition><MemePage /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="app-main">
          <TopBar setOpen={setSidebarOpen} />
          <main className="app-content">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

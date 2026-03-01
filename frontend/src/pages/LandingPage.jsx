import { Link } from 'react-router-dom'
import { Brain, LayoutDashboard, Wand2, Cpu, ArrowRight, Shield, Globe, Zap } from 'lucide-react'
import './LandingPage.css'

const pillars = [
    {
        to: '/learn',
        icon: Brain,
        label: 'LEARN',
        title: 'AI Tutor',
        desc: 'Multilingual concept coaching, step-by-step explanations, spaced repetition quizzes, and voice input — all running on-device.',
        color: '#6366f1',
        tags: ['Hindi', 'Tamil', 'Bengali', 'Voice', 'Quiz'],
    },
    {
        to: '/operate',
        icon: LayoutDashboard,
        label: 'OPERATE',
        title: 'Campus OS',
        desc: 'Real-time campus intelligence: energy, footfall, air quality, space utilisation, and AI-generated alerts with remediation guidance.',
        color: '#10b981',
        tags: ['Live Data', 'IoT', 'Alerts', 'Analytics', 'Digital Twin'],
    },
    {
        to: '/create',
        icon: Wand2,
        label: 'CREATE',
        title: 'App Builder',
        desc: 'Non-CS students can build and deploy AI-powered chatbots for fests, clubs, and departments in minutes — zero code required.',
        color: '#f59e0b',
        tags: ['No-Code', 'Templates', 'Publish', 'AI Powered', 'Deploy'],
    },
]

const stats = [
    { value: '100%', label: 'On-Device', sub: 'No cloud, no API fees' },
    { value: '4+', label: 'Languages', sub: 'Indian language support' },
    { value: '3', label: 'Pillars', sub: 'Learn · Operate · Create' },
    { value: '0', label: 'Data Leaks', sub: 'Privacy by design' },
]

export default function LandingPage() {
    return (
        <div className="landing">
            {/* Orbs */}
            <div className="orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.15)', top: -100, left: -100 }} />
            <div className="orb" style={{ width: 300, height: 300, background: 'rgba(16,185,129,0.1)', top: 200, right: -80 }} />
            <div className="orb" style={{ width: 250, height: 250, background: 'rgba(245,158,11,0.1)', bottom: 0, left: '40%' }} />

            {/* Hero */}
            <section className="hero">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="hero-core-wrap"
                >
                    <div className="sovereign-core">
                        <div className="core-ring"></div>
                        <div className="core-ring"></div>
                        <div className="core-ring"></div>
                        <Cpu size={40} className="core-icon" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="hero-badge glass">
                        <Zap size={14} style={{ color: 'var(--accent-saffron)' }} /> Powered by AMD Ryzen™ AI + ROCm™
                    </div>
                </motion.div>

                <motion.h1
                    className="hero-title"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    The OS Every Indian<br />
                    <span className="gradient-text">Campus Deserves</span>
                </motion.h1>

                <motion.p
                    className="hero-sub"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    VIDYA OS is a sovereign, on-device AI intelligence platform for colleges —<br />
                    private, multilingual, and running entirely on AMD hardware. No cloud. No compromise.
                </motion.p>

                <motion.div
                    className="hero-actions"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <Link to="/learn" className="btn btn-primary">
                        Start Learning <ArrowRight size={18} />
                    </Link>
                    <Link to="/operate" className="btn btn-ghost">
                        View Campus Dashboard
                    </Link>
                </motion.div>
            </section>

            {/* Stats */}
            <div className="stats-row">
                {stats.map((s, i) => (
                    <div key={i} className="stat-card glass">
                        <div className="stat-value gradient-text">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-sub">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Pillars */}
            <section className="pillars-section">
                <div className="section-title">Three Superpowers</div>
                <div className="pillars-grid">
                    {pillars.map(({ to, icon: Icon, label, title, desc, color, tags }, idx) => (
                        <motion.div
                            key={to}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <Link to={to} className="pillar-card glass glass-hover" style={{ '--p-color': color }}>
                                <div className="pillar-icon-wrap" style={{ background: `${color}10`, borderColor: `${color}30` }}>
                                    <Icon size={28} color={color} />
                                </div>
                                <div className="pillar-badge" style={{ color: color }}>{label}</div>
                                <h3 className="pillar-title">{title}</h3>
                                <p className="pillar-desc">{desc}</p>
                                <div className="pillar-tags">
                                    {tags.map(t => <span key={t} className="ptag">{t}</span>)}
                                </div>
                                <div className="pillar-cta">Explore {label} <ArrowRight size={14} /></div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Why AMD */}
            <section className="amd-section glass">
                <div className="amd-left">
                    <div className="section-title">Built for AMD Hardware</div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        VIDYA OS is architected to run entirely on-premise using AMD's AI stack.
                        Every inference call stays on campus — eliminating cloud costs, latency, and data exposure.
                    </p>
                    <div className="amd-features">
                        {[
                            { icon: Cpu, label: 'AMD Radeon GPU', sub: 'LLM inference via ROCm' },
                            { icon: Zap, label: 'Ryzen AI NPU', sub: 'Always-on voice pipeline' },
                            { icon: Shield, label: 'Zero Cloud', sub: 'All data stays on campus' },
                            { icon: Globe, label: 'CUDA Compatible', sub: 'Dev on NVIDIA, deploy on AMD' },
                        ].map(({ icon: I, label, sub }) => (
                            <div key={label} className="amd-feat">
                                <div className="amd-feat-icon"><I size={16} /></div>
                                <div><div className="amd-feat-label">{label}</div><div className="amd-feat-sub">{sub}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="amd-right">
                    <div className="arch-diagram">
                        {['React PWA + Voice UI', 'FastAPI + LangGraph Agents', 'Llama 3.2 · Whisper · Qdrant', 'AMD Radeon (ROCm) + Ryzen AI NPU'].map((l, i) => (
                            <div key={i} className="arch-layer" style={{ opacity: 1 - i * 0.08, background: `rgba(99,102,241,${0.08 + i * 0.04})` }}>
                                {l}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Zap, Users, Wind, MapPin, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react'
import './OperatePage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const BUILDING_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

function AlertBadge({ severity }) {
    const map = { critical: 'badge-danger', warning: 'badge-warning', info: 'badge-primary' }
    return <span className={`badge ${map[severity] || 'badge-primary'}`}>{severity}</span>
}

function SeverityIcon({ severity }) {
    if (severity === 'critical') return <AlertTriangle size={16} color="var(--danger)" />
    if (severity === 'warning') return <AlertTriangle size={16} color="var(--warning)" />
    return <Info size={16} color="var(--info)" />
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="chart-tooltip">
            <div className="ct-label">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="ct-row" style={{ color: p.color }}>
                    <span>{p.name}:</span> <strong>{p.value}</strong>
                </div>
            ))}
        </div>
    )
}

export default function OperatePage() {
    const [metrics, setMetrics] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(null)
    const wsRef = useRef(null)

    useEffect(() => {
        // Load history once
        fetch(`${API}/api/operate/history`).then(r => r.json()).then(d => setHistory(d.history || []))

        // Initial metrics
        fetchMetrics()

        // WebSocket for live updates
        const wsUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws')
        const ws = new WebSocket(`${wsUrl}/ws/campus`)
        ws.onmessage = e => {
            const data = JSON.parse(e.data)
            setMetrics(data)
            setLastUpdate(new Date().toLocaleTimeString())
            setLoading(false)
        }
        ws.onerror = () => fetchMetrics()
        wsRef.current = ws
        return () => ws.close()
    }, [])

    async function fetchMetrics() {
        try {
            const r = await fetch(`${API}/api/operate/metrics`)
            const d = await r.json()
            setMetrics(d)
            setLastUpdate(new Date().toLocaleTimeString())
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="operate-loading">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p>Connecting to campus sensors...</p>
        </div>
    )

    const kpis = metrics?.kpis || {}
    const buildings = metrics?.buildings || []
    const alerts = metrics?.alerts || []
    const maxOcc = Math.max(...buildings.map(b => b.occupancy), 1)

    return (
        <div className="operate-page">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="page-header Savant-header"
            >
                <div>
                    <h1><span className="gradient-text">OPERATE</span> — Campus Intelligence</h1>
                    <p className="indic">Sovereign real-time monitoring • Last updated {lastUpdate || '—'}</p>
                </div>
                <div className="header-actions">
                    <div className="live-status-badge">
                        <div className="pulse-dot" />
                        AMD ROCm Engine Online
                    </div>
                    <button className="btn btn-ghost" onClick={fetchMetrics}><RefreshCw size={14} /> Sync</button>
                </div>
            </motion.div>

            {/* Bento Grid Dashboard */}
            <div className="bento-dashboard">
                {/* KPI Area */}
                <div className="bento-item kpi-strip">
                    {[
                        { icon: Users, label: "Footfall", val: kpis.total_footfall?.toLocaleString(), color: "var(--primary-violet)" },
                        { icon: Zap, label: "Energy", val: `${kpis.total_energy_kwh} kWh`, color: "var(--accent-saffron)" },
                        { icon: MapPin, label: "Active", val: `${kpis.active_spaces}/8`, color: "var(--secondary-emerald)" },
                        { icon: Wind, label: "AQI", val: kpis.air_quality_aqi, color: kpis.air_quality_aqi < 50 ? 'var(--secondary-emerald)' : 'var(--accent-saffron)' }
                    ].map((k, i) => (
                        <motion.div
                            key={k.label}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="mini-kpi glass"
                        >
                            <k.icon size={16} color={k.color} />
                            <div>
                                <div className="mk-val" style={{ color: k.color }}>{k.val}</div>
                                <div className="mk-lab">{k.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Visual: Energy Chart */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bento-item main-chart glass"
                >
                    <div className="card-title"><Zap size={14} /> Power Grid Load</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={history} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                            <defs>
                                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-saffron)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--accent-saffron)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-ghost)', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-ghost)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="energy" stroke="var(--accent-saffron)" fill="url(#energyGrad)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Sidebar area: Alerts */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bento-item alerts-panel glass"
                >
                    <div className="card-title">
                        <AlertTriangle size={14} /> AI Diagnostics
                        {alerts.length > 0 && <span className="alert-count">{alerts.length}</span>}
                    </div>
                    <div className="alerts-scroll">
                        {alerts.length === 0 ? (
                            <div className="all-clear">
                                <CheckCircle size={40} color="var(--secondary-emerald)" />
                                <p>Sovereign systems optimal</p>
                            </div>
                        ) : (
                            alerts.map((a, i) => (
                                <div key={i} className={`savant-alert alert-${a.severity}`}>
                                    <div className="sa-head">
                                        <SeverityIcon severity={a.severity} />
                                        <span>{a.location}</span>
                                        <span className="sa-time">{a.time}</span>
                                    </div>
                                    <div className="sa-body">{a.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Bottom area: Space Utilisation & Analytics */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bento-item spaces-grid glass"
                >
                    <div className="card-title"><MapPin size={14} /> Occupancy Matrix</div>
                    <div className="matrix-wrap">
                        {buildings.map((b, i) => (
                            <div key={b.id} className="matrix-tile">
                                <div className="mt-head">
                                    <span className="mt-name">{b.name}</span>
                                    <span className="mt-pct">{b.occupancy}%</span>
                                </div>
                                <div className="mt-bar-wrap">
                                    <motion.div
                                        className="mt-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${b.occupancy}%` }}
                                        style={{ background: BUILDING_COLORS[i % BUILDING_COLORS.length] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

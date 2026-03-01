import { useState, useEffect } from 'react'
import { Laugh, RefreshCw, Share2, Sparkles, Image as ImageIcon } from 'lucide-react'
import './MemePage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function MemePage() {
    const [situations, setSituations] = useState([])
    const [selectedSit, setSelectedSit] = useState('')
    const [meme, setMeme] = useState(null)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchSituations()
    }, [])

    async function fetchSituations() {
        setRefreshing(true)
        try {
            const resp = await fetch(`${API}/api/meme/trending`)
            const data = await resp.json()
            setSituations(data.situations || [])
            if (data.situations?.length > 0) setSelectedSit(data.situations[0])
        } catch (e) { console.error(e) }
        setRefreshing(false)
    }

    async function generateMeme() {
        if (!selectedSit || loading) return
        setLoading(true)
        try {
            const resp = await fetch(`${API}/api/meme/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ situation: selectedSit })
            })
            const data = await resp.json()
            // In a real app, we'd use an image gen API too, but for this hackathon, 
            // we'll use a dynamic stylish text-based meme card.
            setMeme(data)
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    return (
        <div className="meme-page fade-in">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="page-header learn-header"
            >
                <h1><span className="gradient-text">MEME ZONE</span> — Campus Pulse</h1>
                <p className="indic">Sovereign Humor Engine • 100% Relatable • Verified Fun</p>
            </motion.div>

            <div className="meme-layout">
                {/* Left: Creator */}
                <div className="meme-creator card">
                    <div className="card-title"><Laugh size={14} /> Pick your Struggle</div>
                    <div className="situation-list">
                        {situations.map((s, i) => (
                            <button
                                key={i}
                                className={`situation-item ${selectedSit === s ? 'active' : ''}`}
                                onClick={() => setSelectedSit(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button className="btn btn-ghost" onClick={fetchSituations} disabled={refreshing}>
                            <RefreshCw size={14} className={refreshing ? 'spinner' : ''} /> New Topics
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={generateMeme} disabled={loading || !selectedSit}>
                            {loading ? <div className="spinner" /> : <><Sparkles size={14} /> Generate Meme</>}
                        </button>
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="meme-preview">
                    {meme ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            className="meme-card glass-premium fade-in"
                        >
                            <div className="meme-main">
                                <div className="meme-top-text">{meme.caption.top || 'TOP TEXT'}</div>
                                <div className="meme-visual-premium">
                                    <ImageIcon size={48} className="meme-icon-bg" />
                                    <div className="meme-overlay-sit">{meme.situation}</div>
                                </div>
                                <div className="meme-bottom-text">{meme.caption.bottom || 'BOTTOM TEXT'}</div>
                            </div>
                            <div className="meme-actions">
                                <button className="btn btn-primary w-full"><Share2 size={14} /> Circulate in Campus Network</button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="meme-placeholder glass">
                            <Laugh size={48} className="placeholder-icon" />
                            <p>Pick your struggle and forge a meme...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

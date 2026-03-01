import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Plus, Eye, Rocket, MessageSquare, CheckCircle, ChevronRight, Copy } from 'lucide-react'
import './CreatePage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function TemplateCard({ tpl, selected, onClick }) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`template-card glass ${selected ? 'selected-premium' : ''}`}
            onClick={onClick}
        >
            <div className="tpl-icon">{tpl.icon}</div>
            <div className="tpl-name">{tpl.name}</div>
            <div className="tpl-desc">{tpl.description}</div>
            {selected && <div className="tpl-check"><CheckCircle size={16} /> Active</div>}
        </motion.div>
    )
}

function FormField({ field, value, onChange }) {
    if (field.type === 'text_input') return (
        <div className="form-field">
            <label className="field-label">{field.label}</label>
            <input className="input" placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
        </div>
    )
    if (field.type === 'textarea') return (
        <div className="form-field">
            <label className="field-label">{field.label}</label>
            <textarea className="input" rows={5} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
    )
    if (field.type === 'select') return (
        <div className="form-field">
            <label className="field-label">{field.label}</label>
            <select className="input" value={value || field.options[0]} onChange={e => onChange(e.target.value)}>
                {field.options.map(o => <option key={o}>{o}</option>)}
            </select>
        </div>
    )
    if (field.type === 'color_picker') return (
        <div className="form-field">
            <label className="field-label">{field.label}</label>
            <div className="color-field">
                <input type="color" value={value || field.default} onChange={e => onChange(e.target.value)} className="color-input" />
                <span className="color-val">{value || field.default}</span>
            </div>
        </div>
    )
    return null
}

function MiniChat({ app }) {
    const [msgs, setMsgs] = useState([{ role: 'assistant', content: `Hi! I'm the ${app.name} assistant. How can I help you?` }])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    async function send() {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput('')
        const newMsgs = [...msgs, { role: 'user', content: userMsg }]
        setMsgs(newMsgs)
        setLoading(true)
        setMsgs(m => [...m, { role: 'assistant', content: '', streaming: true }])
        try {
            const resp = await fetch(`${API}/api/create/apps/${app.id}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg })
            })
            const reader = resp.body.getReader()
            const decoder = new TextDecoder()
            let full = ''
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                full += decoder.decode(value)
                setMsgs(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: full } : msg))
            }
            setMsgs(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, streaming: false } : msg))
        } catch (e) {
            setMsgs(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: '⚠️ Backend not reachable.', streaming: false } : msg))
        }
        setLoading(false)
    }

    return (
        <div className="mini-chat" style={{ '--app-color': app.config?.['Theme Color'] || '#6366f1' }}>
            <div className="mini-chat-header">
                <MessageSquare size={14} />
                <span>{app.name}</span>
                <span className="badge badge-success">● Live</span>
            </div>
            <div className="mini-messages">
                {msgs.map((m, i) => (
                    <div key={i} className={`mini-msg ${m.role === 'user' ? 'mini-user' : 'mini-ai'} ${m.streaming ? 'cursor' : ''}`}>{m.content}</div>
                ))}
            </div>
            <div className="mini-input">
                <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." />
                <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ height: 42, padding: '0 12px' }}><ChevronRight size={16} /></button>
            </div>
        </div>
    )
}

export default function CreatePage() {
    const [templates, setTemplates] = useState([])
    const [selectedTpl, setSelectedTpl] = useState(null)
    const [config, setConfig] = useState({})
    const [appName, setAppName] = useState('')
    const [publishedApp, setPublishedApp] = useState(null)
    const [myApps, setMyApps] = useState([])
    const [step, setStep] = useState('gallery') // gallery | build | preview
    const [publishing, setPublishing] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetch(`${API}/api/create/templates`).then(r => r.json()).then(d => setTemplates(d.templates || []))
        fetch(`${API}/api/create/apps`).then(r => r.json()).then(d => setMyApps(d.apps || []))
    }, [])

    function selectTemplate(tpl) {
        setSelectedTpl(tpl)
        setConfig({})
        setAppName(`My ${tpl.name}`)
        setStep('build')
    }

    async function publish() {
        setPublishing(true)
        try {
            const resp = await fetch(`${API}/api/create/apps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: appName, template_id: selectedTpl.id, config })
            })
            const app = await resp.json()
            setPublishedApp(app)
            setMyApps(a => [app, ...a])
            setStep('preview')
        } catch (e) { alert('Backend not reachable. Start the server first.') }
        setPublishing(false)
    }

    function copyLink() {
        navigator.clipboard.writeText(publishedApp?.share_url || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="create-page fade-in">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="page-header learn-header"
            >
                <h1><span className="gradient-text">CREATE</span> — App Forge</h1>
                <p className="indic">Sovereign no-code engine powered by Vidya Intelligence</p>
            </motion.div>

            {/* Step indicator */}
            <div className="steps-bar">
                {['Choose Template', 'Configure', 'Preview & Deploy'].map((s, i) => {
                    const stepIdx = ['gallery', 'build', 'preview'].indexOf(step)
                    return (
                        <div key={i} className={`step-item ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}`}>
                            <div className="step-num">{i < stepIdx ? '✓' : i + 1}</div>
                            <span>{s}</span>
                            {i < 2 && <ChevronRight size={14} className="step-arrow" />}
                        </div>
                    )
                })}
            </div>

            {/* Gallery */}
            {step === 'gallery' && (
                <div>
                    <div className="tpl-grid">
                        {templates.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} selected={selectedTpl?.id === tpl.id} onClick={() => selectTemplate(tpl)} />)}
                    </div>
                    {myApps.length > 0 && (
                        <div className="card" style={{ marginTop: 24 }}>
                            <div className="card-title">My Published Apps</div>
                            <div className="my-apps-list">
                                {myApps.map(a => (
                                    <div key={a.id} className="my-app-row">
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.template_id} • {new Date(a.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <button className="btn btn-ghost" onClick={() => { setPublishedApp(a); setStep('preview') }}>
                                            <Eye size={14} /> Preview
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Build */}
            {step === 'build' && selectedTpl && (
                <div className="build-layout">
                    <div className="build-form card">
                        <div className="card-title"><Wand2 size={14} /> Configure — {selectedTpl.icon} {selectedTpl.name}</div>
                        <div className="form-field">
                            <label className="field-label">App Name</label>
                            <input className="input" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Name your app" />
                        </div>
                        {selectedTpl.components.map((f, i) => (
                            <FormField key={i} field={f} value={config[f.label]} onChange={v => setConfig(c => ({ ...c, [f.label]: v }))} />
                        ))}
                        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                            <button className="btn btn-ghost" onClick={() => setStep('gallery')}>← Back</button>
                            <button className="btn btn-success" onClick={publish} disabled={publishing || !appName.trim()}>
                                {publishing ? <><div className="spinner" /> Publishing...</> : <><Rocket size={14} /> Publish App</>}
                            </button>
                        </div>
                    </div>

                    <div className="build-preview card">
                        <div className="card-title"><Eye size={14} /> Live Preview</div>
                        <div className="preview-mockup" style={{ '--app-color': config['Theme Color'] || config['Brand Color'] || '#6366f1' }}>
                            <div className="mockup-header">
                                <div className="mockup-dot" /><div className="mockup-dot" /><div className="mockup-dot" />
                                <span>{appName || 'My App'}</span>
                            </div>
                            <div className="mockup-body">
                                <div className="mockup-bubble ai-bubble">
                                    👋 Hi! I'm the <strong>{appName || selectedTpl.name}</strong> assistant.<br />
                                    {config['FAQ Content']?.split('\n')[0] || config['Event Schedule']?.split('\n')[0] || 'Ask me anything!'}
                                </div>
                                <div className="mockup-bubble user-bubble">Tell me more...</div>
                            </div>
                            <div className="mockup-input">
                                <div className="mockup-input-box">Type a message...</div>
                                <div className="mockup-send">→</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview */}
            {step === 'preview' && publishedApp && (
                <div className="preview-layout">
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', align: 'center', gap: 12, marginBottom: 20 }}>
                            <CheckCircle size={24} color="var(--success)" />
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>App Published!</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your app is live and ready to use</div>
                            </div>
                        </div>
                        <div className="share-box">
                            <div className="share-url">{publishedApp.share_url}</div>
                            <button className="btn btn-ghost" onClick={copyLink}><Copy size={14} />{copied ? 'Copied!' : 'Copy'}</button>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button className="btn btn-ghost" onClick={() => setStep('gallery')}>← New App</button>
                        </div>
                    </div>
                    <MiniChat app={publishedApp} />
                </div>
            )}
        </div>
    )
}

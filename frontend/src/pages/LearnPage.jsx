import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, BookOpen, GraduationCap, Languages, Sparkles, RotateCcw } from 'lucide-react'
import './LearnPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Bengali']

const SUGGESTED = [
    "Explain Dijkstra's algorithm with an example",
    "What is the CAP theorem in databases?",
    "How does gradient descent work in ML?",
    "Explain operating system process scheduling",
    "What is Fourier Transform and where is it used?",
    "Explain REST vs GraphQL APIs",
]

export default function LearnPage() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Namaste! 🙏 I'm **VIDYA**, your AI tutor. Ask me anything — concepts, problem-solving, exam prep. I support English, Hindi, Tamil, and Bengali.\n\nWhat would you like to explore today?" }
    ])
    const [input, setInput] = useState('')
    const [language, setLanguage] = useState('English')
    const [loading, setLoading] = useState(false)
    const [listening, setListening] = useState(false)
    const [quiz, setQuiz] = useState(null)
    const [quizAnswers, setQuizAnswers] = useState({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const bottomRef = useRef(null)
    const recognitionRef = useRef(null)

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

    function startVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input not supported in this browser. Try Chrome.')
            return
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        const r = new SR()
        r.lang = language === 'Hindi' ? 'hi-IN' : language === 'Tamil' ? 'ta-IN' : language === 'Bengali' ? 'bn-IN' : 'en-IN'
        r.onresult = e => { setInput(e.results[0][0].transcript); setListening(false) }
        r.onerror = () => setListening(false)
        r.onend = () => setListening(false)
        recognitionRef.current = r
        r.start()
        setListening(true)
    }

    function stopVoice() {
        recognitionRef.current?.stop()
        setListening(false)
    }

    async function send(text) {
        const userMsg = text || input.trim()
        if (!userMsg || loading) return
        setInput('')
        setQuiz(null)
        setQuizSubmitted(false)

        const newMessages = [...messages, { role: 'user', content: userMsg }]
        setMessages(newMessages)
        setLoading(true)

        setMessages(m => [...m, { role: 'assistant', content: '', streaming: true }])

        try {
            const resp = await fetch(`${API}/api/learn/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userMsg,
                    thread_id: 'student_1', // In a real app, this would be the logged-in user's ID
                    mode: 'learn',
                    language,
                }),
            })
            const reader = resp.body.getReader()
            const decoder = new TextDecoder()
            let full = ''
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value)
                full += chunk
                setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: full } : msg))
            }
            setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, streaming: false } : msg))
        } catch (e) {
            setMessages(m => m.map((msg, i) => i === m.length - 1
                ? { ...msg, content: '⚠️ Could not reach VIDYA OS backend. Make sure the server is running on port 8000.', streaming: false }
                : msg))
        }
        setLoading(false)
    }

    async function generateQuiz() {
        if (messages.length < 2) return
        setLoading(true)
        try {
            const lastUser = [...messages].reverse().find(m => m.role === 'user')
            const resp = await fetch(`${API}/api/learn/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: lastUser?.content || 'General Science', language }),
            })
            const data = await resp.json()
            if (data.quiz?.length) { setQuiz(data.quiz); setQuizAnswers({}); setQuizSubmitted(false) }
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    function renderMessage(msg, idx) {
        const isUser = msg.role === 'user'
        const parts = msg.content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
        const rendered = parts.map((p, i) => {
            if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
            if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="inline-code">{p.slice(1, -1)}</code>
            return p
        })

        return (
            <div key={idx} className={`msg ${isUser ? 'msg-user' : 'msg-ai'} fade-in`}>
                {!isUser && <div className="msg-avatar">🧠</div>}
                <div className={`msg-bubble ${isUser ? 'bubble-user' : 'bubble-ai'} ${msg.streaming ? 'cursor' : ''}`}>
                    {rendered}
                </div>
                {isUser && <div className="msg-avatar user-av">YOU</div>}
            </div>
        )
    }

    return (
        <div className="learn-layout">
            {/* Left: Chat */}
            <div className="learn-chat">
                <div className="page-header">
                    <h1><span className="gradient-text">LEARN</span> — AI Tutor</h1>
                    <p>Multilingual concept coaching powered by on-device LLM</p>
                </div>

                {/* Lang + actions */}
                <div className="learn-controls">
                    <div className="lang-pills">
                        {LANGUAGES.map(l => (
                            <button key={l} className={`lang-pill ${language === l ? 'active' : ''}`} onClick={() => setLanguage(l)}>{l}</button>
                        ))}
                    </div>
                    <button className="btn btn-ghost" onClick={generateQuiz} disabled={loading || messages.length < 2}>
                        <Sparkles size={14} /> Quiz Me
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setMessages([]); setQuiz(null) }}>
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-window">
                    {messages.map(renderMessage)}
                    {loading && !messages[messages.length - 1]?.streaming && (
                        <div className="msg msg-ai">
                            <div className="msg-avatar">🧠</div>
                            <div className="bubble-ai typing-indicator"><span /><span /><span /></div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quiz */}
                {quiz && (
                    <div className="quiz-panel fade-in">
                        <div className="quiz-title"><Sparkles size={16} /> Quick Quiz</div>
                        {quiz.map((q, qi) => (
                            <div key={qi} className="quiz-q">
                                <div className="quiz-question">{qi + 1}. {q.q}</div>
                                <div className="quiz-options">
                                    {q.options.map((opt, oi) => {
                                        const letter = String.fromCharCode(65 + oi)
                                        const selected = quizAnswers[qi] === letter
                                        const correct = quizSubmitted && letter === q.answer
                                        const wrong = quizSubmitted && selected && letter !== q.answer
                                        return (
                                            <button key={oi}
                                                className={`quiz-opt ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                                                onClick={() => !quizSubmitted && setQuizAnswers(a => ({ ...a, [qi]: letter }))}>
                                                <span className="opt-letter">{letter}</span> {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        {!quizSubmitted
                            ? <button className="btn btn-primary" onClick={() => setQuizSubmitted(true)}>Submit Answers</button>
                            : <div className="quiz-score">
                                Score: {quiz.filter((q, i) => quizAnswers[i] === q.answer).length}/{quiz.length} ✨
                            </div>
                        }
                    </div>
                )}

                {/* Input */}
                <div className="chat-input-area">
                    <div className="chat-input-box">
                        <input
                            className="input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder={`Ask anything in ${language}...`}
                        />
                        <button className={`voice-btn ${listening ? 'listening' : ''}`} onClick={listening ? stopVoice : startVoice}>
                            {listening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button className="btn btn-primary send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Sidebar */}
            <aside className="learn-sidebar">
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-title"><BookOpen size={14} /> Quick Topics</div>
                    <div className="suggested-list">
                        {SUGGESTED.map((s, i) => (
                            <button key={i} className="suggested-item" onClick={() => send(s)}>{s}</button>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <div className="card-title"><GraduationCap size={14} /> Model Info</div>
                    <div className="model-info">
                        <div className="mi-row"><span className="mi-label">Model</span><span className="badge badge-primary">Phi-3.5-mini</span></div>
                        <div className="mi-row"><span className="mi-label">Inference</span><span className="badge badge-success">HF Cloud</span></div>
                        <div className="mi-row"><span className="mi-label">Privacy</span><span className="badge badge-success">Sovereign API</span></div>
                        <div className="mi-row"><span className="mi-label">Languages</span><span className="mi-val">4</span></div>
                    </div>
                </div>
            </aside>
        </div>
    )
}

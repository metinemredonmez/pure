'use client'

import { useEffect, useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const SESSION_KEY = 'pureolentia_chat_session'

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  time: string
}

function nowTime() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

const SUGGESTIONS = [
  '☕ En çok satan kahveler?',
  '📦 Kargo ne zaman gelir?',
  '🎁 Kurumsal hediye paketleri',
  '💳 Nasıl ödeme yapabilirim?',
]

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [hasUnread, setHasUnread] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize session
  useEffect(() => {
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(SESSION_KEY, sid)
    }
    setSessionId(sid)

    // Welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: 'Merhaba! Pure Olentia asistanıyım ☕ Size nasıl yardımcı olabilirim? Kahve önerisi, sipariş durumu, abonelik veya herhangi bir konuda sorabilirsiniz.',
        time: nowTime(),
      },
    ])
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  // Flash unread badge every 30s when closed
  useEffect(() => {
    if (open) {
      setHasUnread(false)
      return
    }
    const t = setTimeout(() => setHasUnread(true), 30000)
    return () => clearTimeout(t)
  }, [open])

  const send = async (text?: string) => {
    const message = (text ?? input).trim()
    if (!message || sending) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: message,
      time: nowTime(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pureolentia_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message }),
      })
      const json = await res.json().catch(() => null)

      const reply =
        json?.data?.response ||
        json?.data?.reply ||
        json?.data?.message ||
        json?.response ||
        json?.reply ||
        json?.message ||
        'Üzgünüm, şu anda yanıt veremiyorum. Lütfen iletişim sayfamızdan bize ulaşın.'

      setMessages((prev) => [
        ...prev,
        { id: `b_${Date.now()}`, role: 'bot', text: String(reply), time: nowTime() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          role: 'bot',
          text: 'Bağlantı kurulamadı. Lütfen birazdan tekrar deneyin.',
          time: nowTime(),
        },
      ])
    }
    setSending(false)
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Sohbet"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-primary-800 text-white shadow-2xl transition hover:scale-110 sm:h-16 sm:w-16"
        style={{ boxShadow: '0 10px 30px rgba(139, 69, 19, 0.4)' }}
      >
        {/* Steam animation — only when closed */}
        {!open && (
          <div className="pointer-events-none absolute -top-2 left-1/2 flex -translate-x-1/2 gap-0.5">
            <span className="block h-3 w-0.5 rounded-full bg-white/40 animate-steam-1" />
            <span className="block h-4 w-0.5 rounded-full bg-white/50 animate-steam-2" />
            <span className="block h-3 w-0.5 rounded-full bg-white/40 animate-steam-3" />
          </div>
        )}

        {/* Coffee cup icon (or X) */}
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-7 w-7 animate-cup-wobble" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h13v6a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM16 10h1a3 3 0 010 6h-1" />
            <path strokeLinecap="round" d="M7 3.5c0 1 1 1 1 2M10 3.5c0 1 1 1 1 2M13 3.5c0 1 1 1 1 2" className="animate-pulse" />
          </svg>
        )}

        {/* Unread dot */}
        {!open && hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[550px] max-h-[80vh] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-primary-800 to-amber-800 px-4 py-3 text-white">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h13v6a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM16 10h1a3 3 0 010 6h-1" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Pure Olentia Asistan</p>
              <p className="text-xs text-white/70">Çevrimiçi • Genelde dakikalar içinde cevaplar</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4 dark:bg-neutral-800/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-primary-700 text-white'
                      : 'rounded-bl-sm bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      m.role === 'user' ? 'text-white/60' : 'text-neutral-400'
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm dark:bg-neutral-700">
                  <span className="block h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                  <span className="block h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                  <span className="block h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions — always visible so user can keep asking */}
          <div className="hidden-scrollbar flex gap-1.5 overflow-x-auto border-t border-neutral-100 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s.replace(/^[^\s]+\s/, ''))}
                disabled={sending}
                className="whitespace-nowrap rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 transition hover:border-primary-400 hover:bg-primary-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              disabled={sending}
              className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white transition hover:bg-primary-800 disabled:opacity-50"
              aria-label="Gönder"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Inline styles for custom animations */}
      <style jsx global>{`
        @keyframes steam-1 {
          0%, 100% { transform: translateY(0) scaleY(0.8); opacity: 0.3; }
          50% { transform: translateY(-4px) scaleY(1.2); opacity: 0.7; }
        }
        @keyframes steam-2 {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.5; }
          50% { transform: translateY(-6px) scaleY(1.3); opacity: 0.9; }
        }
        @keyframes steam-3 {
          0%, 100% { transform: translateY(0) scaleY(0.9); opacity: 0.4; }
          50% { transform: translateY(-5px) scaleY(1.1); opacity: 0.8; }
        }
        @keyframes cup-wobble {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-steam-1 { animation: steam-1 1.8s ease-in-out infinite; }
        .animate-steam-2 { animation: steam-2 2.2s ease-in-out infinite 0.3s; }
        .animate-steam-3 { animation: steam-3 2s ease-in-out infinite 0.6s; }
        .animate-cup-wobble { animation: cup-wobble 3s ease-in-out infinite; transform-origin: bottom center; }
      `}</style>
    </>
  )
}

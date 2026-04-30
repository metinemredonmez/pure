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
  { emoji: '☕', text: 'En çok satan kahveler?' },
  { emoji: '📦', text: 'Kargo ne zaman gelir?' },
  { emoji: '🎁', text: 'Kurumsal hediye paketleri' },
  { emoji: '💬', text: 'Bir temsilciyle görüşmek istiyorum' },
]

/**
 * Bot mesajındaki URL'leri tıklanabilir link, **bold** ifadeleri kalın yapar.
 * WhatsApp linkleri yeşil + ikonlu rendreder.
 */
function renderMessage(text: string, isUser: boolean): React.ReactNode {
  if (isUser) return text

  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const boldRegex = /\*\*([^*]+)\*\*/g

  const tokens: { type: 'text' | 'bold' | 'url'; value: string }[] = []
  let working = text
  // 1. Önce bold'ları kapsa
  const placeholders: string[] = []
  working = working.replace(boldRegex, (_, b) => {
    placeholders.push(b)
    return `${placeholders.length - 1}`
  })
  // 2. URL'leri ayrıştır
  working.split(urlRegex).forEach((seg) => {
    if (urlRegex.test(seg)) {
      tokens.push({ type: 'url', value: seg })
    } else {
      // bold placeholder split
      const re = /(\d+)/g
      let m: RegExpExecArray | null
      let last = 0
      while ((m = re.exec(seg)) !== null) {
        if (m.index > last) tokens.push({ type: 'text', value: seg.slice(last, m.index) })
        tokens.push({ type: 'bold', value: placeholders[Number(m[1])] })
        last = m.index + m[0].length
      }
      if (last < seg.length) tokens.push({ type: 'text', value: seg.slice(last) })
    }
  })

  return tokens.map((t, i) => {
    if (t.type === 'bold') return <strong key={i}>{t.value}</strong>
    if (t.type === 'url') {
      const isWhatsapp = /wa\.me|whatsapp\.com/i.test(t.value)
      const isInternal = t.value.startsWith('/') || /pureolentia\.com/.test(t.value)
      const display = isWhatsapp ? 'WhatsApp\'tan Yaz' : isInternal ? t.value.replace(/^https?:\/\/[^/]+/, '') : t.value
      return (
        <a
          key={i}
          href={t.value}
          target={t.value.startsWith('/') ? '_self' : '_blank'}
          rel="noreferrer"
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 mx-0.5 text-xs font-semibold transition ${
            isWhatsapp
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
          }`}
        >
          {isWhatsapp && <span aria-hidden>📱</span>}
          {display}
        </a>
      )
    }
    return <span key={i}>{t.value}</span>
  })
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [hasUnread, setHasUnread] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize session
  useEffect(() => {
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(SESSION_KEY, sid)
    }
    setSessionId(sid)

    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: 'Merhaba! Pure Olentia asistanıyım. Size nasıl yardımcı olabilirim? Kahve önerisi, sipariş durumu, abonelik veya herhangi bir konuda sorabilirsiniz.',
        time: nowTime(),
      },
    ])
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, sending])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

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

  // Logo avatar — stylized coffee bean mark, subtle and premium
  const BrandAvatar = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none">
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.9" />
      <path
        d="M8.5 5.5c2 1.6 2 4.8 0 6.4-2 1.6-2 4.8 0 6.4M15.5 5.5c-2 1.6-2 4.8 0 6.4 2 1.6 2 4.8 0 6.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Sohbeti kapat' : 'Sohbeti aç'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5E3C] via-[#6B4423] to-[#3D2817] text-white transition-all duration-300 hover:scale-110 active:scale-95 sm:h-16 sm:w-16"
        style={{ boxShadow: '0 12px 36px -6px rgba(61, 40, 23, 0.55), 0 4px 12px rgba(0, 0, 0, 0.15)' }}
      >
        {/* Soft glow ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/20 to-transparent" aria-hidden />
        )}

        {/* Steam (only when closed) */}
        {!open && (
          <div className="pointer-events-none absolute -top-2.5 left-1/2 flex -translate-x-1/2 gap-0.5" aria-hidden>
            <span className="block h-3 w-0.5 rounded-full bg-white/50 animate-steam-1" />
            <span className="block h-4 w-0.5 rounded-full bg-white/60 animate-steam-2" />
            <span className="block h-3 w-0.5 rounded-full bg-white/50 animate-steam-3" />
          </div>
        )}

        {/* Coffee cup icon (or X) */}
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h13v6a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM16 10h1a3 3 0 010 6h-1" />
          </svg>
        )}

        {/* Unread dot */}
        {!open && hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex h-[580px] max-h-[82vh] w-[calc(100vw-3rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white backdrop-blur-xl animate-chat-in dark:border-neutral-800 dark:bg-neutral-900"
          style={{ boxShadow: '0 25px 60px -12px rgba(61, 40, 23, 0.35), 0 8px 24px -8px rgba(0, 0, 0, 0.12)' }}
        >
          {/* Header — premium with pattern */}
          <div className="relative overflow-hidden">
            {/* Gradient layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6B4423] via-[#5A3A1E] to-[#3D2817]" aria-hidden />
            {/* Subtle pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative flex items-center gap-3 px-4 py-3.5 text-white">
              {/* Avatar */}
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/25 to-white/5 ring-1 ring-white/25 backdrop-blur-sm">
                <BrandAvatar size={22} className="text-white" />
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#5A3A1E]">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold leading-tight tracking-tight">
                  Pure Olentia Asistan
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-1.5 py-px text-[10px] font-medium text-emerald-100 ring-1 ring-inset ring-emerald-300/30">
                    <span className="h-1 w-1 rounded-full bg-emerald-300" />
                    Çevrimiçi
                  </span>
                  <span className="truncate text-[11px] text-white/60">Genelde dakikalar içinde</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            style={{
              background:
                'linear-gradient(180deg, #FAF6F1 0%, #F5EFE7 100%)',
            }}
          >
            {messages.map((m, i) => {
              const prev = messages[i - 1]
              const isFirstInGroup = !prev || prev.role !== m.role
              return (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {/* Bot avatar appears only for first message in group */}
                  {m.role === 'bot' && (
                    <div className="mr-2 flex h-7 w-7 shrink-0 items-end">
                      {isFirstInGroup && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#5A3A1E] text-white shadow-sm">
                          <BrandAvatar size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-gradient-to-br from-[#6B4423] to-[#4A2F1A] text-white'
                        : 'rounded-bl-md bg-white text-neutral-900 ring-1 ring-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{renderMessage(m.text, m.role === 'user')}</p>
                    <p
                      className={`mt-1 text-[10px] tracking-wide ${
                        m.role === 'user' ? 'text-white/55' : 'text-neutral-400'
                      }`}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              )
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#5A3A1E] text-white shadow-sm">
                  <BrandAvatar size={14} className="text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-800 dark:ring-neutral-700">
                  <span className="block h-1.5 w-1.5 animate-typing-dot rounded-full bg-[#8B5E3C]" style={{ animationDelay: '0s' }} />
                  <span className="block h-1.5 w-1.5 animate-typing-dot rounded-full bg-[#8B5E3C]" style={{ animationDelay: '0.15s' }} />
                  <span className="block h-1.5 w-1.5 animate-typing-dot rounded-full bg-[#8B5E3C]" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="hidden-scrollbar flex gap-1.5 overflow-x-auto border-t border-neutral-100 bg-white/80 px-3 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => send(s.text)}
                disabled={sending}
                className="group flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11.5px] font-medium text-neutral-700 shadow-sm transition hover:border-[#8B5E3C] hover:bg-[#FAF6F1] hover:text-[#5A3A1E] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <span className="text-sm">{s.emoji}</span>
                <span className="whitespace-nowrap">{s.text}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              disabled={sending}
              className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm transition focus:border-[#8B5E3C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B4423] to-[#3D2817] text-white shadow-md transition hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:shadow-none"
              aria-label="Gönder"
            >
              <svg className="h-4 w-4 -translate-x-px translate-y-px" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.4 1.05L4 12l-2 7.35a1 1 0 001.4 1.05z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Animations */}
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
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes chat-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-steam-1 { animation: steam-1 1.8s ease-in-out infinite; }
        .animate-steam-2 { animation: steam-2 2.2s ease-in-out infinite 0.3s; }
        .animate-steam-3 { animation: steam-3 2s ease-in-out infinite 0.6s; }
        .animate-typing-dot { animation: typing-dot 1.2s ease-in-out infinite; }
        .animate-chat-in { animation: chat-in 220ms cubic-bezier(0.22, 1, 0.36, 1); transform-origin: bottom right; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}

import React, { useState, useRef, useEffect } from 'react';

// ============================================================
// SYSTEM PROMPT - Kepribadian & Instruksi untuk AI Goldrazz
// ============================================================
const SYSTEM_PROMPT = `Kamu adalah Goldrazz Assistant, asisten AI premium yang sangat cerdas, sopan, dan membantu. 

Pedoman perilakumu:
- Selalu jawab dalam Bahasa Indonesia yang sopan, ramah, dan profesional
- Gunakan sapaan seperti "Anda" bukan "kamu" agar terkesan lebih menghormati
- Berikan jawaban yang akurat, lengkap, dan mudah dipahami
- Gunakan format yang rapi: gunakan bullet points, numbering, atau paragraf sesuai kebutuhan
- Jika ada pertanyaan teknis, berikan penjelasan step-by-step
- Tambahkan emoji yang relevan untuk membuat percakapan lebih hidup (tapi tidak berlebihan)
- Jika tidak tahu jawabannya, jujur katakan dan tawarkan alternatif
- Selalu akhiri jawaban panjang dengan ringkasan atau poin utama
- Ingat konteks percakapan sebelumnya dan rujuk jika relevan`;

// ============================================================
// FITUR: Suggestion Chips (Pertanyaan Cepat)
// ============================================================
const SUGGESTION_CHIPS = [
  "💡 Tips produktivitas harian",
  "📝 Bantu saya menulis email",
  "🔧 Jelaskan cara kerja AI",
  "🌍 Fakta menarik dunia",
  "💻 Bantu debug kode saya",
  "📊 Cara membuat presentasi bagus",
];

// ============================================================
// FITUR: Format teks dari AI (bold, bullet, dll)
// ============================================================
function FormattedMessage({ content }) {
  const lines = content.split('\n');
  return (
    <div className="formatted-message">
      {lines.map((line, i) => {
        // Bold: **teks**
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points: - teks atau • teks
        if (line.match(/^[-•]\s/)) {
          return (
            <div
              key={i}
              className="bullet-line"
              dangerouslySetInnerHTML={{ __html: '• ' + boldFormatted.replace(/^[-•]\s/, '') }}
            />
          );
        }
        // Numbered list: 1. teks
        if (line.match(/^\d+\.\s/)) {
          return (
            <div
              key={i}
              className="numbered-line"
              dangerouslySetInnerHTML={{ __html: boldFormatted }}
            />
          );
        }
        // Empty line = spacer
        if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />;
        // Normal line
        return (
          <p
            key={i}
            style={{ margin: 0, lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ __html: boldFormatted }}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ChatInterface({ currentChatId, conversations, setConversations }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null); // id pesan yang baru di-copy
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const activeChat = conversations.find(chat => chat.id === currentChatId);

  // Auto scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  // Deteksi scroll untuk tombol "Scroll ke Bawah"
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================
  // FUNGSI KIRIM PESAN - PENYEMPURNAAN STABILITAS API (ANTI ERROR 429)
  // ============================================================
  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isTyping) return;

// Ambil API Key dari Environment Variables Vite
const apiKey = import.meta.env.VITE_GROK_API_KEY;
if (!apiKey) {
  alert("❌ API Key tidak ditemukan!\n\nPastikan Anda telah mengisi file .env di root project dengan:\nVITE_GROK_API_KEY=xai-...");
  return;
}

    const userMessageText = textToSend;
    setInput("");

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    // Ambil history pesan untuk konteks percakapan
    let currentMessages = [];
    setConversations((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const updated = { ...chat, messages: [...chat.messages, userMessage] };
          currentMessages = updated.messages;
          return updated;
        }
        return chat;
      })
    );

    setIsTyping(true);

try {
  const apiUrl = "https://api.x.ai/v1/chat/completions";
  const recentMessages = currentMessages.slice(-6);

  // Format pesan untuk Grok (OpenAI-compatible)
  const contentsWithHistory = [
    // System prompt di awal sebagai role "system"
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    // Riwayat pesan sebelumnya
    ...recentMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant', // ⚠️ Grok pakai "assistant", bukan "model"
      content: msg.content,
    })),
  ];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`, // ⚠️ Grok pakai Bearer token, bukan query param
    },
    body: JSON.stringify({
      model: "grok-3-mini", // atau "grok-3" untuk yang lebih canggih
      messages: contentsWithHistory,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  // Ambil teks respons dari Grok
  const botReply = data.choices[0].message.content;

      // Jika pesan terakhir belum masuk ke recentMessages, tambahkan secara manual di akhir paket data
      if (recentMessages.length === 0 || recentMessages[recentMessages.length - 1].content !== userMessageText) {
        contentsWithHistory.push({
          role: "user",
          parts: [{ text: userMessageText }]
        });
      }

// Fungsi retry otomatis saat kena rate limit
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    const waitTime = (i + 1) * 5000; // 5 detik, 10 detik, 15 detik
    console.warn(`Rate limit hit, retrying in ${waitTime/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  throw new Error("429: Rate limit. Tunggu beberapa menit lalu coba lagi.");
};

const response = await fetch("https://api.x.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "grok-3-mini",
    messages: contentsWithHistory,
    max_tokens: 1000,
    temperature: 0.7,
  }),
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
}

const data = await response.json();

const replyText =
  data.choices?.[0]?.message?.content ||
  "Maaf, saya tidak dapat menghasilkan jawaban saat ini. Silakan coba lagi.";

const aiMessage = {
  id: Date.now() + 1,
  role: 'assistant',
  content: replyText,
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

setConversations((prev) =>
  prev.map((chat) => {
    if (chat.id === currentChatId) {
      return { ...chat, messages: [...chat.messages, aiMessage] };
    }
    return chat;
  })
);

} catch (error) {
      console.error("Error Grok API:", error);

      let errorContent = "⚠️ **Terjadi kesalahan koneksi**\n\n";
      if (error.message.includes("401") || error.message.includes("invalid_api_key")) {
        errorContent = "🔑 **API Key tidak valid!**\n\nPastikan:\n- File `.env` sudah dibuat di root folder aplikasi Anda.\n- Isinya ditulis seperti ini: `VITE_GROK_API_KEY=xai-...`\n- Restart server development terminal (`npm run dev`) setelah mengedit `.env`.";
      } else if (error.message.includes("429") || error.message.includes("rate_limit")) {
        errorContent = "📊 **Kuota API Habis (Rate Limit)!**\n\nAnda melebihi batas permintaan. Silakan tunggu sekitar 1-2 menit sebelum mengirim pesan baru.";
      } else if (error.message.includes("400") || error.message.includes("invalid_request")) {
        errorContent = "⚠️ **Permintaan tidak valid!**\n\nCoba muat ulang halaman dan kirim ulang pesan Anda.";
      } else if (!navigator.onLine) {
        errorContent = "📡 **Tidak ada koneksi internet!**\n\nPeriksa koneksi jaringan Anda dan coba klik kirim ulang.";
      } else {
        errorContent = `⚠️ **Error:** ${error.message}\n\nCoba muat ulang halaman web ini.`;
      }

      const errorMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: errorContent,
        isError: true,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return { ...chat, messages: [...chat.messages, errorMessage] };
          }
          return chat;
        })
      );
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Kirim dengan Enter (Shift+Enter untuk baris baru)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy isi pesan
  const handleCopy = (msgId, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyFeedback(msgId);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const messageCount = activeChat?.messages?.length || 0;

  return (
    <>
      <style>{`
        .chat-container { font-family: 'Inter', 'Segoe UI', sans-serif; }
        .formatted-message { font-size: 14px; line-height: 1.6; }
        .formatted-message .bullet-line { padding: 2px 0 2px 8px; }
        .formatted-message .numbered-line { padding: 2px 0; }
        .message-bubble { transition: all 0.2s; }
        .message-bubble:hover .msg-actions { opacity: 1; }
        .msg-actions { opacity: 0; transition: opacity 0.2s; }
        .chip-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .chip-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15); }
        .send-btn { transition: all 0.2s; }
        .send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3); }
        .send-btn:active:not(:disabled) { transform: translateY(1px); }
        .typing-dot { animation: bounce 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .scroll-btn { transition: all 0.2s; }
        .scroll-btn:hover { transform: translateY(-2px); background-color: #fef3c7; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .luxury-gradient-bg { background: linear-gradient(135deg, #fffcf4 0%, #ffffff 100%); }
        .luxury-glow-icon { box-shadow: 0 8px 30px rgba(252, 200, 80, 0.4); animation: pulseGlow 3s infinite alternate; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 8px 20px rgba(252, 200, 80, 0.3); }
          100% { box-shadow: 0 8px 35px rgba(217, 119, 6, 0.5); }
        }
      `}</style>

      <div className="chat-container flex-1 flex flex-col luxury-gradient-bg relative h-full">

        {/* ===== HEADER ===== */}
        <header className="border-b border-amber-100 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between z-10 shadow-sm"
          style={{ height: '68px' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg luxury-glow-icon"
                style={{ background: 'linear-gradient(135deg, #fcc850, #d97706)' }}>
                .✦ ݁˖
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 tracking-wide leading-tight">
                Goldrazz Assistant
              </h2>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                Sistem AI Siap Melayani
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {messageCount > 0 && (
              <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full shadow-sm">
                {messageCount} pesan dalam sesi ini
              </span>
            )}
          </div>
        </header>

        {/* ===== AREA PESAN ===== */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mb-6 luxury-glow-icon"
                style={{ background: 'linear-gradient(135deg, #fcc850, #d97706, #fcc850)' }}>
                .✦ ݁˖
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
                Halo, Ada yang Bisa Goldrazz Bantu Hari Ini?
              </h3>
              <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
                Asisten AI premium yang dikonfigurasi khusus untuk menjawab kebutuhan Anda secara profesional, cerdas, dan responsif.
              </p>

              <div className="w-full max-w-lg">
                <p className="text-xs text-amber-600 mb-3 font-semibold uppercase tracking-wider">
                  Rekomendasi Topik Untuk Anda
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="chip-btn text-left text-sm font-medium text-gray-700 bg-white hover:bg-amber-50/50 border border-gray-100 hover:border-amber-300 rounded-xl px-4 py-3.5 shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3 mt-1 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #fcc850, #d97706)' }}>
                      G
                    </div>
                  )}

                  <div className="message-bubble group relative max-w-[78%]">
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-none shadow-md shadow-amber-500/10'
                        : msg.isError
                        ? 'bg-red-50 text-gray-800 border border-red-200 rounded-tl-none font-medium'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm hover:shadow-md'
                    }`}>
                      {msg.role === 'user' ? (
                        <p style={{ margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                      ) : (
                        <FormattedMessage content={msg.content} />
                      )}
                    </div>

                    <div className={`flex items-center gap-2 mt-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-gray-400 font-medium">{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="msg-actions text-[10px] text-gray-400 hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100"
                          title="Salin pesan"
                        >
                          {copyFeedback === msg.id ? (
                            <span className="text-emerald-600">✓ Tersalin</span>
                          ) : (
                            <span>Salin</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-100 text-amber-800 text-xs font-bold ml-3 mt-1 shadow-inner">
                      U
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3 shadow"
                    style={{ background: 'linear-gradient(135deg, #ffc124, #d97706)' }}>
                    G
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="typing-dot w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ===== TOMBOL SCROLL KE BAWAH ===== */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="scroll-btn absolute bottom-24 right-6 bg-white border border-amber-100 text-amber-700 w-10 h-10 rounded-full shadow-xl flex items-center justify-center z-20 text-lg font-bold"
          >
            ↓
          </button>
        )}

        {/* ===== INPUT AREA ===== */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-amber-50 shadow-lg">
          {messageCount > 0 && !isTyping && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {["📝 Lanjutkan Penjelasan", "🔄 Coba Respon Lain", "💡 Elaborasi Lebih Detail", "📋 Buat Ringkasan Poin"].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip)}
                  className="chip-btn flex-shrink-0 text-xs font-medium text-gray-600 bg-white hover:bg-amber-50 hover:text-amber-800 border border-gray-200 hover:border-amber-200 rounded-full px-3.5 py-1.5 shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan atau pertanyaan Anda di sini... (Enter = Kirim)"
                disabled={isTyping}
                rows={1}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 bg-gray-50/50 focus:bg-white disabled:opacity-50 resize-none overflow-hidden transition-all"
                style={{ lineHeight: '1.5', minHeight: '46px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="send-btn flex-shrink-0 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md disabled:opacity-40 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', height: '46px' }}
            >
              <span>Kirim</span>
              <span className="font-semibold" style={{ fontSize: '14px' }}>→</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2.5">
            Goldrazz Assistant dapat membuat kekeliruan. Silakan periksa kembali informasi mendasar.
          </p>
        </div>
      </div>
    </>
  );
}
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Sparkles, Camera, User, Crown } from 'lucide-react';

export default function Sidebar({ conversations, currentChatId, onSelectChat, onNewChat, profileImage, setProfileImage }) {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="hidden md:flex flex-col w-80 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 border-r border-amber-200 h-full p-4 justify-between shadow-[5px_0_25px_rgba(212,175,55,0.08)]">
      <div>
        {/* Branding Goldran */}
        <div className="flex items-center gap-3 px-2 py-4 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.3)] animate-pulse">
            <Sparkles className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent drop-shadow-sm">
              Goldrazz
            </h1>
            <p className="text-[10px] text-amber-600 tracking-widest font-extrabold uppercase">PREMIUM ASSISTANT</p>
          </div>
        </div>

        {/* --- AREA BARU: FOTO PROFIL BOT BESAR DI TENGAH --- */}
        <div className="flex flex-col items-center justify-center py-5 mb-4 bg-gradient-to-b from-amber-100/40 to-transparent rounded-2xl border border-amber-200/50 shadow-inner relative overflow-hidden group">
          {/* Efek Kilau Latar Belakang */}
          <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine duration-1000" />
          
          {/* Bingkai Foto Mewah */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 p-[3px] shadow-[0_8px_20px_rgba(212,175,55,0.25)] relative mb-3">
            {/* Mahkota Mini Di Atas Foto */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white p-1 rounded-full shadow-md border border-white">
              <Crown className="h-3 w-3 fill-amber-100 text-amber-100" />
            </div>
            {/* Foto Bot Utama */}
            <div className="h-full w-full rounded-full overflow-hidden border-2 border-white bg-white">
              <img src="/bot.jpg" className="h-full w-full object-cover" alt="Goldrazz Grand Profile" />
            </div>
          </div>
          
          <h2 className="text-sm font-bold text-amber-900 tracking-wide">Goldrazz AI</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 mt-1 border border-amber-200 shadow-sm">
            ● Online
          </span>
        </div>
        {/* -------------------------------------------------- */}

        {/* Tombol Obrolan Baru */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(212,175,55,0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-6 transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>Obrolan Emas Baru</span>
        </motion.button>

        {/* Riwayat Chat */}
        <div className="space-y-2 overflow-y-auto max-h-[35vh] pr-1">
          <p className="text-xs text-amber-700/70 font-bold px-2 mb-2 uppercase tracking-wider">Riwayat Diskusi</p>
          {conversations.map((chat) => {
            const isActive = chat.id === currentChatId;
            return (
              <motion.div
                key={chat.id}
                whileHover={{ x: 4, backgroundColor: "rgba(251, 191, 36, 0.05)" }}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-400 text-amber-700 font-bold shadow-[0_2px_8px_rgba(212,175,55,0.1)]' 
                    : 'border-transparent text-slate-500 hover:text-amber-900'
                }`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-sm truncate">{chat.title}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Profil User (Bisa Upload Foto Kreatif) */}
      <div className="border-t border-amber-200 pt-4 bg-transparent">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          className="hidden" 
        />
        <div 
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50/80 transition-all cursor-pointer border border-dashed border-amber-300 group relative overflow-hidden"
          title="Klik untuk ubah foto profil"
        >
          <div className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-500 relative flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-amber-600" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-bold text-amber-950">Pemilik Goldrazz 👑</p>
            <p className="text-xs text-amber-600/70 truncate">Klik untuk ganti foto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
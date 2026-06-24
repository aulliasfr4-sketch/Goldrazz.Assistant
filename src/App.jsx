import React, { useState } from 'react';
// ✅ Import kedua komponen utama dari folder components
import ChatInterface from "./components/ChatInterface";
import Sidebar from "./components/Sidebar"; 

export default function App() {
  const [currentChatId, setCurrentChatId] = useState("default-session");
  const [conversations, setConversations] = useState([
    {
      id: "default-session",
      title: "Diskusi Kreatif Goldrazz", // 💡 Menambahkan judul agar muncul di riwayat Sidebar
      messages: [] // Mulai dengan ruang obrolan kosong
    }
  ]);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-100">
      
      {/* 1. ✅ MENAMPILKAN KEMBALI SIDEBAR YANG HILANG */}
      <Sidebar 
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        conversations={conversations}
        setConversations={setConversations}
      />

      {/* 2. Sisi Aplikasi Utama (Ruang Chat) */}
      <div className="flex-1 h-full flex flex-col">
        <ChatInterface 
          currentChatId={currentChatId}
          conversations={conversations}
          setConversations={setConversations}
        />
      </div>
      
    </div>
  );
}
import React, { useState } from 'react';
import ChatInterface from "./components/ChatInterface";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [currentChatId, setCurrentChatId] = useState("default-session");
  const [conversations, setConversations] = useState([
    {
      id: "default-session",
      title: "Diskusi Kreatif Goldrazz",
      messages: []
    }
  ]);

  // ✅ Tambah state untuk foto profil
  const [profileImage, setProfileImage] = useState(null);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-100">

      <Sidebar
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        conversations={conversations}
        setConversations={setConversations}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />

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
"use client";

import { Button } from "@/components/ui/button";
import { Plus, LogOut, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const { user, logout, loading } = useAuthStore();

  const { conversations: chats, getConversations, resetChat } = useChatStore();


  const handleLogout = async () => {
    await logout();
  };


  useEffect(() => {
    getConversations();
  }, []);

  const handleResetChat = () => {
    resetChat();
  };

  return (
    <div className="flex flex-col h-screen w-80 bg-black text-white border-r border-gray-800">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold mb-4">ChatGPT Clone</h1>
        <Button
          onClick={handleResetChat}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white"
          variant="ghost"
        >
          <Plus className="h-4 w-4 mr-2" /> New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs uppercase text-gray-500 mb-2">Recent Chats</p>
        {chats.map((chat) => (
          <button
            key={chat._id}
            className="flex items-center w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate text-sm text-gray-300">{chat.title}</span>
          </button>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user?.name || "Guest"}</span>
          <span className="text-xs text-gray-400">
            {user?.email || "No email"}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          disabled={loading}
          className="text-gray-400 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

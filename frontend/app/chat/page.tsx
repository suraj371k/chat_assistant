"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, ArrowDown } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

const Chat = () => {
  const { messages, loading, error, sendMessage } = useChatStore();
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto scroll when new message added or content updates (streaming)
  useEffect(() => {
    if (isAtBottom && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Track if user is at bottom of chat
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(atBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userInput = input;
    setInput("");
    await sendMessage(userInput);
  };

  // Format message content with markdown-like rendering
  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex flex-col w-full h-screen relative bg-black">
      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex flex-col flex-1 w-full px-4 md:px-6 py-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center mt-32 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 blur-2xl opacity-20 rounded-full"></div>
              <div className="relative text-7xl">💬</div>
            </div>
            <h2 className="text-white text-2xl font-semibold">
              How can I help you today?
            </h2>
            <p className="text-gray-400 text-sm max-w-md text-center">
              Ask me anything - from coding help to creative ideas, I'm here to
              assist you.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div
              className={`relative group px-5 py-4 rounded-2xl max-w-[85%] md:max-w-[70%] lg:max-w-[60%] leading-relaxed transition-all duration-200 ${
                msg.role === "user"
                  ? "bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/20 rounded-br-none"
                  : "bg-linear-to-br from-gray-900 to-gray-800 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-700/50 rounded-bl-none"
              }`}
            >
              {/* Role indicator */}
              <div
                className={`text-[10px] uppercase font-bold tracking-wider mb-3 flex items-center gap-2 ${
                  msg.role === "user" ? "text-blue-200" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    msg.role === "user" ? "bg-blue-300" : "bg-emerald-400"
                  }`}
                ></div>
                {msg.role === "user" ? "You" : "AI Assistant"}
              </div>

              {/* Message content */}
              <div className="whitespace-pre-wrap wrap-break-word text-[15px] leading-relaxed">
                {formatMessage(msg.content)}
              </div>

              {/* Streaming indicator for last assistant message */}
              {msg.role === "assistant" &&
                idx === messages.length - 1 &&
                loading && (
                  <span className="inline-block ml-1 animate-pulse text-emerald-400">
                    ▋
                  </span>
                )}
            </div>
          </div>
        ))}

        {/* Loading indicator when waiting for first response */}
        {loading &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-linear-to-br from-gray-900 to-gray-800 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-700/50 rounded-2xl rounded-bl-none px-5 py-4 max-w-[85%] md:max-w-[70%] lg:max-w-[60%]">
                <div className="text-[10px] uppercase font-bold tracking-wider mb-3 text-gray-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  AI Assistant
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-gray-400 italic text-sm">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

        <div ref={chatEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={() =>
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="absolute bottom-28 right-6 md:right-8 bg-gray-800 hover:bg-gray-700 shadow-xl rounded-full p-3 transition-all border border-gray-700 group"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* Input Bar */}
      <div className="sticky bottom-0 w-full flex justify-center bg-black/80 backdrop-blur-xl border-t border-gray-800 py-5 px-4">
        <div className="relative w-full md:w-[75vw] lg:w-[65vw] max-w-4xl">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                loading ? "AI is responding..." : "Message AI assistant..."
              }
              disabled={loading}
              className="w-full pl-6 pr-14 py-7 rounded-2xl text-base bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            />

            <Button
              size="icon"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed h-11 w-11 shadow-lg shadow-blue-900/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </Button>
          </div>

          {/* Helper text */}
          <p className="text-gray-600 text-xs text-center mt-3">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center px-4 z-50">
          <div className="bg-red-900/90 backdrop-blur-sm border border-red-700 text-red-200 text-sm px-5 py-3 rounded-xl shadow-2xl max-w-md flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default Chat;

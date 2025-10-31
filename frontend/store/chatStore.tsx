import { create } from "zustand";
import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: Message[];
  conversationId: string | null;
  loading: boolean;
  error: string | null;

  sendMessage: (message: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  loading: false,
  error: null,

  // ✅ Streaming sendMessage (ChatGPT-like)
  sendMessage: async (message: string) => {
    const { conversationId, messages } = get();

    // Add user message immediately
    const userMsg: Message = { role: "user", content: message };
    set({ messages: [...messages, userMsg], loading: true, error: null });

    try {
      // Start streaming request
      const response = await fetch(`${backendUrl}/api/message/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, conversationId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let fullText = "";
      let assistantMsg: Message = { role: "assistant", content: "" };

      // Add placeholder assistant message
      set((state) => ({
        messages: [...state.messages, assistantMsg],
      }));

      // Stream the chunks as they arrive
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // SSE data may contain multiple lines
        const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data:"));
        for (const line of lines) {
          const data = line.replace("data:", "").trim();

          if (data === "[DONE]") {
            set({ loading: false });
            return;
          }

          try {
            const json = JSON.parse(data);
            if (json.text) {
              fullText += json.text;
              assistantMsg.content = fullText;

              // Update messages in realtime
              set((state) => {
                const updated = [...state.messages];
                updated[updated.length - 1] = { ...assistantMsg };
                return { messages: updated };
              });
            } else if (json.conversationId) {
              set({ conversationId: json.conversationId });
            }
          } catch (err) {
            console.warn("Stream parse error:", err);
          }
        }
      }

      set({ loading: false });
    } catch (err: any) {
      console.error("Streaming error:", err);
      set({
        loading: false,
        error: err.message || "Failed to stream message",
      });
    }
  },

  // ✅ Fetch old messages
  fetchMessages: async (conversationId) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${backendUrl}/api/messages?conversationId=${conversationId}`, {
        credentials: "include",
      });

      const data = await res.json();

      set({
        messages: data.messages,
        conversationId,
        loading: false,
      });
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      set({
        loading: false,
        error: err.message || "Failed to fetch messages",
      });
    }
  },

  // ✅ Reset chat
  resetChat: () => set({ messages: [], conversationId: null, error: null }),
}));

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, ShieldCheck, User, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth";
import { fetchMessages, sendMessage } from "../lib/api";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { ChatMessage } from "../lib/types";

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch of messages
    fetchMessages()
      .then((msgs) => {
        setMessages(msgs);
      })
      .catch((err) => console.error("Error fetching messages:", err));

    if (isSupabaseConfigured) {
      // Subscribe to real-time postgres changes
      const channel = supabase
        .channel("public-messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg: ChatMessage = {
              id: payload.new.id,
              senderName: payload.new.sender_name,
              senderEmail: payload.new.sender_email,
              senderRole: payload.new.sender_role as "student" | "admin",
              content: payload.new.content,
              createdAt: payload.new.created_at,
            };

            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Local fallback: poll every 3 seconds
      const interval = setInterval(() => {
        fetchMessages()
          .then((msgs) => setMessages(msgs))
          .catch((err) => console.error("Error polling messages:", err));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Smooth scroll to bottom on new messages
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      senderName: user.name,
      senderEmail: user.email,
      senderRole: user.role === "admin" ? "admin" : "student",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    try {
      await sendMessage(newMsg);
      setContent("");
      if (!isSupabaseConfigured) {
        // Local mode fallback state update
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (!user) {
    return (
      <div className="bg-paper flex min-h-[70vh] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-cream-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-600">
            <MessageSquare size={26} />
          </div>
          <h2 className="font-serif mt-6 text-2xl font-bold text-ink-900">Join the Conversation</h2>
          <p className="mt-3 text-sm text-ink-700/70">
            Please sign in as a student or administrator to access the community chatroom.
          </p>
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-[85vh] py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col rounded-3xl border border-cream-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-cream-100 bg-cream-50/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                <MessageSquare size={20} />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold text-ink-900">BCA Faculty Hub Chatroom</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-ink-700/60 font-medium">Active discussion board</span>
                </div>
              </div>
            </div>
            {!isSupabaseConfigured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-clay-50 border border-clay-100 text-clay-600 flex items-center gap-1">
                <Sparkles size={12} /> Local Fallback Mode
              </span>
            )}
          </div>

          {/* Messages Panel */}
          <div className="h-[480px] overflow-y-auto px-6 py-6 bg-cream-50/20 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-ink-700/40">
                <MessageSquare size={36} className="opacity-40 mb-2" />
                <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isOwn = msg.senderEmail === user.email;
                  const isAdmin = msg.senderRole === "admin";

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {/* Name / Role Label */}
                      <span className="text-xs text-ink-700/50 mb-1 px-1 flex items-center gap-1">
                        {!isOwn && (
                          <span className="font-semibold text-ink-700/70">{msg.senderName}</span>
                        )}
                        {isAdmin && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold bg-clay-500 text-cream-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            <ShieldCheck size={9} /> Admin
                          </span>
                        )}
                      </span>

                      {/* Bubble */}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                          isOwn
                            ? "bg-sage-700 text-cream-50 rounded-tr-none"
                            : isAdmin
                            ? "bg-clay-50 border border-clay-100 text-ink-900 rounded-tl-none"
                            : "bg-white border border-cream-100 text-ink-900 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Timestamp */}
                      <span className={`text-[10px] text-ink-700/40 mt-1 px-1`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="border-t border-cream-100 bg-white p-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message here..."
                maxLength={500}
                className="w-full rounded-full border border-cream-200 bg-cream-50/30 py-3 pl-5 pr-12 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-sage-700 text-cream-50 transition-all hover:bg-sage-600 disabled:opacity-50 disabled:hover:bg-sage-700 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="flex justify-between items-center px-4 mt-2">
              <span className="text-[10px] text-ink-700/40">
                Please be respectful. Messages are visible to all students and staff.
              </span>
              <span className="text-[10px] text-ink-700/40 font-num">
                {content.length}/500
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

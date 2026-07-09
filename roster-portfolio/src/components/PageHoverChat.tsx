"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { API_CHAT_ENDPOINT } from "@/config/api";
import { CHAT_LIMIT, CHAT_USAGE_EVENT, chatRequestHeaders, publishRemainingTurns, readStoredRemaining } from "@/lib/chatUsage";
import {
  appendChatMessage,
  PortfolioChatMessage,
  readChatMessages,
  replaceLastAssistantMessage,
  setChatMessages,
  subscribeToChatMessages,
} from "@/lib/chatSession";

function currentPageContext() {
  if (typeof window === "undefined") return "The visitor is viewing my personal portfolio.";

  const sections = [
    { id: "home", label: "Home hero" },
    { id: "about", label: "About me" },
    { id: "work", label: "Work experience" },
    { id: "education", label: "Education, skills, and resume" },
    { id: "projects", label: "Project recordings and case studies" },
    { id: "blog", label: "Writing, media, and YouTube" },
    { id: "meet", label: "Meeting scheduler" },
    { id: "chat", label: "Portfolio chat" },
  ];

  const anchor = window.scrollY + window.innerHeight * 0.42;
  const active = sections.reduce((current, section) => {
    const element = document.getElementById(section.id);
    if (!element) return current;
    return element.offsetTop <= anchor ? section : current;
  }, sections[0]);

  const text = document.getElementById(active.id)?.innerText.replace(/\s+/g, " ").trim().slice(0, 900);
  return `The visitor is currently viewing the ${active.label} section of my portfolio.${text ? ` Visible page text: ${text}` : ""}`;
}

export default function PageHoverChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessagesState] = useState<PortfolioChatMessage[]>(() => readChatMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [remainingTurns, setRemainingTurns] = useState(CHAT_LIMIT);
  const closeTimer = useRef<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setRemainingTurns(readStoredRemaining());

    const handleUsage = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === "number") setRemainingTurns(detail);
    };

    window.addEventListener(CHAT_USAGE_EVENT, handleUsage);
    const unsubscribe = subscribeToChatMessages(setMessagesState);
    const interval = window.setInterval(() => setRemainingTurns(readStoredRemaining()), 30000);

    return () => {
      window.removeEventListener(CHAT_USAGE_EVENT, handleUsage);
      window.clearInterval(interval);
      unsubscribe();
      if (revealTimerRef.current) window.clearInterval(revealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, isRevealing]);

  const revealAssistantResponse = (content: string) =>
    new Promise<void>((resolve) => {
      const cleanContent = content.trim();
      appendChatMessage({ role: "assistant", content: "" });
      setIsRevealing(true);

      let index = 0;
      revealTimerRef.current = window.setInterval(() => {
        index = Math.min(cleanContent.length, index + Math.max(8, Math.ceil(cleanContent.length / 45)));
        replaceLastAssistantMessage(cleanContent.slice(0, index));

        if (index >= cleanContent.length) {
          if (revealTimerRef.current) window.clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
          setIsRevealing(false);
          resolve();
        }
      }, 24);
    });

  const openDock = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const scheduleClose = () => {
    if (isFocused || isLoading) return;
    closeTimer.current = window.setTimeout(() => setIsOpen(false), 220);
  };

  const askQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();
    const currentMessages = readChatMessages();
    if (!trimmedQuestion || isLoading || isRevealing || remainingTurns === 0) return;

    const nextMessages: PortfolioChatMessage[] = [...currentMessages, { role: "user", content: trimmedQuestion }];
    const conversationContext = currentMessages
      .slice(-8)
      .map((message) => `${message.role === "user" ? "Visitor" : "Me"}: ${message.content}`)
      .join("\n");
    setChatMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch(API_CHAT_ENDPOINT, {
        method: "POST",
        headers: chatRequestHeaders(),
        body: JSON.stringify({
          message: trimmedQuestion,
          pageContext: currentPageContext(),
          conversationContext,
        }),
      });
      const payload = await response.json();
      const remaining = response.headers.get("x-ratelimit-remaining");
      const resetSeconds = response.headers.get("x-ratelimit-reset");
      if (remaining !== null) publishRemainingTurns(Number(remaining), resetSeconds ? Number(resetSeconds) : undefined);

      setIsLoading(false);
      await revealAssistantResponse(payload.response || payload.error || "No response returned.");
    } catch {
      setIsLoading(false);
      await revealAssistantResponse("The page chat is offline right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const ask = async (event: FormEvent) => {
    event.preventDefault();
    await askQuestion(input);
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-[60] hidden sm:block"
      onMouseEnter={openDock}
      onMouseLeave={scheduleClose}
    >
      <div className={`overflow-hidden rounded-[28px] border border-zinc-200 bg-white/94 shadow-[0_24px_80px_rgba(14,116,144,0.20)] backdrop-blur-xl transition-all duration-300 ${
        isOpen ? "w-[390px]" : "w-14"
      }`}>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-14 w-full items-center justify-center text-zinc-950"
          aria-label="Ask me"
        >
          <MessageCircle size={20} />
        </button>

        <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-zinc-200 px-4 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/70 px-3 py-1 text-xs font-semibold text-sky-900">
                  <Bot size={13} /> Context aware
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  {remainingTurns}/{CHAT_LIMIT}
                </div>
                <button type="button" onClick={() => setChatMessages([])} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100" aria-label="Clear hover chat">
                  <X size={14} />
                </button>
              </div>

              <div ref={scrollAreaRef} className="max-h-[260px] min-h-[140px] space-y-3 overflow-y-auto rounded-[22px] border border-zinc-200 bg-zinc-50/70 p-3">
                {messages.length === 0 && (
                  <div className="flex h-[116px] flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-zinc-950">Ready</p>
                    <p className="mt-1 max-w-[250px] text-xs leading-5 text-zinc-500">My reply will show here.</p>
                  </div>
                )}
                {messages.slice(-4).map((message, index) => (
                  <div key={`${message.role}-${index}-${message.content}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-5 ${message.role === "user" ? "bg-zinc-950 text-white" : "border border-zinc-200 bg-white text-zinc-700"}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 px-2 text-xs font-semibold text-sky-700">
                    <Loader2 size={13} className="animate-spin" />
                    Thinking
                  </div>
                )}
              </div>

              <form onSubmit={ask} className="mt-3 flex gap-2">
                <input
                  value={input}
                  maxLength={1600}
                  onChange={(event) => setInput(event.target.value)}
                  onFocus={() => {
                    setIsFocused(true);
                    openDock();
                  }}
                  onBlur={() => setIsFocused(false)}
                  className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                  placeholder={remainingTurns === 0 ? "Limit reached" : "Ask me..."}
                />
                <button
                  type="submit"
                  disabled={isLoading || isRevealing || !input.trim() || remainingTurns === 0}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:bg-zinc-800 disabled:opacity-30"
                  aria-label="Ask me"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

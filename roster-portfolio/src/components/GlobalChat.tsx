"use client";
import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Send, ShieldCheck } from 'lucide-react';
import { API_CHAT_ENDPOINT } from '@/config/api';
import { CHAT_LIMIT, CHAT_USAGE_EVENT, publishRemainingTurns, readStoredRemaining } from '@/lib/chatUsage';
import {
    appendChatMessage,
    PortfolioChatMessage,
    readChatMessages,
    replaceLastAssistantMessage,
    setChatMessages,
    subscribeToChatMessages,
} from '@/lib/chatSession';

const sampleQuestions = [
    'What project best proves you can ship production AI?',
    'Summarize your work in 30 seconds.',
    'What should I ask you in an interview?',
    'Which project should I watch first?',
];

export default function GlobalChat() {
    const [input, setInput] = useState("");
    const [messages, setMessagesState] = useState<PortfolioChatMessage[]>(() => readChatMessages());
    const [isLoading, setIsLoading] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);
    const [remainingTurns, setRemainingTurns] = useState(CHAT_LIMIT);
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const revealTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setRemainingTurns(readStoredRemaining());

        const handleUsage = (event: Event) => {
            const detail = (event as CustomEvent<number>).detail;
            if (typeof detail === 'number') setRemainingTurns(detail);
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
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading, isRevealing]);

    const revealAssistantResponse = (content: string) =>
        new Promise<void>((resolve) => {
            const cleanContent = content.trim();
            appendChatMessage({ role: 'assistant', content: '' });
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

    const askQuestion = async (question: string) => {
        const trimmedQuestion = question.trim();
        const currentMessages = readChatMessages();
        if (!trimmedQuestion || isLoading || isRevealing || remainingTurns === 0) return;

        const newMessages: PortfolioChatMessage[] = [...currentMessages, { role: 'user', content: trimmedQuestion }];
        const conversationContext = currentMessages
            .slice(-8)
            .map((message) => `${message.role === 'user' ? 'Visitor' : 'Me'}: ${message.content}`)
            .join('\n');
        setChatMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch(API_CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedQuestion,
                    conversationContext,
                    pageContext: conversationContext
                        ? `Use this temporary in-session chat context. Do not assume it persists after reload.\n${conversationContext}`
                        : "This is a fresh in-session chat with my portfolio.",
                })
            });
            const data = await res.json();
            const remaining = res.headers.get('x-ratelimit-remaining');
            const resetSeconds = res.headers.get('x-ratelimit-reset');
            if (remaining !== null) publishRemainingTurns(Number(remaining), resetSeconds ? Number(resetSeconds) : undefined);
            setIsLoading(false);
            await revealAssistantResponse(data.response || data.error || 'No response returned.');
        } catch {
            setIsLoading(false);
            await revealAssistantResponse("The portfolio chat is offline right now.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await askQuestion(input);
    };

    return (
        <div className="relative flex h-[calc(100vh-92px)] min-h-[560px] w-full flex-col justify-end overflow-hidden px-4 pb-7 pt-20 md:px-8 md:pb-8">
            <div className="hero-blue-field pointer-events-none absolute inset-x-[-10vw] top-[-120px] h-[520px]" />
            <div className="hero-pulse-band pointer-events-none absolute left-1/2 top-[70px] h-72 w-[76vw]" />
            <div className="hero-blue-sweep pointer-events-none absolute left-1/2 top-[104px] h-52 w-[82vw] -translate-x-1/2" />

            <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col justify-end">
                <div ref={scrollAreaRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-6 pt-4">
                    {messages.length === 0 && (
                        <div className="flex h-full min-h-[220px] items-center justify-center text-center">
                            <div>
                                <h3 className="text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">Ask me a question.</h3>
                                <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-500 md:text-lg">
                                    Ask about my projects, stack, experience, fit, or what to watch first.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}-${message.content}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[86%] rounded-[26px] px-5 py-3 text-base leading-7 shadow-sm md:max-w-[72%] ${
                                message.role === 'user'
                                    ? 'bg-zinc-950 text-white'
                                    : 'border border-zinc-200 bg-white/82 text-zinc-800 backdrop-blur'
                            }`}>
                                {message.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-500">
                                <Loader2 size={15} className="animate-spin" />
                                Working
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="rounded-[30px] border border-zinc-200 bg-white/82 p-2 shadow-[0_22px_60px_rgba(24,24,27,0.10)] backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-zinc-50 text-zinc-950 transition hover:bg-zinc-100"
                            aria-label="Sample questions"
                            onClick={() => setInput(sampleQuestions[0])}
                        >
                            <Plus size={24} />
                        </button>
                        <input
                            className="min-w-0 flex-1 bg-transparent px-2 text-lg font-medium text-zinc-950 outline-none placeholder:text-zinc-400"
                            placeholder={remainingTurns === 0 ? "Hourly limit reached" : "Ask me a question"}
                            value={input}
                            maxLength={1600}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || isRevealing || !input.trim() || remainingTurns === 0}
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-zinc-50 text-zinc-950 transition hover:bg-zinc-100 disabled:opacity-35"
                            aria-label="Send message"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </form>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {sampleQuestions.map((question) => (
                        <button
                            key={question}
                            type="button"
                            onClick={() => askQuestion(question)}
                            disabled={isLoading || isRevealing || remainingTurns === 0}
                            className="rounded-full border border-zinc-200 bg-white/72 px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-zinc-950 disabled:opacity-40"
                        >
                            {question}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    {remainingTurns}/{CHAT_LIMIT} questions left this hour
                </div>
            </div>
        </div>
    );
}

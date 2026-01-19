"use client";
import { useState } from 'react';

export default function GlobalChat() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setMessages([...newMessages, { role: 'assistant', content: "Coach is offline. Check backend." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`relative w-full transition-all duration-700 ease-in-out flex flex-col overflow-hidden group
                ${isExpanded ? 'h-[400px] opacity-100' : 'h-[60px] opacity-40 hover:opacity-100'}`}
        >
            {/* Header / Trigger Bar */}
            <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/10 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-blue-500 ${isLoading ? 'animate-ping' : 'animate-pulse'}`}></div>
                    <span className="text-[10px] font-black text-white/70 tracking-[0.3em] uppercase italic">
                        AI Recruiting Assistant v2.0
                    </span>
                </div>
                {!isExpanded && (
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                        [ Hover to Initialize ]
                    </span>
                )}
                {isExpanded && <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest italic">Connection Stable</span>}
            </div>

            {/* Messages - Only visible when expanded enough */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/10 text-center">
                        <div className="text-6xl mb-4 grayscale opacity-10 transform group-hover:scale-110 transition-transform">🤖</div>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em]">Initialize Transmission...</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest mt-2">Ask about my experience, skills, or projects</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm transition-all duration-300 ${m.role === 'user'
                            ? 'bg-blue-600/30 text-blue-100 border border-blue-500/30 shadow-[0_4px_15px_rgba(37,99,235,0.2)]'
                            : 'bg-white/10 text-slate-100 border border-white/10'
                            }`}>
                            <div className="text-[8px] uppercase font-black mb-1 opacity-40 tracking-widest">
                                {m.role === 'user' ? 'Recruiter' : 'AI Core'}
                            </div>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest animate-pulse ml-2">
                        <span>// ANALYZING DATA</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input - Always visible but dimmed when collapsed */}
            <form onSubmit={handleSubmit} className={`p-4 bg-black/20 border-t border-white/5 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-30'}`}>
                <div className="flex gap-3">
                    <input
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder-white/20"
                        placeholder={isExpanded ? "Type your inquiry..." : "..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-white text-black hover:bg-blue-500 hover:text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-20 shadow-lg"
                    >
                        SEND
                    </button>
                </div>
            </form>
        </div>
    );
}

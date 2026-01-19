import React, { useState, useRef, useEffect } from 'react';
import { X, Github, ExternalLink, Send, Bot, User, Code, Star, MessageSquare } from 'lucide-react';
import { Project } from './types';
import Link from 'next/link';

interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
        setChatHistory(newHistory);
        setIsLoading(true);

        try {
            // Simulated "git-ingest" context
            const context = `Project: ${project.display_name}\nDescription: ${project.stats?.description}\nLanguage: ${project.stats?.language}\nREADME Context: ${project.stats?.readme?.substring(0, 1500) || 'No core readme available.'}`;

            const prompt = `You are a technical expert on the project "${project.display_name}". 
            Use the following context to answer the user's question.
            
            Context:
            ${context}
            
            User Question: ${userMsg}
            
            Answer:`;

            const res = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });
            const data = await res.json();
            setChatHistory([...newHistory, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setChatHistory([...newHistory, { role: 'assistant', content: "Error connecting to AI backend. Make sure Dixon's server is running at :8000" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-6xl h-[85vh] bg-[#1e1e1e]/95 backdrop-blur-2xl border border-[#007acc]/40 rounded-2xl shadow-[0_0_50px_rgba(0,122,204,0.2)] overflow-hidden flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Side: Project Info */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 border-r border-[#2d2d30] custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">{project.icon}</span>
                            <div>
                                <h2 className="text-4xl font-bold text-white tracking-tight">{project.display_name}</h2>
                                <div className="flex gap-3 mt-2">
                                    <span className="px-3 py-1 bg-[#007acc]/20 text-[#007acc] text-xs font-bold rounded-full border border-[#007acc]/30">
                                        {project.stats?.language}
                                    </span>
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20 flex items-center gap-1">
                                        <Star className="w-3 h-3" /> {project.stats?.stars} stars
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="md:hidden text-[#858585] hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[#858585] text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                <Code className="w-4 h-4" /> Description
                            </h3>
                            <p className="text-lg text-[#cccccc] leading-relaxed">
                                {project.stats?.description || "A deep dive into this technical implementation."}
                            </p>
                        </div>

                        {project.stats?.readme && (
                            <div className="bg-[#252526]/50 rounded-xl p-6 border border-[#2d2d30]">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm italic">
                                    📄 README.md Preview
                                </h3>
                                <div className="text-[#969696] text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                    {project.stats.readme.substring(0, 2000)}...
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href={project.stats?.url || '#'}
                                target="_blank"
                                className="flex-1 flex items-center justify-center gap-2 bg-[#007acc] hover:bg-[#005a9e] text-white py-4 px-6 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-[#007acc]/20"
                            >
                                <Github className="w-5 h-5" /> View Repository
                            </Link>
                            {project.stats?.url && (
                                <Link
                                    href={project.stats.url}
                                    target="_blank"
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#2d2d2e] hover:bg-[#3c3c3c] text-white py-4 px-6 rounded-xl font-bold transition-all border border-[#3c3c3c]"
                                >
                                    <ExternalLink className="w-5 h-5" /> Live Demo
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Project Chat */}
                <div className="w-full md:w-96 bg-[#252526]/30 flex flex-col shrink-0">
                    <div className="h-16 border-b border-[#2d2d30] flex items-center px-6 justify-between bg-[#1e1e1e]/50">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <MessageSquare className="w-5 h-5 text-[#007acc]" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-[#1e1e1e]"></div>
                            </div>
                            <span className="text-sm font-bold text-white">Project Assistant</span>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-[#858585] hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                    >
                        {chatHistory.length === 0 && (
                            <div className="text-center py-10 px-4">
                                <Bot className="w-12 h-12 text-[#3c3c3c] mx-auto mb-4" />
                                <p className="text-[#858585] text-xs">
                                    Ask me anything about <span className="text-[#007acc] font-bold">{project.display_name}</span>. I've indexed the code and documentation.
                                </p>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#007acc] text-white rounded-tr-none shadow-md'
                                        : 'bg-[#2d2d30] text-[#cccccc] rounded-tl-none border border-[#3c3c3c]'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#2d2d30] p-3 rounded-2xl rounded-tl-none border border-[#3c3c3c] flex items-center gap-1">
                                    <span className="w-1 h-1 bg-[#858585] rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-[#858585] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1 h-1 bg-[#858585] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-4 bg-[#1e1e1e]/50 border-t border-[#2d2d30]">
                        <div className="bg-[#2a2a2b] rounded-xl flex items-center overflow-hidden focus-within:ring-1 focus-within:ring-[#007acc]/50 transition-all border border-[#323233]">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask project context..."
                                className="flex-1 bg-transparent px-4 py-3 text-xs outline-none text-white placeholder:text-[#555]"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isLoading}
                                className="p-3 text-[#007acc] hover:bg-[#007acc] hover:text-white transition-all disabled:text-[#333] disabled:hover:bg-transparent"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #444;
                }
            `}</style>
        </div>
    );
};

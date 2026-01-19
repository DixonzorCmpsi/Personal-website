import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, LayoutPanelTop, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalPanelProps {
    terminalHistory: { role: string, content: string }[];
    terminalInput: string;
    setTerminalInput: (val: string) => void;
    handleTerminalSubmit: (e: React.FormEvent) => void;
    terminalCommandHistory: string[];
    historyIndex: number;
    setHistoryIndex: (idx: number) => void;
    isLoading: boolean;
    position: 'left' | 'bottom';
    onClose: () => void;
    onTogglePosition: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
    terminalHistory,
    terminalInput,
    setTerminalInput,
    handleTerminalSubmit,
    terminalCommandHistory,
    historyIndex,
    setHistoryIndex,
    isLoading,
    position,
    onClose,
    onTogglePosition
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [terminalHistory, isLoading]);

    return (
        <div className={`flex flex-col bg-[#1e1e1e] border-[#2d2d30] ${position === 'bottom' ? 'h-64 border-t' : 'h-full w-full'}`}>
            <div className="h-9 bg-[#252526] flex items-center justify-between px-4 border-b border-[#2d2d30] shrink-0">
                <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-white border-b border-[#007acc] h-9 flex items-center px-1">TERMINAL</span>
                    <span className="text-[#858585] font-normal">bash</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onTogglePosition}
                        className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors"
                        title={position === 'bottom' ? "Move to Left" : "Move to Bottom"}
                    >
                        {position === 'bottom' ? <TerminalIcon className="w-4 h-4" /> : <LayoutPanelTop className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 selection:bg-[#264f78]"
            >
                {terminalHistory.length === 0 && (
                    <div className="text-[#858585]">
                        <div className="text-blue-400">dixon@portfolio:~$ # AI Assistant Ready</div>
                        <div>dixon@portfolio:~$ # Ask me anything about Dixon's work...</div>
                    </div>
                )}
                {terminalHistory.map((msg, idx) => (
                    <div key={idx} className="animate-fadeIn">
                        {msg.role === 'user' ? (
                            <div className="text-green-400">dixon@portfolio:~$ {msg.content}</div>
                        ) : (
                            <div className="text-[#cccccc] whitespace-pre-wrap pl-2 border-l border-[#333] ml-1">
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="text-[#858585] ml-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#007acc] rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-[#007acc] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#007acc] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                )}
            </div>

            <form onSubmit={handleTerminalSubmit} className="border-t border-[#2d2d30] p-2 bg-[#1e1e1e]">
                <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs font-bold shrink-0">dixon@portfolio:~$</span>
                    <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                if (terminalCommandHistory.length > 0) {
                                    const newIndex = historyIndex + 1;
                                    if (newIndex < terminalCommandHistory.length) {
                                        setHistoryIndex(newIndex);
                                        setTerminalInput(terminalCommandHistory[terminalCommandHistory.length - 1 - newIndex]);
                                    }
                                }
                            } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                if (historyIndex > 0) {
                                    const newIndex = historyIndex - 1;
                                    setHistoryIndex(newIndex);
                                    setTerminalInput(terminalCommandHistory[terminalCommandHistory.length - 1 - newIndex]);
                                } else {
                                    setHistoryIndex(-1);
                                    setTerminalInput('');
                                }
                            }
                        }}
                        className="flex-1 bg-transparent text-white text-xs outline-none font-mono placeholder:text-[#3c3c3c]"
                        placeholder="Ask Dixon's AI..."
                        autoFocus
                    />
                </div>
            </form>
        </div>
    );
};

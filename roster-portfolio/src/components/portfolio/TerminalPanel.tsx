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
    
    // Detect if the page is in light mode by checking body background or data attribute
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    
    React.useEffect(() => {
        // Check if body has light background
        const checkTheme = () => {
            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
            const isLight = bodyBg.includes('255, 255, 255') || bodyBg.includes('rgb(255, 255, 255)');
            setIsDarkMode(!isLight);
        };
        checkTheme();
        
        // Listen for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
        
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [terminalHistory, isLoading]);
    
    const terminalBg = isDarkMode ? '#1e1e1e' : '#f8f8f8';
    const terminalHeaderBg = isDarkMode ? '#252526' : '#e8e8e8';
    const terminalBorder = isDarkMode ? '#2d2d30' : '#d0d0d0';
    const terminalText = isDarkMode ? '#cccccc' : '#333333';
    const terminalMutedText = isDarkMode ? '#858585' : '#666666';
    const terminalAccent = isDarkMode ? '#007acc' : '#0066b8';
    const terminalPromptColor = isDarkMode ? '#4ec9b0' : '#098658';

    return (
        <div className={`flex flex-col border-[${terminalBorder}] ${position === 'bottom' ? 'h-64 border-t' : 'h-full w-full'}`} style={{ backgroundColor: terminalBg }}>
            <div className="h-9 flex items-center justify-between px-4 border-b shrink-0" style={{ backgroundColor: terminalHeaderBg, borderColor: terminalBorder }}>
                <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="border-b h-9 flex items-center px-1" style={{ color: terminalText, borderColor: terminalAccent }}>TERMINAL</span>
                    <span className="font-normal" style={{ color: terminalMutedText }}>bash</span>
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
                className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2"
                style={{ backgroundColor: terminalBg }}
            >
                {terminalHistory.length === 0 && (
                    <div style={{ color: terminalMutedText }}>
                        <div style={{ color: terminalAccent }}>dixon@portfolio:~$ # AI Assistant Ready</div>
                        <div>dixon@portfolio:~$ # Ask me anything about Dixon's work...</div>
                    </div>
                )}
                {terminalHistory.map((msg, idx) => (
                    <div key={idx} className="animate-fadeIn">
                        {msg.role === 'user' ? (
                            <div style={{ color: terminalPromptColor }}>dixon@portfolio:~$ {msg.content}</div>
                        ) : (
                            <div className="whitespace-pre-wrap pl-2 border-l ml-1" style={{ color: terminalText, borderColor: isDarkMode ? '#333' : '#ccc' }}>
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="ml-4 flex items-center gap-2" style={{ color: terminalMutedText }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: terminalAccent }}></div>
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: terminalAccent }}></div>
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: terminalAccent }}></div>
                    </div>
                )}
            </div>

            <form onSubmit={handleTerminalSubmit} className="border-t p-2" style={{ borderColor: terminalBorder, backgroundColor: terminalBg }}>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold shrink-0" style={{ color: terminalPromptColor }}>dixon@portfolio:~$</span>
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
                        className="flex-1 bg-transparent text-xs outline-none font-mono"
                        style={{ color: terminalText }}
                        placeholder="Ask Dixon's AI..."
                        autoFocus
                    />
                </div>
            </form>
        </div>
    );
};

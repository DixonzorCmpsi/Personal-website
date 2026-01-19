import React from 'react';
import { X } from 'lucide-react';
import { Tab } from './types';

interface TabBarProps {
    tabs: Tab[];
    openTabs: string[];
    activeTab: string;
    setActiveTab: (id: string) => void;
    handleCloseTab: (id: string, e: React.MouseEvent) => void;
    viewMode: 'code' | 'preview';
    setViewMode: (mode: 'code' | 'preview') => void;
}

export const TabBar: React.FC<TabBarProps> = ({
    tabs,
    openTabs,
    activeTab,
    setActiveTab,
    handleCloseTab,
    viewMode,
    setViewMode
}) => {
    return (
        <div className="h-9 bg-[#2d2d2e] flex items-center justify-between border-b border-[#2d2d30] overflow-x-auto">
            <div className="flex items-center">
                {openTabs.map(tabId => {
                    const tab = tabs.find(t => t.id === tabId);
                    if (!tab) return null;
                    const Icon = tab.icon;
                    return (
                        <div
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className={`h-9 px-3 flex items-center gap-2 text-xs cursor-pointer border-r border-[#2d2d30] group relative min-w-[120px]
                ${activeTab === tabId ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2e] text-[#969696] hover:bg-[#1e1e1e]'}`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="truncate">{tab.label}</span>
                            <X
                                onClick={(e) => handleCloseTab(tabId, e)}
                                className={`w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded transition-all
                                ${activeTab === tabId ? 'opacity-100' : ''}`}
                            />
                            {activeTab === tabId && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#007acc]"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {(activeTab === 'experience.json' || activeTab === 'education.json' || activeTab === 'projects.tsx' || activeTab === 'skills.config.js') && (
                <div className="flex items-center gap-2 px-4 text-xs shrink-0">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`px-2 py-1 rounded transition-colors ${viewMode === 'preview' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-white'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setViewMode('code')}
                        className={`px-2 py-1 rounded transition-colors ${viewMode === 'code' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-white'}`}
                    >
                        Code
                    </button>
                </div>
            )}
        </div>
    );
};

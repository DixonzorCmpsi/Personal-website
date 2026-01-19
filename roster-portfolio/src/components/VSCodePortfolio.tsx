"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { API_CHAT_ENDPOINT } from '@/config/api';
import {
    FileText,
    FileCode2,
    FileJson,
    Search,
    GitBranch,
    Package,
    User,
    Terminal as TerminalIcon,
    X,
    Minus,
    Square,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderOpen,
    Activity,
    Code,
    GraduationCap,
    Mail,
    Star,
    Settings,
    MoreHorizontal,
    Maximize2,
    PanelBottom,
    Split,
    Sun,
    Moon
} from 'lucide-react';

interface VSCodePortfolioProps {
    qbData: any;
    rosterData: any[];
    aboutText: string;
    experiences: any[];
    education: any[];
    skills?: {
        languages: string[];
        frameworks: string[];
        tools: string[];
        other: string[];
    };
}

interface FileItem {
    id: string;
    name: string;
    icon: any;
    type: 'file';
}

interface FolderItem {
    id: string;
    name: string;
    type: 'folder';
    expanded: boolean;
    children: (FileItem | FolderItem)[];
}

export default function VSCodePortfolio({ qbData, rosterData, aboutText, experiences, education, skills }: VSCodePortfolioProps) {
    // State
    const [activeTab, setActiveTab] = useState('welcome.md');
    const [openTabs, setOpenTabs] = useState<string[]>(['welcome.md']);
    const [activeSidebar, setActiveSidebar] = useState('explorer');
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<{ role: string; content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [projectChatInput, setProjectChatInput] = useState('');
    const [projectChatHistory, setProjectChatHistory] = useState<{ role: string; content: string }[]>([]);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Search sidebar state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ type: string, name: string, id: string }[]>([]);
    const [searchAiResponse, setSearchAiResponse] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Theme system
    type ThemeName = 'dark' | 'light' | 'monokai' | 'dracula' | 'nord';
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('dark');
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);

    // Resizable panels state
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [isResizingTerminal, setIsResizingTerminal] = useState(false);

    // AI Project Summary state
    const [projectAiSummary, setProjectAiSummary] = useState<string>('');
    const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);

    // Menu bar state
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Helper for legacy dark theme checks
    const isDarkTheme = currentTheme !== 'light';

    // Theme configurations
    const themes = {
        dark: {
            name: 'Dark+ (Default)',
            bg: '#1e1e1e', text: '#cccccc', titleBar: '#3c3c3c', sidebar: '#252526',
            editor: '#1e1e1e', border: '#3c3c3c', accent: '#007acc', activityBar: '#333333',
            hover: '#505050', selection: '#264f78', keyword: '#569cd6', string: '#ce9178'
        },
        light: {
            name: 'Light+',
            bg: '#ffffff', text: '#333333', titleBar: '#dddddd', sidebar: '#f3f3f3',
            editor: '#ffffff', border: '#e0e0e0', accent: '#0066b8', activityBar: '#e8e8e8',
            hover: '#d0d0d0', selection: '#add6ff', keyword: '#0000ff', string: '#a31515'
        },
        monokai: {
            name: 'Monokai',
            bg: '#272822', text: '#f8f8f2', titleBar: '#1e1f1c', sidebar: '#2d2e27',
            editor: '#272822', border: '#3e3d32', accent: '#a6e22e', activityBar: '#1e1f1c',
            hover: '#49483e', selection: '#49483e', keyword: '#f92672', string: '#e6db74'
        },
        dracula: {
            name: 'Dracula',
            bg: '#282a36', text: '#f8f8f2', titleBar: '#21222c', sidebar: '#21222c',
            editor: '#282a36', border: '#44475a', accent: '#bd93f9', activityBar: '#21222c',
            hover: '#44475a', selection: '#44475a', keyword: '#ff79c6', string: '#f1fa8c'
        },
        nord: {
            name: 'Nord',
            bg: '#2e3440', text: '#d8dee9', titleBar: '#3b4252', sidebar: '#3b4252',
            editor: '#2e3440', border: '#4c566a', accent: '#88c0d0', activityBar: '#3b4252',
            hover: '#434c5e', selection: '#434c5e', keyword: '#81a1c1', string: '#a3be8c'
        }
    };

    const theme = themes[currentTheme];

    // Menu definitions with actions
    const menuConfig: Record<string, { label: string; shortcut?: string; action?: () => void; divider?: boolean }[]> = {
        File: [
            { label: 'New File', shortcut: 'Ctrl+N', action: () => handleOpenFile('welcome.md') },
            { label: 'Open File...', shortcut: 'Ctrl+O', action: () => setActiveSidebar('explorer') },
            { label: 'Open Folder...', action: () => setActiveSidebar('explorer') },
            { divider: true, label: '' },
            { label: 'Save', shortcut: 'Ctrl+S', action: () => alert('Portfolio auto-saves!') },
            { label: 'Save All', shortcut: 'Ctrl+K S', action: () => alert('All changes saved!') },
            { divider: true, label: '' },
            { label: 'Download Resume', action: () => window.open('/resume.pdf', '_blank') },
            { label: 'View Resume', action: () => setShowResumeModal(true) },
            { divider: true, label: '' },
            { label: 'Close Tab', shortcut: 'Ctrl+W', action: () => openTabs.length > 1 && setOpenTabs(prev => prev.slice(0, -1)) },
            { label: 'Exit', action: () => window.close() },
        ],
        Edit: [
            { label: 'Undo', shortcut: 'Ctrl+Z', action: () => { } },
            { label: 'Redo', shortcut: 'Ctrl+Y', action: () => { } },
            { divider: true, label: '' },
            { label: 'Copy Email', action: () => { navigator.clipboard.writeText('dixonzor@gmail.com'); alert('Email copied!'); } },
            { label: 'Copy GitHub', action: () => { navigator.clipboard.writeText('github.com/DixonzorCmpsi'); alert('GitHub URL copied!'); } },
            { label: 'Copy LinkedIn', action: () => { navigator.clipboard.writeText('linkedin.com/in/dixon-zor'); alert('LinkedIn URL copied!'); } },
            { divider: true, label: '' },
            { label: 'Find', shortcut: 'Ctrl+F', action: () => setActiveSidebar('search') },
            { label: 'Find in Files', shortcut: 'Ctrl+Shift+F', action: () => setActiveSidebar('search') },
        ],
        Selection: [
            { label: 'Select All', shortcut: 'Ctrl+A', action: () => { } },
            { label: 'Expand Selection', shortcut: 'Shift+Alt+→', action: () => { } },
            { divider: true, label: '' },
            { label: 'Copy Line Up', shortcut: 'Alt+Shift+↑', action: () => { } },
            { label: 'Copy Line Down', shortcut: 'Alt+Shift+↓', action: () => { } },
        ],
        View: [
            { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => setActiveSidebar('explorer') },
            { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => setActiveSidebar('search') },
            { label: 'Source Control', shortcut: 'Ctrl+Shift+G', action: () => setActiveSidebar('git') },
            { label: 'Extensions', shortcut: 'Ctrl+Shift+X', action: () => setActiveSidebar('extensions') },
            { divider: true, label: '' },
            { label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: () => setIsTerminalOpen(prev => !prev) },
            { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: () => setSidebarWidth(prev => prev === 0 ? 240 : 0) },
            { divider: true, label: '' },
            { label: 'Zoom In', shortcut: 'Ctrl++', action: () => document.body.style.zoom = String(parseFloat(document.body.style.zoom || '1') + 0.1) },
            { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => document.body.style.zoom = String(Math.max(0.5, parseFloat(document.body.style.zoom || '1') - 0.1)) },
            { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => document.body.style.zoom = '1' },
            { divider: true, label: '' },
            { label: 'Color Theme...', action: () => setShowThemeMenu(true) },
        ],
        Go: [
            { label: 'Welcome', action: () => handleOpenFile('welcome.md') },
            { label: 'About / README', action: () => handleOpenFile('README.md') },
            { divider: true, label: '' },
            { label: 'Experience', shortcut: 'Ctrl+1', action: () => handleOpenFile('experience.json') },
            { label: 'Education', shortcut: 'Ctrl+2', action: () => handleOpenFile('education.json') },
            { label: 'Skills', shortcut: 'Ctrl+3', action: () => handleOpenFile('skills.ts') },
            { label: 'Projects', shortcut: 'Ctrl+4', action: () => handleOpenFile('projects.tsx') },
            { label: 'Contact', shortcut: 'Ctrl+5', action: () => handleOpenFile('contact.md') },
            { divider: true, label: '' },
            { label: 'Resume (PDF)', action: () => handleOpenFile('resume.pdf') },
        ],
        Run: [
            { label: 'Ask AI Assistant', action: () => { setIsTerminalOpen(true); } },
            { label: 'Start Terminal', shortcut: 'Ctrl+Shift+`', action: () => setIsTerminalOpen(true) },
            { divider: true, label: '' },
            { label: 'Run Project Demo', action: () => alert('Opening project demos...') },
            { label: 'Debug Console', action: () => setIsTerminalOpen(true) },
        ],
        Terminal: [
            { label: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: () => setIsTerminalOpen(true) },
            { label: 'Split Terminal', action: () => setIsTerminalOpen(true) },
            { divider: true, label: '' },
            { label: 'Clear Terminal', action: () => setTerminalHistory([]) },
            { label: 'Close Terminal', action: () => setIsTerminalOpen(false) },
            { divider: true, label: '' },
            { label: 'Maximize Panel', action: () => setTerminalHeight(500) },
            { label: 'Minimize Panel', action: () => setTerminalHeight(100) },
        ],
        Help: [
            { label: 'About Dixon Zor', action: () => handleOpenFile('README.md') },
            { label: 'View Resume', action: () => setShowResumeModal(true) },
            { divider: true, label: '' },
            { label: 'GitHub Profile', action: () => window.open('https://github.com/DixonzorCmpsi', '_blank') },
            { label: 'LinkedIn Profile', action: () => window.open('https://linkedin.com/in/dixon-zor', '_blank') },
            { label: 'Email Dixon', action: () => window.open('mailto:dixonzor@gmail.com', '_blank') },
            { divider: true, label: '' },
            { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', action: () => alert('Shortcuts:\n• Ctrl+` - Toggle Terminal\n• Ctrl+B - Toggle Sidebar\n• Ctrl+1-5 - Navigate sections\n• Ctrl+Shift+F - Search') },
            { label: 'Toggle Theme', action: () => setShowThemeMenu(prev => !prev) },
        ],
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeMenu]);


    // Folder structure state
    const [folders, setFolders] = useState<FolderItem[]>([
        {
            id: 'portfolio',
            name: 'portfolio',
            type: 'folder',
            expanded: true,
            children: [
                { id: 'welcome.md', name: 'welcome.md', icon: FileText, type: 'file' },
                { id: 'README.md', name: 'README.md', icon: FileText, type: 'file' },
                { id: 'experience.json', name: 'experience.json', icon: FileJson, type: 'file' },
                { id: 'education.json', name: 'education.json', icon: GraduationCap, type: 'file' },
                { id: 'projects.tsx', name: 'projects.tsx', icon: Code, type: 'file' },
                { id: 'skills.ts', name: 'skills.ts', icon: FileCode2, type: 'file' },
                { id: 'contact.md', name: 'contact.md', icon: Mail, type: 'file' },
            ]
        },
        {
            id: 'src',
            name: 'src',
            type: 'folder',
            expanded: true,
            children: [
                { id: 'resume.pdf', name: 'resume.pdf', icon: FileText, type: 'file' },
            ]
        },
        {
            id: 'projects',
            name: 'projects',
            type: 'folder',
            expanded: true,
            children: [] // Will be populated with rosterData
        }
    ]);

    // Populate projects folder
    useEffect(() => {
        const projectFiles: FileItem[] = rosterData
            .filter(p => p.type === 'repo')
            .map(p => ({
                id: `project-${p.position}`,
                name: `${p.display_name}.tsx`,
                icon: Code,
                type: 'file' as const
            }));

        setFolders(prev => {
            const newFolders = [...prev];
            const projectsFolder = newFolders.find(c => c.id === 'projects') as FolderItem;
            if (projectsFolder) {
                projectsFolder.children = projectFiles;
            }
            return newFolders;
        });
    }, [rosterData]);

    const toggleFolder = (folderId: string) => {
        const toggleRecursive = (items: (FileItem | FolderItem)[]): (FileItem | FolderItem)[] => {
            return items.map(item => {
                if (item.type === 'folder') {
                    if (item.id === folderId) {
                        return { ...item, expanded: !item.expanded };
                    }
                    return { ...item, children: toggleRecursive(item.children) };
                }
                return item;
            });
        };
        setFolders(prev => toggleRecursive(prev) as FolderItem[]);
    };

    const handleOpenFile = (fileId: string) => {
        if (!openTabs.includes(fileId)) {
            setOpenTabs(prev => [...prev, fileId]);
        }
        setActiveTab(fileId);
        // Clear chat history and fetch AI summary when opening a new project tab
        if (fileId.startsWith('project-')) {
            setProjectChatHistory([]);
            const projectId = fileId.replace('project-', '');
            const project = rosterData.find(p => String(p.position) === projectId);
            if (project) {
                fetchProjectAiSummary(project);
            }
        }
    };

    const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(id => id !== tabId);
        setOpenTabs(newTabs);
        if (activeTab === tabId && newTabs.length > 0) {
            setActiveTab(newTabs[newTabs.length - 1]);
        }
    };

    // Terminal submit
    const handleTerminalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!terminalInput.trim()) return;

        const userMsg = terminalInput;
        setTerminalInput('');
        setTerminalHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch(API_CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setTerminalHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setTerminalHistory(prev => [...prev, {
                role: 'assistant',
                content: 'Error: Backend offline. Start with: python main_hf.py'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Search handler with AI
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setSearchAiResponse('');
            return;
        }

        const q = query.toLowerCase();
        const results: { type: string, name: string, id: string }[] = [];

        // Search through sections
        const sections = [
            { type: 'File', name: 'Resume / About', id: 'welcome.md' },
            { type: 'File', name: 'Experience / Work', id: 'experience.json' },
            { type: 'File', name: 'Education', id: 'education.json' },
            { type: 'File', name: 'Skills', id: 'skills.ts' },
            { type: 'File', name: 'Contact', id: 'contact.md' },
            { type: 'File', name: 'Projects', id: 'projects.tsx' },
        ];

        sections.forEach(s => {
            if (s.name.toLowerCase().includes(q)) {
                results.push(s);
            }
        });

        // Search projects
        rosterData.filter(p => p.type === 'repo').forEach(p => {
            if (p.display_name.toLowerCase().includes(q) ||
                p.stats?.description?.toLowerCase().includes(q)) {
                results.push({ type: 'Project', name: p.display_name, id: `project-${p.position}` });
            }
        });

        setSearchResults(results);

        // Get AI response for search
        setIsSearching(true);
        try {
            const res = await fetch(API_CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Brief answer about: ${query}` })
            });
            const data = await res.json();
            setSearchAiResponse(data.response);
        } catch {
            setSearchAiResponse('');
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                setIsTerminalOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Sidebar resize handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingSidebar) {
                const newWidth = e.clientX - 48; // 48px for activity bar
                setSidebarWidth(Math.min(Math.max(newWidth, 180), 400));
            }
        };
        const handleMouseUp = () => setIsResizingSidebar(false);

        if (isResizingSidebar) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingSidebar]);

    // Terminal resize handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingTerminal) {
                const newHeight = window.innerHeight - e.clientY - 22; // 22px for status bar
                setTerminalHeight(Math.min(Math.max(newHeight, 100), 500));
            }
        };
        const handleMouseUp = () => setIsResizingTerminal(false);

        if (isResizingTerminal) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingTerminal]);

    // Fetch AI summary when project tab opens
    const fetchProjectAiSummary = useCallback(async (project: any) => {
        if (!project) return;

        setIsLoadingAiSummary(true);
        setProjectAiSummary('');

        try {
            const readmeSnippet = project.stats?.readme?.slice(0, 2000) || '';
            const projectDescription = project.stats?.description || project.display_name;

            const res = await fetch(API_CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Summarize this project in 2-3 sentences, highlighting its purpose and key technologies: ${projectDescription}`,
                    project_context: `Project: ${project.display_name}. Description: ${projectDescription}. README: ${readmeSnippet}`
                })
            });
            const data = await res.json();
            setProjectAiSummary(data.response);
        } catch (err) {
            // Fallback to static description
            setProjectAiSummary(project.stats?.description || 'A professional-level project focused on technical excellence.');
        } finally {
            setIsLoadingAiSummary(false);
        }
    }, []);

    // Render folder tree
    const renderTree = (items: (FileItem | FolderItem)[], depth = 0) => {
        return items.map(item => {
            if (item.type === 'folder') {
                return (
                    <div key={item.id}>
                        <div
                            onClick={() => toggleFolder(item.id)}
                            className="flex items-center gap-1 py-0.5 px-2 hover:bg-[#2a2d2e] cursor-pointer text-[13px]"
                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        >
                            {item.expanded ? (
                                <ChevronDown className="w-4 h-4 shrink-0 text-[#cccccc]" />
                            ) : (
                                <ChevronRight className="w-4 h-4 shrink-0 text-[#cccccc]" />
                            )}
                            {item.expanded ? (
                                <FolderOpen className="w-4 h-4 shrink-0 text-[#dcb67a]" />
                            ) : (
                                <Folder className="w-4 h-4 shrink-0 text-[#dcb67a]" />
                            )}
                            <span className="text-[#cccccc]">{item.name}</span>
                        </div>
                        {item.expanded && (
                            <div>{renderTree(item.children, depth + 1)}</div>
                        )}
                    </div>
                );
            } else {
                const Icon = item.icon;
                return (
                    <div
                        key={item.id}
                        onClick={() => handleOpenFile(item.id)}
                        className={`flex items-center gap-2 py-0.5 px-2 cursor-pointer text-[13px]
                            ${activeTab === item.id ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'}`}
                        style={{ paddingLeft: `${depth * 12 + 24}px` }}
                    >
                        <Icon className="w-4 h-4 shrink-0 text-[#519aba]" />
                        <span className="text-[#cccccc]">{item.name}</span>
                    </div>
                );
            }
        });
    };

    const getTabIcon = (tabId: string) => {
        if (tabId.endsWith('.md')) return FileText;
        if (tabId.endsWith('.json')) return FileJson;
        if (tabId.endsWith('.ts') || tabId.endsWith('.tsx')) return FileCode2;
        if (tabId.startsWith('project-')) return Code;
        return FileText;
    };

    const getTabName = (tabId: string) => {
        if (tabId.startsWith('project-')) {
            const projectId = tabId.replace('project-', '');
            const project = rosterData.find(p => String(p.position) === projectId);
            return project ? `${project.display_name}.tsx` : tabId;
        }
        return tabId;
    };



    return (
        <div
            className="h-screen w-screen flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Oxygen,Ubuntu,sans-serif] text-[13px] overflow-hidden"
            style={{ backgroundColor: theme.bg, color: theme.text }}
        >

            <div className="flex-1 flex overflow-hidden">

                {/* Activity Bar */}
                <div className={`w-[48px] ${isDarkTheme ? 'bg-[#333333]' : 'bg-[#e0e0e0]'} flex flex-col items-center py-1 shrink-0 border-r ${theme.border}`}>
                    {[
                        { id: 'explorer', icon: FileCode2, label: 'Explorer' },
                        { id: 'search', icon: Search, label: 'Search' },
                        { id: 'git', icon: GitBranch, label: 'Source Control' },
                        { id: 'extensions', icon: Package, label: 'Extensions' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSidebar(item.id)}
                            className={`w-[48px] h-[48px] flex items-center justify-center relative
                                ${activeSidebar === item.id
                                    ? (isDarkTheme ? 'text-white' : 'text-[#333333]')
                                    : (isDarkTheme ? 'text-[#858585] hover:text-white' : 'text-[#666666] hover:text-[#333333]')}`}
                            title={item.label}
                        >
                            <item.icon className="w-6 h-6" strokeWidth={1.5} />
                            {activeSidebar === item.id && (
                                <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${isDarkTheme ? 'bg-white' : 'bg-[#333333]'}`} />
                            )}
                        </button>
                    ))}
                    <div className="mt-auto mb-2 flex flex-col gap-1">
                        <button
                            onClick={() => handleOpenFile('contact.md')}
                            className={`w-[48px] h-[48px] flex items-center justify-center ${isDarkTheme ? 'text-[#858585] hover:text-white' : 'text-[#666666] hover:text-[#333333]'}`}
                            title="Contact Info"
                        >
                            <User className="w-6 h-6" strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={() => setShowThemeMenu(!showThemeMenu)}
                            className={`w-[48px] h-[48px] flex items-center justify-center relative ${isDarkTheme ? 'text-[#858585] hover:text-white' : 'text-[#666666] hover:text-[#333333]'}`}
                            title="Theme Settings"
                        >
                            <Settings className="w-6 h-6" strokeWidth={1.5} />
                            {/* Theme indicator dot */}
                            <div
                                className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: theme.accent }}
                            />
                        </button>

                        {/* Theme Menu Popup */}
                        {showThemeMenu && (
                            <div
                                className="absolute bottom-14 left-1 w-56 rounded-lg shadow-2xl z-50 overflow-hidden"
                                style={{ backgroundColor: theme.sidebar, border: `1px solid ${theme.border}` }}
                            >
                                <div className="p-3 border-b" style={{ borderColor: theme.border }}>
                                    <button
                                        onClick={() => {
                                            setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
                                            setShowThemeMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-white text-[12px] rounded flex items-center justify-between transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: theme.accent }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {currentTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                            <span>{currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                        </div>
                                        <span className="text-[10px] opacity-70 underline">Toggle</span>
                                    </button>
                                </div>

                                <div className="p-2 text-[11px] uppercase tracking-wide opacity-60 flex items-center justify-between" style={{ color: theme.text }}>
                                    <span>Color Themes</span>
                                    <Settings className="w-3 h-3" />
                                </div>
                                {(Object.keys(themes) as ThemeName[]).map((themeKey) => (
                                    <button
                                        key={themeKey}
                                        onClick={() => { setCurrentTheme(themeKey); setShowThemeMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-[12px] flex items-center gap-2 transition-colors"
                                        style={{ backgroundColor: currentTheme === themeKey ? theme.selection : 'transparent', color: theme.text }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentTheme === themeKey ? theme.selection : 'transparent'}
                                    >
                                        <div
                                            className="w-4 h-4 rounded border flex items-center justify-center"
                                            style={{ borderColor: theme.border }}
                                        >
                                            {currentTheme === themeKey && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />}
                                        </div>
                                        <span>{themes[themeKey].name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div
                    className={`flex flex-col shrink-0 border-r ${isDarkTheme ? 'border-[#1e1e1e]' : 'border-[#cccccc]'}`}
                    style={{ width: sidebarWidth, backgroundColor: theme.sidebar }}
                >
                    <div className="h-[35px] flex items-center justify-between px-4 text-[11px] uppercase tracking-wide text-[#bbbbbb]">
                        <span>{activeSidebar === 'explorer' ? 'Explorer' : activeSidebar === 'search' ? 'Search' : activeSidebar === 'git' ? 'Source Control' : 'Extensions'}</span>
                        <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-white" />
                    </div>
                    <div className="flex-1 overflow-y-auto text-[13px]">
                        {/* Explorer View */}
                        {activeSidebar === 'explorer' && renderTree(folders)}

                        {/* Search View */}
                        {activeSidebar === 'search' && (
                            <div className="p-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search portfolio..."
                                    className="w-full bg-[#3c3c3c] text-white text-[12px] px-3 py-2 rounded outline-none focus:ring-1 focus:ring-[#007acc] mb-3"
                                />
                                {searchResults.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[11px] text-[#969696] uppercase mb-2">Results</div>
                                        {searchResults.map((r, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleOpenFile(r.id)}
                                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#37373d] cursor-pointer rounded"
                                            >
                                                <span className="text-[10px] bg-[#007acc]/30 text-[#007acc] px-1.5 py-0.5 rounded">{r.type}</span>
                                                <span className="text-[#cccccc] text-[12px]">{r.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSearching && (
                                    <div className="text-[11px] text-[#969696] animate-pulse">🤖 AI thinking...</div>
                                )}
                                {searchAiResponse && !isSearching && (
                                    <div className="mt-3 p-3 bg-[#1e1e1e] rounded border border-[#3c3c3c]">
                                        <div className="text-[11px] text-[#969696] uppercase mb-2 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> AI Quick Answer
                                        </div>
                                        <p className="text-[12px] text-[#cccccc] leading-relaxed">{searchAiResponse}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Git/Source Control View - Show Projects */}
                        {activeSidebar === 'git' && (
                            <div className="p-2">
                                <div className="text-[11px] text-[#969696] uppercase mb-3">GitHub Repositories</div>
                                {rosterData.filter(p => p.type === 'repo').map((project, i) => (
                                    <a
                                        key={i}
                                        href={project.stats?.url || '#'}
                                        target="_blank"
                                        className="flex items-center gap-2 px-2 py-2 hover:bg-[#37373d] rounded group mb-1"
                                    >
                                        <GitBranch className="w-4 h-4 text-[#007acc]" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[12px] text-white truncate">{project.display_name}</div>
                                            <div className="text-[10px] text-[#969696]">{project.repo_name}</div>
                                        </div>
                                        <span className="text-[10px] text-yellow-500 flex items-center gap-1">
                                            <Star className="w-3 h-3" /> {project.stats?.stars || 0}
                                        </span>
                                    </a>
                                ))}
                                <div className="mt-4 pt-3 border-t border-[#3c3c3c]">
                                    <div className="text-[11px] text-[#969696] uppercase mb-2">Quick Links</div>
                                    <a href="https://github.com/DixonzorCmpsi" target="_blank" className="flex items-center gap-2 px-2 py-2 hover:bg-[#37373d] rounded text-[12px] text-[#cccccc]">
                                        <User className="w-4 h-4" /> GitHub Profile
                                    </a>
                                    <a href="https://linkedin.com/in/dixon-zor" target="_blank" className="flex items-center gap-2 px-2 py-2 hover:bg-[#37373d] rounded text-[12px] text-[#cccccc]">
                                        <Activity className="w-4 h-4" /> LinkedIn
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Extensions View - Skills & Tech Stack */}
                        {activeSidebar === 'extensions' && (
                            <div className="p-2">
                                <div className="text-[11px] text-[#969696] uppercase mb-3">Installed Skills</div>
                                {skills && (
                                    <>
                                        <div className="mb-4">
                                            <div className="text-[11px] text-[#007acc] mb-2">Languages</div>
                                            <div className="flex flex-wrap gap-1">
                                                {skills.languages.map((s, i) => (
                                                    <span key={i} className="text-[10px] bg-[#3c3c3c] text-[#cccccc] px-2 py-1 rounded">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-[11px] text-[#007acc] mb-2">Frameworks</div>
                                            <div className="flex flex-wrap gap-1">
                                                {skills.frameworks.map((s, i) => (
                                                    <span key={i} className="text-[10px] bg-[#3c3c3c] text-[#cccccc] px-2 py-1 rounded">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-[11px] text-[#007acc] mb-2">Tools</div>
                                            <div className="flex flex-wrap gap-1">
                                                {skills.tools.map((s, i) => (
                                                    <span key={i} className="text-[10px] bg-[#3c3c3c] text-[#cccccc] px-2 py-1 rounded">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Resize Handle */}
                <div
                    className={`w-1 cursor-ew-resize hover:bg-[#007acc] transition-colors ${isResizingSidebar ? 'bg-[#007acc]' : 'bg-transparent'}`}
                    onMouseDown={() => setIsResizingSidebar(true)}
                />

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: theme.editor }}>

                    {/* Editor Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 max-w-5xl">
                            {activeTab === 'resume.pdf' && (
                                <div className="flex flex-col items-center justify-center py-20 text-[#969696] text-center">
                                    <FileText className="w-16 h-16 mb-4 text-[#007acc] opacity-50" />
                                    <h2 className="text-white text-[20px] font-light mb-2">resume.pdf</h2>
                                    <p className="text-[14px] mb-6 max-w-md">
                                        Click below to view Dixon's resume in an overlay.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowResumeModal(true)}
                                            className="px-6 py-2 bg-[#007acc] hover:bg-[#005a9e] text-white rounded text-[13px] transition-colors"
                                        >
                                            View Resume
                                        </button>
                                        <a href="/resume.pdf" download className="px-6 py-2 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-white rounded text-[13px] transition-colors">Download</a>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'welcome.md' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 relative rounded-full overflow-hidden border-2 border-[#007acc] shrink-0 shadow-lg">
                                            <Image
                                                src="/headshot.jpg"
                                                alt="Dixon Zor"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="text-[32px] font-light mb-2" style={{ color: theme.text }}>Welcome</h1>
                                            <p className="opacity-60" style={{ color: theme.text }}>Dixon Zor's Developer Portfolio</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'resume.pdf', label: 'Resume', desc: 'Current resume in PDF' },
                                            { id: 'experience.json', label: 'Experience', desc: 'View work history' },
                                            { id: 'education.json', label: 'Education', desc: 'Academic background' },
                                            { id: 'skills.ts', label: 'Skills', desc: 'Technical abilities' },
                                        ].map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleOpenFile(item.id)}
                                                className="p-4 border rounded cursor-pointer transition-colors"
                                                style={{ backgroundColor: theme.sidebar, borderColor: theme.border }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
                                            >
                                                <h3 className="font-medium mb-1" style={{ color: theme.text }}>{item.label}</h3>
                                                <p className="text-[12px] opacity-60" style={{ color: theme.text }}>{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'README.md' && (
                                <div className="prose prose-invert max-w-none">
                                    <h1 className="text-[28px] font-normal text-white border-b border-[#3c3c3c] pb-4 mb-6">
                                        # Dixon Zor
                                    </h1>
                                    <div className="text-[14px] text-[#cccccc] leading-relaxed whitespace-pre-wrap">
                                        {aboutText}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'experience.json' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h1 className="text-[24px] font-light text-white">Experience</h1>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setViewMode('preview')}
                                                className={`px-3 py-1 text-[12px] rounded ${viewMode === 'preview' ? 'bg-[#007acc] text-white' : 'text-[#969696] hover:text-white'}`}
                                            >
                                                Preview
                                            </button>
                                            <button
                                                onClick={() => setViewMode('code')}
                                                className={`px-3 py-1 text-[12px] rounded ${viewMode === 'code' ? 'bg-[#007acc] text-white' : 'text-[#969696] hover:text-white'}`}
                                            >
                                                JSON
                                            </button>
                                        </div>
                                    </div>
                                    {viewMode === 'code' ? (
                                        <pre className="p-4 rounded border text-[13px] font-mono text-[#ce9178] overflow-x-auto" style={{ backgroundColor: theme.editor, borderColor: theme.border }}>
                                            {JSON.stringify({ experiences }, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="space-y-4">
                                            {experiences.map((exp, i) => (
                                                <div key={i} className="p-4 bg-[#252526] border border-[#3c3c3c] rounded">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="text-white font-medium">{exp.role}</h3>
                                                            <p className="text-[#007acc] text-[13px]">{exp.company}</p>
                                                        </div>
                                                        <span className="text-[11px] text-[#969696] bg-[#3c3c3c] px-2 py-1 rounded">
                                                            {exp.period}
                                                        </span>
                                                    </div>
                                                    <ul className="mt-3 space-y-1">
                                                        {exp.highlights.map((h: string, j: number) => (
                                                            <li key={j} className="text-[13px] text-[#cccccc] flex gap-2">
                                                                <span className="text-[#007acc]">•</span> {h}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'education.json' && (
                                <div className="space-y-6">
                                    <h1 className="text-[24px] font-light text-white mb-2">Education</h1>
                                    <p className="text-[#969696] text-[13px] mb-6">Academic background from resume</p>

                                    {education.map((edu: any, i: number) => (
                                        <div key={i} className="p-6 bg-gradient-to-br from-[#252526] to-[#1e1e1e] border border-[#3c3c3c] rounded-lg">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-[#007acc]/20 rounded-lg flex items-center justify-center">
                                                        <GraduationCap className="w-7 h-7 text-[#007acc]" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-[18px] text-white font-medium">{edu.institution}</h2>
                                                        <p className="text-[#007acc] text-[14px]">{edu.college || 'College of Engineering'}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-[#969696] bg-[#3c3c3c] px-3 py-1 rounded-full">
                                                    {edu.period}
                                                </span>
                                            </div>

                                            {/* Degree Info */}
                                            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: theme.editor }}>
                                                <div className="text-[14px] text-white font-medium mb-1">
                                                    {edu.degree} in {edu.field}
                                                </div>
                                                <div className="text-[13px] text-[#969696]">
                                                    Graduated with focus on Machine Learning, AI, and Software Engineering
                                                </div>
                                            </div>

                                            {/* Achievements */}
                                            {edu.honors && (
                                                <div>
                                                    <h4 className="text-[12px] text-[#969696] uppercase tracking-wide mb-3">Achievements & Coursework</h4>
                                                    <div className="space-y-2">
                                                        {edu.honors.map((h: string, j: number) => (
                                                            <div key={j} className="flex items-center gap-3 text-[13px] text-[#cccccc]">
                                                                <span className="w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center text-yellow-500">★</span>
                                                                <span>{h}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'skills.ts' && (
                                <pre className="font-mono text-[13px] leading-relaxed">
                                    <span className="text-[#569cd6]">export const</span> <span className="text-[#dcdcaa]">skills</span> = {'{'}{'\n'}
                                    {'  '}<span className="text-[#9cdcfe]">languages</span>: [<span className="text-[#ce9178]">"JavaScript", "Python", "C++", "SQL"</span>],{'\n'}
                                    {'  '}<span className="text-[#9cdcfe]">frameworks</span>: [<span className="text-[#ce9178]">"React", "Next.js", "Flask", "FastAPI"</span>],{'\n'}
                                    {'  '}<span className="text-[#9cdcfe]">cloud</span>: [<span className="text-[#ce9178]">"Azure", "AWS", "GCP", "Docker"</span>],{'\n'}
                                    {'  '}<span className="text-[#9cdcfe]">interests</span>: [<span className="text-[#ce9178]">"ML", "AI Ethics", "NFL Analytics"</span>]{'\n'}
                                    {'}'};
                                </pre>
                            )}

                            {activeTab === 'contact.md' && (
                                <div className="space-y-4">
                                    <h1 className="text-[24px] font-light text-white mb-6"># Contact</h1>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Email', value: 'dixonzor@gmail.com', href: 'mailto:dixonzor@gmail.com' },
                                            { label: 'GitHub', value: 'github.com/DixonzorCmpsi', href: 'https://github.com/DixonzorCmpsi' },
                                            { label: 'LinkedIn', value: 'linkedin.com/in/dixon-zor', href: 'https://linkedin.com/in/dixon-zor' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center gap-4">
                                                <span className="text-[#969696] w-20">{item.label}:</span>
                                                <a href={item.href} target="_blank" className="text-[#007acc] hover:underline">
                                                    {item.value}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects List View */}
                            {activeTab === 'projects.tsx' && (
                                <div className="space-y-6">
                                    <h1 className="text-[24px] font-light text-white mb-6">Projects</h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {rosterData.filter(p => p.type === 'repo').map(project => (
                                            <div
                                                key={project.position}
                                                onClick={() => handleOpenFile(`project-${project.position}`)}
                                                className="p-5 bg-[#252526] border border-[#3c3c3c] rounded-lg hover:border-[#007acc] cursor-pointer transition-all hover:bg-[#2a2d2e] group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="text-3xl">{project.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white font-medium text-[15px] group-hover:text-[#007acc] transition-colors">
                                                            {project.display_name}
                                                        </h3>
                                                        <p className="text-[#969696] text-[12px] mt-1 line-clamp-2">
                                                            {project.stats?.description || 'No description available'}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <span className="text-[11px] bg-[#007acc]/20 text-[#007acc] px-2 py-0.5 rounded">
                                                                {project.stats?.language || 'Code'}
                                                            </span>
                                                            <span className="text-[11px] text-[#969696] flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-yellow-500" />
                                                                {project.stats?.stars || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Individual Project View */}
                            {activeTab.startsWith('project-') && (() => {
                                const projectId = activeTab.replace('project-', '');
                                const project = rosterData.find(p => String(p.position) === projectId);
                                if (!project) return null;
                                return (
                                    <div className="flex h-full">
                                        {/* Left: Project Details */}
                                        <div className="flex-1 p-6 overflow-y-auto">
                                            <div className="flex items-center gap-4 mb-6">
                                                <span className="text-4xl">{project.icon}</span>
                                                <div>
                                                    <h1 className="text-[24px] font-light text-white">{project.display_name}</h1>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[11px] bg-[#007acc]/20 text-[#007acc] px-2 py-0.5 rounded">
                                                            {project.stats?.language}
                                                        </span>
                                                        <span className="text-[11px] text-yellow-500 flex items-center gap-1">
                                                            <Star className="w-3 h-3" /> {project.stats?.stars} stars
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-8">
                                                <h3 className="text-white text-[14px] font-medium mb-3 flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-[#007acc]" />
                                                    Project Summary
                                                    {isLoadingAiSummary && (
                                                        <span className="text-[10px] text-[#007acc] animate-pulse ml-2">✨ AI generating...</span>
                                                    )}
                                                </h3>
                                                <div className="p-4 bg-[#252526] border border-[#3c3c3c] rounded-lg text-[#cccccc] text-[14px] leading-relaxed shadow-sm">
                                                    {isLoadingAiSummary ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-[#969696]">Generating AI summary...</span>
                                                        </div>
                                                    ) : projectAiSummary ? (
                                                        projectAiSummary
                                                    ) : (
                                                        project.stats?.description || "A professional-level project focused on technical excellence and practical application."
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mb-6">
                                                <a
                                                    href={project.stats?.url}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 bg-[#007acc] hover:bg-[#005a9e] text-white px-4 py-2 rounded text-[13px] transition-colors"
                                                >
                                                    <GitBranch className="w-4 h-4" /> View on GitHub
                                                </a>
                                            </div>

                                            {/* Project Media Gallery */}
                                            {(project.stats?.images?.length > 0 || project.stats?.videos?.length > 0) && (
                                                <div className="mb-6">
                                                    <h3 className="text-white text-[14px] font-medium mb-4 flex items-center gap-2">
                                                        📸 Project Media
                                                    </h3>

                                                    {/* Images */}
                                                    {project.stats?.images?.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                                            {project.stats.images.map((img: string, i: number) => (
                                                                <div key={i} className="relative aspect-video rounded overflow-hidden border transition-colors" style={{ backgroundColor: theme.editor, borderColor: theme.border }}>
                                                                    <img
                                                                        src={`/api${img}`}
                                                                        alt={`${project.display_name} screenshot ${i + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Videos */}
                                                    {project.stats?.videos?.length > 0 && (
                                                        <div className="space-y-3">
                                                            {project.stats.videos.map((vid: string, i: number) => (
                                                                <div key={i} className="bg-[#1e1e1e] rounded overflow-hidden border border-[#3c3c3c]">
                                                                    <video
                                                                        controls
                                                                        className="w-full max-h-[400px]"
                                                                        preload="metadata"
                                                                    >
                                                                        <source src={`/api${vid}`} type="video/mp4" />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {project.stats?.readme && (
                                                <div className="p-4 bg-[#1e1e1e] border border-[#3c3c3c] rounded">
                                                    <h3 className="text-white text-[13px] font-medium mb-3 flex items-center gap-2">
                                                        <FileText className="w-4 h-4" /> README.md
                                                    </h3>
                                                    <pre className="text-[#cccccc] text-[12px] whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto">
                                                        {project.stats.readme}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: AI Chat Panel */}
                                        <div className="w-[350px] bg-[#252526] border-l border-[#3c3c3c] flex flex-col shrink-0">
                                            <div className="p-3 border-b border-[#3c3c3c] text-[12px] font-medium text-[#cccccc] flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Project Assistant
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ backgroundColor: theme.editor }}>
                                                {projectChatHistory.length === 0 && (
                                                    <div className="text-[#969696] text-center text-[12px] mt-10 px-4">
                                                        <p className="mb-2">👋 Hi! I'm your AI context assistant.</p>
                                                        <p>Ask me anything about <strong>{project.display_name}</strong>!</p>
                                                    </div>
                                                )}
                                                {projectChatHistory.map((msg, i) => (
                                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] p-2 rounded text-[12px] ${msg.role === 'user'
                                                            ? 'bg-[#007acc] text-white'
                                                            : 'bg-[#3c3c3c] text-[#cccccc]'
                                                            }`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    if (!projectChatInput.trim()) return;
                                                    const msg = projectChatInput;
                                                    setProjectChatInput('');
                                                    setProjectChatHistory(prev => [...prev, { role: 'user', content: msg }]);

                                                    try {
                                                        const res = await fetch(API_CHAT_ENDPOINT, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                message: msg,
                                                                project_context: `Project: ${project.display_name}. Description: ${project.stats?.description || ''}. README: ${project.stats?.readme?.slice(0, 2000) || ''}`
                                                            })
                                                        });
                                                        const data = await res.json();
                                                        setProjectChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
                                                    } catch (err) {
                                                        setProjectChatHistory(prev => [...prev, { role: 'assistant', content: 'Connection error. Ensure backend is running.' }]);
                                                    }
                                                }}
                                                className="p-3 bg-[#252526] border-t border-[#3c3c3c]"
                                            >
                                                <input
                                                    type="text"
                                                    value={projectChatInput}
                                                    onChange={e => setProjectChatInput(e.target.value)}
                                                    placeholder="Ask about this project..."
                                                    className="w-full bg-[#3c3c3c] text-white text-[12px] px-3 py-2 rounded outline-none focus:ring-1 focus:ring-[#007acc] border border-transparent focus:border-[#007acc]"
                                                />
                                            </form>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Terminal Resize Handle */}
                    {isTerminalOpen && (
                        <div
                            className={`h-1 cursor-ns-resize hover:bg-[#007acc] transition-colors ${isResizingTerminal ? 'bg-[#007acc]' : 'bg-transparent'}`}
                            onMouseDown={() => setIsResizingTerminal(true)}
                        />
                    )}

                    {/* Terminal Panel */}
                    {isTerminalOpen && (
                        <div
                            className="border-t flex flex-col shrink-0"
                            style={{ height: terminalHeight, backgroundColor: theme.editor, borderColor: theme.border }}
                        >
                            <div className="h-[35px] bg-[#252526] flex items-center justify-between px-2 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-2 py-1 bg-[#1e1e1e] text-[12px]">
                                        <TerminalIcon className="w-3 h-3" />
                                        <span>TERMINAL</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-1 hover:bg-[#3c3c3c] rounded">
                                        <Split className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-[#3c3c3c] rounded">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsTerminalOpen(false)}
                                        className="p-1 hover:bg-[#3c3c3c] rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div
                                ref={terminalRef}
                                className="flex-1 overflow-y-auto p-2 font-mono text-[13px] bg-[#1e1e1e]"
                            >
                                <div className="text-[#569cd6] mb-2">
                                    Windows PowerShell<br />
                                    Copyright (C) Microsoft Corporation. All rights reserved.
                                </div>
                                <div className="text-[#4ec9b0] mb-2">
                                    Dixon's AI Assistant Ready. Type a question about Dixon...
                                </div>
                                {terminalHistory.map((msg, i) => (
                                    <div key={i} className="mb-1">
                                        {msg.role === 'user' ? (
                                            <div>
                                                <span className="text-[#dcdcaa]">PS C:\portfolio&gt;</span>{' '}
                                                <span className="text-white">{msg.content}</span>
                                            </div>
                                        ) : (
                                            <div className="text-[#4ec9b0] pl-4 whitespace-pre-wrap">
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="text-[#969696] animate-pulse">Processing...</div>
                                )}
                            </div>
                            <form onSubmit={handleTerminalSubmit} className="px-2 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#dcdcaa] text-[13px] font-mono">PS C:\portfolio&gt;</span>
                                    <input
                                        type="text"
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        className="flex-1 bg-transparent text-white outline-none font-mono text-[13px]"
                                        placeholder="Ask about Dixon..."
                                        autoFocus
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div
                className="h-[22px] flex items-center justify-between px-2 text-[12px] text-white shrink-0"
                style={{ backgroundColor: theme.accent }}
            >
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> main
                    </span>
                    <span className="hover:bg-white/10 px-1 cursor-pointer">0 ↺</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>Ln 1, Col 1</span>
                    <span>Spaces: 2</span>
                    <span>UTF-8</span>
                    <span
                        className="hover:bg-white/10 px-1 cursor-pointer"
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                    >
                        🎨 {themes[currentTheme].name}
                    </span>
                    <button
                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                        className="flex items-center gap-1 hover:bg-white/10 px-1"
                    >
                        <TerminalIcon className="w-3 h-3" />
                        {isTerminalOpen ? 'Terminal' : 'Terminal (hidden)'}
                    </button>
                </div>
            </div>

            {/* Resume Modal Overlay */}
            {
                showResumeModal && (
                    <div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                        onClick={() => setShowResumeModal(false)}
                    >
                        <div
                            className="relative bg-[#1e1e1e] rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-5xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 right-0 h-10 bg-[#2d2d2d] rounded-t-lg flex items-center justify-between px-4">
                                <span className="text-[13px] text-white">resume.pdf - Dixon Zor</span>
                                <button
                                    onClick={() => setShowResumeModal(false)}
                                    className="text-[#969696] hover:text-white p-1 rounded hover:bg-[#3c3c3c]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <iframe
                                src="/resume.pdf"
                                className="w-full h-full pt-10 rounded-b-lg"
                                title="Dixon's Resume"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}


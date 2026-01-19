# Implementation Plan for Portfolio Enhancements

## COMPLETED ✅
1. Name changed from "Dixon Zor Smeal" to "Dixon Zor" in:
   - VSCodePortfolio.tsx README section
   - Backend main_simple.py context

## IN PROGRESS 🔄

### Immediate Actions
- [x] Change name to Dixon Zor
- [ ] Fix TypeScript icon errors (icons need to be rendered as <Icon /> not {icon})
- [ ] Add closeable tabs UI with X buttons

### Medium Priority  
- [ ] Terminal repositioning (left sidebar by default, toggle to bottom)
- [ ] Enhanced project modal with:
  - Project link
  - GitHub repo link
  - README display
  - Project-specific chatbot

### Long-term
- [ ] GitHub activity graph
- [ ] Daily pinned projects sync (cron/GitHub Actions)
- [ ] PDF education parsing

## TECHNICAL NOTES

### Icon Rendering Fix Needed:
```tsx
// Current (WRONG):
<span>{tab.icon}</span>

// Should be:
<tab.icon className="w-4 h-4" />
```

### Closeable Tabs Implementation:
```tsx
// In tab bar:
{openTabs.map(tabId => {
  const tab = tabs.find(t => t.id === tabId);
  return (
    <div key={tabId} className="flex items-center">
      <tab.icon className="w-4 h-4" />
      <span>{tab.label}</span>
      <X onClick={(e) => handleCloseTab(tabId, e)} className="w-3 h-3" />
    </div>
  );
})}
```

### Terminal Positioning:
- Add state: `const [terminalPosition, setTerminalPosition] = useState<'left' | 'bottom'>('left')`
- When 'left': Show in sidebar like current extensions panel
- When 'bottom': Show at bottom like traditional terminal
- Add toggle button in terminal header

## NEXT STEPS
Due to file complexity, recommend creating modular components:
1. `TabBar.tsx` - Handle tab rendering and closing
2. `TerminalPanel.tsx` - Separate terminal logic
3. `ProjectModal.tsx` - Enhanced project details with chat
4. `GitHubActivityGraph.tsx` - Activity visualization

This will make the codebase more maintainable and easier to test.

import React from 'react';
import { Activity, GitCommit, GitPullRequest, Star } from 'lucide-react';

export const GithubActivity: React.FC = () => {
    // Generate mock contribution data
    const weeks = 24;
    const days = 7;
    const activityData = Array.from({ length: weeks * days }).map(() => Math.floor(Math.random() * 5));

    const getColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-[#2d2d30]';
            case 1: return 'bg-[#0e4429]';
            case 2: return 'bg-[#006d32]';
            case 3: return 'bg-[#26a641]';
            case 4: return 'bg-[#39d353]';
            default: return 'bg-[#2d2d30]';
        }
    };

    return (
        <div className="bg-[#252526] rounded-xl border border-[#2d2d30] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#39d353]" />
                    <h3 className="text-white font-bold">GitHub Activity</h3>
                </div>
                <div className="text-[10px] text-[#858585] flex gap-3">
                    <span className="flex items-center gap-1"><GitCommit className="w-3 h-3" /> 2,431 Commits</span>
                    <span className="flex items-center gap-1"><GitPullRequest className="w-3 h-3" /> 154 PRs</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 87 Stars</span>
                </div>
            </div>

            <div className="flex flex-col gap-1 overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex gap-1">
                    {Array.from({ length: weeks }).map((_, w) => (
                        <div key={w} className="flex flex-col gap-1">
                            {Array.from({ length: days }).map((_, d) => {
                                const level = activityData[w * days + d];
                                return (
                                    <div
                                        key={d}
                                        className={`w-3 h-3 rounded-sm ${getColor(level)} transition-all hover:scale-125 cursor-default`}
                                        title={`${level} contributions`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-[#858585] px-1">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <div className="flex items-center gap-1 ml-auto">
                        <span>Less</span>
                        <div className="w-2 h-2 rounded-sm bg-[#2d2d30]" />
                        <div className="w-2 h-2 rounded-sm bg-[#0e4429]" />
                        <div className="w-2 h-2 rounded-sm bg-[#006d32]" />
                        <div className="w-2 h-2 rounded-sm bg-[#26a641]" />
                        <div className="w-2 h-2 rounded-sm bg-[#39d353]" />
                        <span>More</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#333]">
                    <div className="text-[10px] text-[#858585] uppercase">Longest Streak</div>
                    <div className="text-xl font-bold text-white">42 Days</div>
                </div>
                <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#333]">
                    <div className="text-[10px] text-[#858585] uppercase">Current Streak</div>
                    <div className="text-xl font-bold text-white">15 Days</div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

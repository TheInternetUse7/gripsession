"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/Input';
import clsx from 'clsx';

const POPULAR_SUBS = [
    'nsfw', 'realgirls', 'nsfw_gifs', 'collegesluts', 'pawg',
    'ass', 'boobs', 'pussy', 'milf', 'amateur'
];

export function SubsManager() {
    const { subs, addSub, removeSub, toggleSub } = useStore();
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const cleanName = inputValue.trim().toLowerCase().replace(/^r\//, '');
        if (cleanName && !subs.some(s => s.name === cleanName)) {
            addSub(cleanName);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const quickAdd = (subName: string) => {
        if (!subs.some(s => s.name === subName)) {
            addSub(subName);
        }
    };

    return (
        <div className="space-y-4">
            {/* Add New Sub */}
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="SUBREDDIT NAME..."
                    className="flex-1"
                />
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-foreground text-background font-mono text-xs uppercase border border-border hover:bg-background hover:text-foreground transition-colors"
                >
                    [ADD]
                </button>
            </div>

            {/* Subs List */}
            <div className="border border-border">
                <div className="border-b border-border p-2 bg-surface">
                    <span className="font-mono text-xs text-muted">
                        {subs.filter(s => s.enabled).length} / {subs.length} ACTIVE
                    </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {subs.length === 0 ? (
                        <div className="p-8 text-center font-mono text-sm text-muted">
                            NO SUBS ADDED
                        </div>
                    ) : (
                        subs.map((sub) => (
                            <div
                                key={sub.name}
                                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-surface transition-colors"
                            >
                                <button
                                    onClick={() => toggleSub(sub.name)}
                                    className={clsx(
                                        "w-5 h-5 border border-border flex items-center justify-center transition-colors",
                                        sub.enabled ? "bg-foreground text-background" : "bg-background text-muted"
                                    )}
                                >
                                    {sub.enabled && (
                                        <svg className="w-3 h-3" viewBox="0 0 12 12">
                                            <path
                                                d="M2 6 L5 9 L10 3"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1">
                                    <span className={clsx(
                                        "font-mono text-sm",
                                        sub.enabled ? "text-foreground" : "text-muted"
                                    )}>
                                        r/{sub.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeSub(sub.name)}
                                    className="font-mono text-xs px-2 py-1 border border-border hover:bg-foreground hover:text-background transition-colors text-muted"
                                >
                                    [REMOVE]
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Add */}
            <div>
                <div className="font-mono text-xs text-muted mb-2 uppercase">Quick Add:</div>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_SUBS.map((subName) => (
                        <button
                            key={subName}
                            onClick={() => quickAdd(subName)}
                            disabled={subs.some(s => s.name === subName)}
                            className={clsx(
                                "px-3 py-1 border font-mono text-xs uppercase transition-colors",
                                subs.some(s => s.name === subName)
                                    ? "border-muted text-muted cursor-not-allowed"
                                    : "border-border text-foreground hover:bg-foreground hover:text-background"
                            )}
                        >
                            r/{subName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

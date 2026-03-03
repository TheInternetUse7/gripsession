"use client";

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/Input';

function isoDateOnly(iso: string): string {
    return iso.split('T')[0] ?? iso;
}

export function TemplatesManager() {
    const {
        subs,
        templates,
        saveTemplate,
        applyTemplate,
        renameTemplate,
        deleteTemplate,
        exportTemplates,
        importTemplates,
    } = useStore();

    const [templateName, setTemplateName] = useState('');

    const currentSubs = useMemo(
        () => subs.filter((sub) => sub.source === 'reddit' && sub.enabled).map((sub) => sub.name),
        [subs]
    );

    const handleSaveTemplate = () => {
        const cleanName = templateName.trim();
        if (!cleanName) {
            alert('Template name is required.');
            return;
        }

        if (currentSubs.length === 0) {
            alert('Add at least one subreddit before saving a template.');
            return;
        }

        const existingTemplate = templates.find(
            (template) => template.name.toLowerCase() === cleanName.toLowerCase()
        );
        if (existingTemplate && !confirm('Template already exists. Replace it with current subs?')) {
            return;
        }

        saveTemplate(cleanName);
        setTemplateName('');
    };

    const handleApplyTemplate = (id: string, name: string) => {
        if (!confirm(`Apply "${name}" template? This will replace your current subs.`)) {
            return;
        }
        applyTemplate(id);
    };

    const handleRenameTemplate = (id: string, currentName: string) => {
        const nextName = prompt('Rename template', currentName);
        if (!nextName) return;

        const cleanName = nextName.trim();
        if (!cleanName) {
            alert('Template name cannot be empty.');
            return;
        }

        const conflictingTemplate = templates.find(
            (template) =>
                template.id !== id &&
                template.name.toLowerCase() === cleanName.toLowerCase()
        );
        if (
            conflictingTemplate &&
            !confirm(`"${cleanName}" already exists. Replace the existing template?`)
        ) {
            return;
        }

        renameTemplate(id, cleanName);
    };

    const handleDeleteTemplate = (id: string, name: string) => {
        if (!confirm(`Delete "${name}" template?`)) return;
        deleteTemplate(id);
    };

    const handleExportTemplates = () => {
        const data = exportTemplates();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `gripsession-templates-${new Date().toISOString().split('T')[0]}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handleImportTemplates = () => {
        if (!confirm('Importing templates will replace all existing templates. Continue?')) {
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const content = loadEvent.target?.result;
                if (typeof content !== 'string') return;
                importTemplates(content);
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2 border border-border p-3 bg-surface">
                <div className="font-mono text-xs uppercase text-muted">
                    Current Active Subs Snapshot ({currentSubs.length})
                </div>
                <div className="font-mono text-xs text-foreground break-words">
                    {currentSubs.length > 0 ? currentSubs.map((sub) => `r/${sub}`).join(', ') : 'NO SUBS'}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSaveTemplate();
                    }}
                    placeholder="TEMPLATE NAME..."
                    className="flex-1 min-w-0"
                />
                <button
                    onClick={handleSaveTemplate}
                    className="w-full sm:w-auto px-4 py-2 bg-foreground text-background font-mono text-xs uppercase border border-border hover:bg-background hover:text-foreground transition-colors"
                >
                    [SAVE]
                </button>
            </div>

            <div className="border border-border">
                <div className="p-2 border-b border-border bg-surface font-mono text-xs text-muted">
                    {templates.length} TEMPLATE{templates.length === 1 ? '' : 'S'}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {templates.length === 0 ? (
                        <div className="p-6 text-center font-mono text-sm text-muted">
                            NO TEMPLATES YET
                        </div>
                    ) : (
                        templates.map((template) => (
                            <div
                                key={template.id}
                                className="p-3 border-b border-border last:border-b-0 space-y-2 hover:bg-surface transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                    <div className="min-w-0">
                                        <div className="font-mono text-sm uppercase break-words">{template.name}</div>
                                        <div className="font-mono text-xs text-muted">
                                            {template.subs.length} SUBS | UPDATED {isoDateOnly(template.updatedAt)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleApplyTemplate(template.id, template.name)}
                                            className="px-2 py-1 border border-border font-mono text-xs uppercase hover:bg-foreground hover:text-background transition-colors"
                                        >
                                            [APPLY]
                                        </button>
                                        <button
                                            onClick={() => handleRenameTemplate(template.id, template.name)}
                                            className="px-2 py-1 border border-border font-mono text-xs uppercase hover:bg-foreground hover:text-background transition-colors"
                                        >
                                            [RENAME]
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                                            className="px-2 py-1 border border-red-500 text-red-500 font-mono text-xs uppercase hover:bg-red-500 hover:text-black transition-colors"
                                        >
                                            [DELETE]
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {template.subs.map((sub) => (
                                        <span
                                            key={`${template.id}-${sub}`}
                                            className={clsx(
                                                "px-2 py-0.5 border border-border font-mono text-xs",
                                                "text-foreground"
                                            )}
                                        >
                                            r/{sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                    onClick={handleExportTemplates}
                    className="px-4 py-2 bg-foreground text-background font-mono text-xs uppercase border border-border hover:bg-background hover:text-foreground transition-colors"
                >
                    [EXPORT TEMPLATES]
                </button>
                <button
                    onClick={handleImportTemplates}
                    className="px-4 py-2 bg-background text-foreground font-mono text-xs uppercase border border-border hover:bg-foreground hover:text-background transition-colors"
                >
                    [IMPORT TEMPLATES]
                </button>
            </div>
        </div>
    );
}

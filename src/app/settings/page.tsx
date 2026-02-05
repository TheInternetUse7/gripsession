"use client";

import { Header } from "@/components/ui/Header";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Toggle } from "@/components/settings/Toggle";
import { Select } from "@/components/settings/Select";
import { Slider } from "@/components/settings/Slider";
import { SubsManager } from "@/components/settings/SubsManager";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
    const { settings, updateSettings, clearAllData, exportData, importData } = useStore();

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gripsession-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    importData(content);
                    alert('Data imported successfully!');
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            clearAllData();
            alert('All data cleared!');
        }
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <h1 className="font-serif text-5xl uppercase mb-8">Settings</h1>

                {/* Subs Management */}
                <SettingsSection title="Subs (Reddit)">
                    <SubsManager />
                </SettingsSection>

                {/* Media Type Filters */}
                <SettingsSection title="Media Filters">
                    <Toggle
                        label="Show Images"
                        description="Display image posts"
                        checked={settings.allowImages}
                        onChange={(checked) => updateSettings({ allowImages: checked })}
                    />
                    <Toggle
                        label="Show Videos"
                        description="Display video posts"
                        checked={settings.allowVideos}
                        onChange={(checked) => updateSettings({ allowVideos: checked })}
                    />
                    <Toggle
                        label="Show GIFs"
                        description="Display GIF posts"
                        checked={settings.allowGifs}
                        onChange={(checked) => updateSettings({ allowGifs: checked })}
                    />
                </SettingsSection>

                {/* Playback Settings */}
                <SettingsSection title="Playback">
                    <Toggle
                        label="Autoplay Videos"
                        description="Automatically play videos when visible"
                        checked={settings.autoplay}
                        onChange={(checked) => updateSettings({ autoplay: checked })}
                    />
                    <Toggle
                        label="Muted by Default"
                        description="Videos start muted"
                        checked={settings.muted}
                        onChange={(checked) => updateSettings({ muted: checked })}
                    />
                    <Toggle
                        label="Loop Videos"
                        description="Videos repeat continuously"
                        checked={settings.loopVideos}
                        onChange={(checked) => updateSettings({ loopVideos: checked })}
                    />
                </SettingsSection>

                {/* Display Settings */}
                <SettingsSection title="Display">
                    <Slider
                        label="Grid Columns"
                        description="Number of columns in the masonry grid"
                        value={settings.columns}
                        min={2}
                        max={6}
                        onChange={(value) => updateSettings({ columns: value })}
                    />
                    <Select
                        label="Card Size"
                        description="Size of media cards"
                        value={settings.cardSize}
                        options={[
                            { value: 'small', label: 'SMALL' },
                            { value: 'medium', label: 'MEDIUM' },
                            { value: 'large', label: 'LARGE' },
                        ]}
                        onChange={(value) => updateSettings({ cardSize: value })}
                    />
                    <Select
                        label="Show Titles"
                        description="Display post titles"
                        value={settings.showTitles}
                        options={[
                            { value: 'never', label: 'NEVER' },
                            { value: 'hover', label: 'ON HOVER' },
                            { value: 'always', label: 'ALWAYS' },
                        ]}
                        onChange={(value) => updateSettings({ showTitles: value })}
                    />
                    <Select
                        label="Theme"
                        description="Color scheme"
                        value={settings.theme}
                        options={[
                            { value: 'dark', label: 'DARK' },
                            { value: 'light', label: 'LIGHT' },
                            { value: 'oled', label: 'OLED' },
                        ]}
                        onChange={(value) => updateSettings({ theme: value })}
                    />
                </SettingsSection>

                {/* Feed Settings */}
                <SettingsSection title="Feed">
                    <Select
                        label="Sort By"
                        description="How posts are sorted"
                        value={settings.sortBy}
                        options={[
                            { value: 'hot', label: 'HOT' },
                            { value: 'new', label: 'NEW' },
                            { value: 'top', label: 'TOP' },
                        ]}
                        onChange={(value) => updateSettings({ sortBy: value })}
                    />
                    {settings.sortBy === 'top' && (
                        <Select
                            label="Top Timeframe"
                            description="Time period for top posts"
                            value={settings.topTimeframe || 'day'}
                            options={[
                                { value: 'day', label: 'TODAY' },
                                { value: 'week', label: 'THIS WEEK' },
                                { value: 'month', label: 'THIS MONTH' },
                                { value: 'year', label: 'THIS YEAR' },
                                { value: 'all', label: 'ALL TIME' },
                            ]}
                            onChange={(value) => updateSettings({ topTimeframe: value })}
                        />
                    )}
                    <Toggle
                        label="Hide Viewed Posts"
                        description="Remove posts after clicking them"
                        checked={settings.hideViewed}
                        onChange={(checked) => updateSettings({ hideViewed: checked })}
                    />
                </SettingsSection>

                {/* Advanced Settings */}
                <SettingsSection title="Advanced">
                    <Slider
                        label="Posts Per Load"
                        description="Number of posts fetched at once"
                        value={settings.postsPerLoad}
                        min={10}
                        max={50}
                        step={5}
                        onChange={(value) => updateSettings({ postsPerLoad: value })}
                    />
                    <Toggle
                        label="Preload Next Page"
                        description="Load next page in advance (experimental)"
                        checked={settings.preloadNext}
                        onChange={(checked) => updateSettings({ preloadNext: checked })}
                    />
                </SettingsSection>

                {/* Data Management */}
                <SettingsSection title="Data Management">
                    <div className="space-y-3">
                        <button
                            onClick={handleExport}
                            className="w-full px-4 py-3 bg-white text-black font-mono text-sm uppercase border border-white hover:bg-black hover:text-white transition-colors"
                        >
                            [EXPORT DATA]
                        </button>
                        <button
                            onClick={handleImport}
                            className="w-full px-4 py-3 bg-black text-white font-mono text-sm uppercase border border-white hover:bg-white hover:text-black transition-colors"
                        >
                            [IMPORT DATA]
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="w-full px-4 py-3 bg-black text-red-500 font-mono text-sm uppercase border border-red-500 hover:bg-red-500 hover:text-black transition-colors"
                        >
                            [CLEAR ALL DATA]
                        </button>
                    </div>
                    <div className="mt-3 p-3 border border-neutral-700 bg-neutral-900">
                        <p className="font-mono text-xs text-neutral-400">
                            Export saves your subs, favorites, and settings to a JSON file. Import restores from a backup file.
                        </p>
                    </div>
                </SettingsSection>
            </div>
        </main>
    );
}

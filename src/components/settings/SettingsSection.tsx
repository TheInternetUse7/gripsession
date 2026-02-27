import { ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <div className="border border-border p-6 mb-6">
            <h2 className="font-serif text-2xl uppercase mb-4">{title}</h2>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

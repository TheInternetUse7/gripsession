import { ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <div className="border border-border p-4 sm:p-6 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl uppercase mb-4 break-words">{title}</h2>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

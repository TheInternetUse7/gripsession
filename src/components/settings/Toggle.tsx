interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="font-mono text-sm uppercase">{label}</div>
                {description && (
                    <div className="font-mono text-xs text-neutral-500 mt-1">{description}</div>
                )}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`
                    w-12 h-6 border border-white relative transition-colors
                    ${checked ? 'bg-white' : 'bg-black'}
                `}
            >
                <div className={`
                    absolute top-0 w-6 h-full border-r border-white transition-transform
                    ${checked ? 'translate-x-full bg-black' : 'translate-x-0 bg-white'}
                `} />
            </button>
        </div>
    );
}

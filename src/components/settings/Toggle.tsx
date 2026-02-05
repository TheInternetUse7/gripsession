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
                    w-14 h-7 border-2 relative transition-all duration-200
                    ${checked
                        ? 'bg-white border-white'
                        : 'bg-transparent border-neutral-600'
                    }
                `}
            >
                <div
                    className={`
                        absolute top-0.5 w-5 h-5 transition-all duration-200
                        ${checked
                            ? 'left-7 bg-black'
                            : 'left-0.5 bg-neutral-600'
                        }
                    `}
                />
                <span className={`
                    absolute inset-0 flex items-center font-mono text-[10px] font-bold
                    ${checked ? 'justify-start pl-1 text-black' : 'justify-end pr-1 text-neutral-500'}
                `}>
                    {checked ? 'ON' : 'OFF'}
                </span>
            </button>
        </div>
    );
}


interface SelectProps<T extends string> {
    label: string;
    description?: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}

export function Select<T extends string>({ label, description, value, options, onChange }: SelectProps<T>) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="font-mono text-sm uppercase">{label}</div>
                {description && (
                    <div className="font-mono text-xs text-muted mt-1">{description}</div>
                )}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="bg-background text-foreground border border-border px-3 py-1 font-mono text-sm uppercase cursor-pointer hover:bg-foreground hover:text-background transition-colors"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface SelectProps<T extends string> {
    label: string;
    description?: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}

export function Select<T extends string>({ label, description, value, options, onChange }: SelectProps<T>) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1">
                <div className="font-mono text-sm uppercase">{label}</div>
                {description && (
                    <div className="font-mono text-xs text-muted mt-1">{description}</div>
                )}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="w-full sm:w-auto bg-background text-foreground border border-border px-3 py-1 font-mono text-sm uppercase cursor-pointer hover:bg-foreground hover:text-background transition-colors max-w-full"
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

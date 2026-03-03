interface SliderProps {
    label: string;
    description?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}

export function Slider({ label, description, value, min, max, step = 1, onChange }: SliderProps) {
    return (
        <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex-1">
                    <div className="font-mono text-sm uppercase">{label}</div>
                    {description && (
                        <div className="font-mono text-xs text-muted mt-1">{description}</div>
                    )}
                </div>
                <div className="font-mono text-lg font-bold self-start sm:self-auto">{value}</div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-surface border border-border appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-foreground
                    [&::-webkit-slider-thumb]:border
                    [&::-webkit-slider-thumb]:border-border
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:bg-foreground
                    [&::-moz-range-thumb]:border
                    [&::-moz-range-thumb]:border-border
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:rounded-none
                "
            />
        </div>
    );
}

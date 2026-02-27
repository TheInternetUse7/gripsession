import clsx from 'clsx';
import { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'>;

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={clsx(
                "bg-surface border border-border text-foreground placeholder-muted font-mono text-sm px-3 py-1 outline-none focus:border-foreground focus:ring-0 transition-colors",
                className
            )}
            {...props}
        />
    );
}

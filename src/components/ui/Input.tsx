import clsx from 'clsx';
import { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'>;

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={clsx(
                "bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 font-mono text-sm px-3 py-1 outline-none focus:border-white focus:ring-0 transition-colors",
                className
            )}
            {...props}
        />
    );
}

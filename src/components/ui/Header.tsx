import Link from 'next/link';
import { Input } from './Input';
import { useStore } from '@/lib/store';
import { useState } from 'react';

// We can use the global font var or import here if we want specific overrides.
// Using global font-serif class as per layout.

export function Header() {
    const { actions } = useStore();
    const [value, setValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && value.trim()) {
            actions.addKink(value.trim());
            setValue('');
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white bg-black px-4 py-3">
            <div className="flex items-center justify-between">
                <Link href="/" className="font-serif text-3xl font-bold tracking-tighter text-white uppercase antialiased">
                    Gripsession
                </Link>
                <div className="flex gap-4 items-center">
                    <Input
                        placeholder="ADD KINK..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-32 focus:w-48 text-xs uppercase"
                    />
                    <Link href="/favorites" className="font-mono text-sm uppercase text-gray-400 hover:text-white">
                        [SAVED]
                    </Link>
                </div>
            </div>
        </header>
    );
}

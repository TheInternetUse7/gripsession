'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Settings, Grip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AutoScroller } from '@/components/tools/auto-scroller';
import { SessionTimer } from '@/components/session-timer';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground md:flex-row">
      {/* Mobile Header */}
      <header className="glass-panel sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Grip className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Gripsession</span>
        </div>
        <SessionTimer />
      </header>

      {/* Desktop Sidebar (Optional/Future) - For MVP keeping it simple or reusing Nav */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card/50 p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Grip className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">Gripsession</span>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <SessionTimer />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 pb-24 md:pb-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="glass-panel fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 pb-safe pt-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 p-2 transition-colors',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn("h-6 w-6", pathname === item.href && "fill-current/20")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Auto-Scroller */}
      <AutoScroller />
    </div>
  );
}

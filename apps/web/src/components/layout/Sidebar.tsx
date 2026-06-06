'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TreePine,
  PlusCircle,
  BarChart2,
  Sprout,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/farms/new', label: 'Register Farm', icon: PlusCircle },
  { href: '/dashboard#canopy', label: 'Canopy Scans', icon: TreePine },
  { href: '/dashboard#usage', label: 'Usage', icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-screen bg-white border-r border-border flex flex-col">
      {/* Brand mark */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-700 rounded-md flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-green-900 leading-tight">FieldPulse</p>
            <p className="text-2xs text-muted leading-tight mt-0.5 uppercase tracking-wide">
              Extension Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href.replace('#', '/?'));
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                active
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-muted hover:bg-canvas hover:text-ink',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-2xs text-muted">Powered by WeatherAI</p>
        <p className="text-2xs text-muted mt-0.5">© 2026 FieldPulse</p>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OptimizedImage from './OptimizedImage';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Diet Plan', icon: '🍽️' },
    { href: '/workout', label: 'Workout Plan', icon: '💪' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
            <OptimizedImage
              src="/logo.png"
              alt="Diet4Me Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
              priority={true}
              sizes="(max-width: 640px) 20px, 40px"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Diet4Me</h1>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">AI-Powered Health Plans</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

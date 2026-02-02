import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Fish, Calendar, Bell, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Fish, label: 'My Pets', path: '/pets' },
        { icon: Calendar, label: 'Schedules', path: '/schedules' },
        { icon: BookOpen, label: 'Journal', path: '/journal' },
        { icon: Bell, label: 'Logs', path: '/logs' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/20 bg-apple-card/95 backdrop-blur-xl transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="flex h-full flex-col px-4 py-8">
                    {/* Header with close button on mobile */}
                    <div className="mb-10 flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-apple-blue to-cyan-400 text-white shadow-lg">
                                <Fish size={24} />
                            </div>
                            <div>
                                <h1 className="font-semibold text-lg tracking-tight text-apple-dark">Obi Reminder</h1>
                                <p className="text-xs text-gray-500">v1.0.0</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-apple-blue text-white shadow-md shadow-blue-500/20"
                                                : "text-gray-500 hover:bg-white/50 hover:text-apple-dark"
                                        )
                                    }
                                >
                                    <Icon size={20} className="transition-colors" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="mt-auto px-4">
                        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white shadow-lg">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs font-medium text-gray-300">System Online</span>
                            </div>
                            <p className="text-xs text-gray-400">All services running.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-apple-gray text-apple-dark selection:bg-apple-blue/20">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-apple-card/90 backdrop-blur-xl px-4 py-3 border-b border-white/20 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    <Menu size={24} className="text-apple-dark" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-apple-blue to-cyan-400 text-white">
                        <Fish size={18} />
                    </div>
                    <span className="font-semibold text-apple-dark">Obi Reminder</span>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
            </header>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:pl-64 transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 lg:pt-10 pb-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};


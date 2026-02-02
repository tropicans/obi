import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Fish, Calendar, Bell, BookOpen } from 'lucide-react';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Fish, label: 'My Pets', path: '/pets' },
        { icon: Calendar, label: 'Schedules', path: '/schedules' },
        { icon: BookOpen, label: 'Journal', path: '/journal' },
        { icon: Bell, label: 'Logs', path: '/logs' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/20 bg-apple-card/80 backdrop-blur-xl transition-transform">
            <div className="flex h-full flex-col px-4 py-8">
                <div className="mb-10 flex items-center gap-3 px-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-apple-blue to-cyan-400 text-white shadow-lg">
                        <Fish size={24} />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg tracking-tight text-apple-dark">Obi Reminder</h1>
                        <p className="text-xs text-gray-500">v1.0.0</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-apple-blue text-white shadow-md shadow-blue-500/20"
                                            : "text-gray-500 hover:bg-white/50 hover:text-apple-dark"
                                    )
                                }
                            >
                                <Icon size={20} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-apple-dark")} />
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
                        <p className="text-xs text-gray-400">All services running smoothly.</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export const Layout = () => {
    return (
        <div className="min-h-screen bg-apple-gray text-apple-dark selection:bg-apple-blue/20">
            <Sidebar />
            <main className="pl-64 transition-all duration-300">
                <div className="mx-auto max-w-7xl px-8 py-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

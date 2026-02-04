'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, ShoppingBag, Users, Settings,
    Plus, Menu, X, LogOut, Scissors
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'หน้าหลัก', color: 'from-violet-500 to-purple-600' },
    { href: '/orders', icon: ShoppingBag, label: 'ออเดอร์', color: 'from-pink-500 to-rose-600' },
    { href: '/members', icon: Users, label: 'สมาชิก', color: 'from-emerald-500 to-teal-600' },
    { href: '/tailors', icon: Scissors, label: 'ช่างตัด', color: 'from-blue-500 to-indigo-600' },
    { href: '/settings', icon: Settings, label: 'ตั้งค่า', color: 'from-gray-500 to-slate-600' },
];

export default function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { logout, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    // If not authenticated, the AuthContext will redirect to login
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 
                bg-gradient-to-b from-violet-900 via-purple-900 to-slate-900
                flex flex-col z-50 transition-transform duration-300 shadow-2xl
                lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="px-5 py-6 border-b border-white/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                ✨ Razaan
                            </h1>
                            <p className="text-xs text-purple-300">Dignity Among Women</p>
                        </div>
                        <button
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Quick Action & Logout */}
                <div className="p-4 border-t border-white/10 space-y-3">
                    <Link
                        href="/orders/new"
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-bold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg w-full justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        สร้างออเดอร์ใหม่
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2.5 text-purple-300 hover:bg-white/10 hover:text-white rounded-xl text-sm font-medium transition-all w-full justify-center"
                    >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 bg-white/70 backdrop-blur-lg border-b border-purple-100 px-4 lg:px-8 py-4 flex justify-between items-center z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 hover:bg-purple-100 rounded-xl text-purple-600"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{title}</h1>
                            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

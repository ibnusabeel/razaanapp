'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingBag, Users, Clock, CheckCircle2,
    Plus, ArrowRight, Wallet, Scissors,
    PackageCheck, Search, Bell
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStats(data.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <DashboardSkeleton />;

    return (
        <div className="min-h-screen pb-24">
            {/* Minimal Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Razaan Dashboard</h1>
                    <p className="text-xs text-slate-500">Overview</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-sm border-2 border-white shadow-sm">
                        A
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 pt-6 space-y-8">

                {/* 1. Main Stats (Revenue & Orders) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200">
                        <div className="flex items-center gap-2 mb-3 opacity-90">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-medium">ยอดขายเดือนนี้</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">฿{stats?.revenue.total.toLocaleString() ?? 0}</h2>
                        <div className="flex items-center gap-1 text-xs opacity-75">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>+12% จากเดือนก่อน</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                <ShoppingBag className="w-4 h-4" />
                                <span className="text-xs font-medium">ออเดอร์ทั้งหมด</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{stats?.orders.total ?? 0}</h2>
                        </div>
                        <Link href="/orders" className="text-xs font-medium text-violet-600 flex items-center gap-1 hover:gap-2 transition-all">
                            ดูรายการ <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 2. Quick Actions */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">เมนูลัด</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        <QuickAction
                            href="/orders/new"
                            icon={<Plus className="w-6 h-6" />}
                            label="สร้างออเดอร์"
                            bg="bg-violet-50 text-violet-600"
                        />
                        <QuickAction
                            href="/members"
                            icon={<Users className="w-6 h-6" />}
                            label="สมาชิก"
                            bg="bg-blue-50 text-blue-600"
                        />
                        <QuickAction
                            href="/orders?status=pending"
                            icon={<Clock className="w-6 h-6" />}
                            label="รอดำเนินการ"
                            bg="bg-amber-50 text-amber-600"
                        />
                        <QuickAction
                            href="/orders?status=ready_to_ship"
                            icon={<CheckCircle2 className="w-6 h-6" />}
                            label="พร้อมส่ง"
                            bg="bg-emerald-50 text-emerald-600"
                        />
                    </div>
                </div>

                {/* 3. Order Status Overview */}
                <div className="card p-0 overflow-hidden border-none shadow-md">
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">สถานะงาน</h3>
                    </div>
                    <div className="grid grid-cols-4 divide-x divide-slate-50">
                        <StatusItem icon="⏳" count={stats?.orders.pending ?? 0} label="รอ" color="text-amber-500" />
                        <StatusItem icon="✂️" count={stats?.orders.producing ?? 0} label="ผลิต" color="text-blue-500" />
                        <StatusItem icon="📦" count={stats?.orders.ready ?? 0} label="แพ็ค" color="text-pink-500" />
                        <StatusItem icon="✅" count={stats?.orders.completed ?? 0} label="เสร็จ" color="text-green-500" />
                    </div>
                </div>

                {/* 4. Recent Activity */}
                <div>
                    <div className="flex justify-between items-end mb-3">
                        <h3 className="text-sm font-semibold text-slate-800">ล่าสุด</h3>
                        <Link href="/orders" className="text-xs text-slate-400 hover:text-violet-600">ดูทั้งหมด</Link>
                    </div>
                    <div className="space-y-3">
                        {stats?.recentOrders.length > 0 ? (
                            stats.recentOrders.map((order: any) => (
                                <RecentOrderCard key={order._id} order={order} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                                ไม่มีรายการใหม่
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex justify-around py-2 z-50 safe-area-bottom">
                <NavItem href="/dashboard" icon={<Wallet className="w-5 h-5" />} label="หน้าหลัก" active />
                <NavItem href="/orders" icon={<ShoppingBag className="w-5 h-5" />} label="ออเดอร์" />
                <div className="w-12"></div> {/* Spacer for FAB */}
                <NavItem href="/members" icon={<Users className="w-5 h-5" />} label="ลูกค้า" />
                <NavItem href="/settings" icon={<Scissors className="w-5 h-5" />} label="ตั้งค่า" />

                {/* FAB */}
                <Link href="/orders/new" className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-300 hover:scale-105 transition-transform">
                    <Plus className="w-7 h-7" />
                </Link>
            </nav>
        </div>
    );
}

function QuickAction({ href, icon, label, bg }: any) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 min-w-[80px]">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center shadow-sm`}>
                {icon}
            </div>
            <span className="text-xs font-medium text-slate-600">{label}</span>
        </Link>
    );
}

function StatusItem({ icon, count, label, color }: any) {
    return (
        <div className="flex flex-col items-center py-4 hover:bg-slate-50 transition-colors">
            <span className="text-xl mb-1">{icon}</span>
            <span className={`text-lg font-bold ${color}`}>{count}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
        </div>
    );
}

function RecentOrderCard({ order }: any) {
    const statusText: any = {
        pending: 'รอ', confirmed: 'ยืนยัน', producing: 'ผลิต',
        ready_to_ship: 'พร้อมส่ง', completed: 'สำเร็จ'
    };
    const statusColor: any = {
        pending: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-blue-100 text-blue-700',
        producing: 'bg-violet-100 text-violet-700',
        ready_to_ship: 'bg-emerald-100 text-emerald-700',
        completed: 'bg-slate-100 text-slate-700'
    };

    return (
        <Link href={`/orders/${order._id}`} className="block bg-white p-4 rounded-xl border border-slate-50 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                    👗
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{order.customerName}</h4>
                    <p className="text-xs text-slate-500">{order.dressName}</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusColor[order.status] || 'bg-gray-100'}`}>
                    {statusText[order.status] || order.status}
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-1">฿{order.price?.toLocaleString()}</p>
            </div>
        </Link>
    );
}

function NavItem({ href, icon, label, active }: any) {
    return (
        <Link href={href} className={`flex flex-col items-center p-2 ${active ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {icon}
            <span className="text-[10px] mt-1 font-medium">{label}</span>
        </Link>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen p-6 space-y-6">
            <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
            </div>
            <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="space-y-3">
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
            </div>
        </div>
    );
}

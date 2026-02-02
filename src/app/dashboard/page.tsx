'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Package, Users, Clock, Truck, CheckCircle,
    Plus, TrendingUp, Loader2, ChevronRight,
    Wallet, CreditCard
} from 'lucide-react';

interface DashboardStats {
    orders: {
        total: number;
        today: number;
        pending: number;
        producing: number;
        ready: number;
        completed: number;
    };
    members: {
        total: number;
    };
    revenue: {
        total: number;
        deposit: number;
        balance: number;
    };
    recentOrders: any[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-green-50">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 pb-24">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-4 pt-8 pb-16 rounded-b-3xl shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold">Razaan Dashboard</h1>
                    <p className="text-purple-200 text-sm mt-1">ระบบจัดการคำสั่งซื้อ</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 -mt-10">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <StatCard
                        icon={<Package className="w-5 h-5" />}
                        label="วันนี้"
                        value={stats?.orders.today || 0}
                        color="purple"
                    />
                    <StatCard
                        icon={<Clock className="w-5 h-5" />}
                        label="รอดำเนินการ"
                        value={stats?.orders.pending || 0}
                        color="yellow"
                    />
                    <StatCard
                        icon={<Truck className="w-5 h-5" />}
                        label="กำลังผลิต"
                        value={stats?.orders.producing || 0}
                        color="blue"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        label="พร้อมส่ง"
                        value={stats?.orders.ready || 0}
                        color="green"
                    />
                </div>

                {/* Revenue Card */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            รายได้
                        </h2>
                        <span className="text-xs text-gray-500">ทั้งหมด</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {stats?.revenue.total.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ยอดรวม (฿)</p>
                        </div>
                        <div className="text-center border-x border-gray-100">
                            <p className="text-2xl font-bold text-green-600">
                                {stats?.revenue.deposit.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">มัดจำแล้ว (฿)</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-500">
                                {stats?.revenue.balance.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">คงค้าง (฿)</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link
                        href="/orders/new"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">เพิ่มออเดอร์</p>
                            <p className="text-xs text-purple-200">สร้างใหม่</p>
                        </div>
                    </Link>
                    <Link
                        href="/members"
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">สมาชิก</p>
                            <p className="text-xs text-green-200">{stats?.members.total || 0} คน</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">รายการล่าสุด</h2>
                        <Link href="/orders" className="text-sm text-purple-600 flex items-center gap-1">
                            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {stats?.recentOrders.map((order: any) => (
                            <Link
                                key={order._id}
                                href={`/orders/${order._id}`}
                                className="flex items-center justify-between p-4 hover:bg-purple-50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{order.customerName}</p>
                                    <p className="text-sm text-gray-500 truncate">{order.dressName}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-semibold text-purple-600">{order.price?.toLocaleString()}฿</p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </Link>
                        ))}
                        {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                            <div className="p-8 text-center text-gray-400">
                                ยังไม่มีรายการ
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colorMap: Record<string, string> = {
        purple: 'from-purple-500 to-purple-600',
        yellow: 'from-yellow-500 to-orange-500',
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorMap[color]} text-white flex items-center justify-center mb-2`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: 'รอ', color: 'bg-yellow-100 text-yellow-700' },
        confirmed: { label: 'ยืนยัน', color: 'bg-blue-100 text-blue-700' },
        producing: { label: 'ตัด', color: 'bg-purple-100 text-purple-700' },
        qc: { label: 'QC', color: 'bg-pink-100 text-pink-700' },
        packing: { label: 'แพ็ค', color: 'bg-orange-100 text-orange-700' },
        ready_to_ship: { label: 'พร้อมส่ง', color: 'bg-green-100 text-green-700' },
        completed: { label: 'เสร็จ', color: 'bg-gray-100 text-gray-700' },
        cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-700' },
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>
            {info.label}
        </span>
    );
}

// Bottom Navigation Component
function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-around h-16">
                <Link href="/dashboard" className="flex flex-col items-center text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs mt-1">หน้าหลัก</span>
                </Link>
                <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-purple-600">
                    <Package className="w-5 h-5" />
                    <span className="text-xs mt-1">ออเดอร์</span>
                </Link>
                <Link
                    href="/orders/new"
                    className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full text-white shadow-lg border-4 border-white"
                >
                    <Plus className="w-7 h-7" />
                </Link>
                <Link href="/members" className="flex flex-col items-center text-gray-400 hover:text-purple-600">
                    <Users className="w-5 h-5" />
                    <span className="text-xs mt-1">สมาชิก</span>
                </Link>
                <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-purple-600">
                    <Wallet className="w-5 h-5" />
                    <span className="text-xs mt-1">รายการ</span>
                </Link>
            </div>
        </nav>
    );
}

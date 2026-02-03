'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import {
    ShoppingBag, Clock, CheckCircle, TrendingUp, ChevronRight, Sparkles
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
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <AdminLayout title="แดชบอร์ด" subtitle="ภาพรวมการขายและออเดอร์">
            {isLoading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="ยอดขายเดือนนี้"
                            value={`฿${stats?.revenue?.total?.toLocaleString() || 0}`}
                            icon={<TrendingUp className="w-6 h-6" />}
                            trend="+12%"
                            gradient="from-violet-500 to-purple-600"
                        />
                        <StatCard
                            title="ออเดอร์ทั้งหมด"
                            value={stats?.orders?.total || 0}
                            icon={<ShoppingBag className="w-6 h-6" />}
                            gradient="from-pink-500 to-rose-600"
                        />
                        <StatCard
                            title="รอดำเนินการ"
                            value={stats?.orders?.pending || 0}
                            icon={<Clock className="w-6 h-6" />}
                            gradient="from-amber-500 to-orange-600"
                        />
                        <StatCard
                            title="เสร็จแล้ว"
                            value={stats?.orders?.completed || 0}
                            icon={<CheckCircle className="w-6 h-6" />}
                            gradient="from-emerald-500 to-teal-600"
                        />
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Orders */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-purple-50">
                            <div className="px-5 py-4 border-b border-purple-50 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    ออเดอร์ล่าสุด
                                </h2>
                                <Link href="/orders" className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium">
                                    ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="divide-y divide-purple-50">
                                {stats?.recentOrders?.length > 0 ? (
                                    stats.recentOrders.map((order: any) => (
                                        <OrderRow key={order._id} order={order} />
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400">
                                        ยังไม่มีออเดอร์
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Overview */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-purple-50">
                            <div className="px-5 py-4 border-b border-purple-50 bg-gradient-to-r from-emerald-50 to-teal-50">
                                <h2 className="font-bold text-slate-800">สถานะงาน</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <StatusRow icon="⏳" label="รอดำเนินการ" count={stats?.orders?.pending || 0} color="bg-gradient-to-r from-amber-500 to-orange-500" />
                                <StatusRow icon="✂️" label="กำลังผลิต" count={stats?.orders?.producing || 0} color="bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <StatusRow icon="📦" label="พร้อมส่ง" count={stats?.orders?.ready || 0} color="bg-gradient-to-r from-pink-500 to-rose-500" />
                                <StatusRow icon="✅" label="เสร็จสิ้น" count={stats?.orders?.completed || 0} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

function StatCard({ title, value, icon, trend, gradient }: any) {
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 lg:p-5 text-white shadow-lg`}>
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold">{value}</h3>
            <p className="text-sm text-white/80 mt-1">{title}</p>
        </div>
    );
}

function OrderRow({ order }: any) {
    const statusColors: any = {
        pending: 'bg-gradient-to-r from-amber-400 to-orange-500',
        confirmed: 'bg-gradient-to-r from-blue-400 to-indigo-500',
        producing: 'bg-gradient-to-r from-violet-400 to-purple-500',
        ready_to_ship: 'bg-gradient-to-r from-emerald-400 to-teal-500',
        completed: 'bg-gradient-to-r from-slate-400 to-gray-500',
    };
    const statusLabels: any = {
        pending: 'รอ', confirmed: 'ยืนยัน', producing: 'ผลิต',
        ready_to_ship: 'พร้อม', completed: 'เสร็จ',
    };

    return (
        <Link
            href={`/orders/${order._id}`}
            className="px-5 py-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center text-xl">
                    👗
                </div>
                <div>
                    <p className="font-semibold text-slate-800">{order.customerName}</p>
                    <p className="text-sm text-slate-500">{order.dressName}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full text-white font-medium ${statusColors[order.status] || 'bg-gray-400'}`}>
                    {statusLabels[order.status] || order.status}
                </span>
                <span className="font-bold text-slate-700 hidden sm:block">฿{order.price?.toLocaleString()}</span>
            </div>
        </Link>
    );
}

function StatusRow({ icon, label, count, color }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-slate-700 font-medium">{label}</span>
            </div>
            <span className={`text-sm font-bold text-white px-4 py-1.5 rounded-full ${color}`}>
                {count}
            </span>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl animate-pulse" />
                <div className="h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl animate-pulse" />
            </div>
        </div>
    );
}

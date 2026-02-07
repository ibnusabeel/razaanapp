'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    User, Scissors, ArrowLeft, Loader2, Package, Clock,
    CheckCircle, Truck, Settings, Phone, Star
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Tailor {
    _id: string;
    lineUserId: string;
    displayName: string;
    realName: string;
    phone?: string;
    specialty?: string;
    isActive: boolean;
    pictureUrl?: string;
    createdAt: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    dressName: string;
    tailorStatus?: string;
    tailorAssignedAt?: string;
    color?: string;
    size?: string;
}

interface Stats {
    total: number;
    pending: number;
    inProgress: number;
    done: number;
    delivered: number;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const statusLabels: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: 'รอดำเนินการ', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock className="w-4 h-4" /> },
    cutting: { label: 'กำลังตัดผ้า', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Scissors className="w-4 h-4" /> },
    sewing: { label: 'กำลังเย็บ', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Settings className="w-4 h-4" /> },
    finishing: { label: 'เก็บงาน', color: 'text-pink-600', bg: 'bg-pink-100', icon: <Star className="w-4 h-4" /> },
    done: { label: 'เสร็จแล้ว', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
    delivered: { label: 'ส่งมอบแล้ว', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: <Truck className="w-4 h-4" /> },
};

export default function TailorDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [tailor, setTailor] = useState<Tailor | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchTailor();
    }, [id]);

    const fetchTailor = async () => {
        try {
            const res = await fetch(`/api/tailors/${id}`);
            const data = await res.json();
            if (data.success) {
                setTailor(data.data.tailor);
                setOrders(data.data.orders);
                setStats(data.data.stats);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="กำลังโหลด..." subtitle="">
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!tailor) {
        return (
            <AdminLayout title="ไม่พบช่าง" subtitle="">
                <div className="text-center py-20">
                    <Scissors className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">ไม่พบข้อมูลช่าง</p>
                    <Link href="/tailors" className="text-blue-600 hover:underline mt-2 inline-block">
                        กลับไปหน้ารายการช่าง
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    // Filter orders
    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => {
            if (filter === 'inProgress') return ['cutting', 'sewing', 'finishing'].includes(o.tailorStatus || '');
            return o.tailorStatus === filter;
        });

    return (
        <AdminLayout
            title={tailor.realName || tailor.displayName}
            subtitle={tailor.specialty || 'ช่างตัด'}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Link href="/tailors" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
                    <ArrowLeft className="w-4 h-4" /> กลับไปรายการช่าง
                </Link>

                {/* Tailor Info Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                {tailor.pictureUrl ? (
                                    <img src={tailor.pictureUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Scissors className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <div className="text-white flex-1">
                                <h2 className="text-xl font-bold">{tailor.realName}</h2>
                                <p className="text-white/80">@{tailor.displayName || 'LINE User'}</p>
                                {tailor.specialty && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        🎯 {tailor.specialty}
                                    </span>
                                )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${tailor.isActive ? 'bg-green-400 text-white' : 'bg-slate-400 text-white'
                                }`}>
                                {tailor.isActive ? '✓ ใช้งาน' : 'ปิดใช้งาน'}
                            </div>
                        </div>
                    </div>
                    {tailor.phone && (
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <span>{tailor.phone}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <StatCard
                            label="ทั้งหมด"
                            value={stats.total}
                            color="bg-slate-100 text-slate-700"
                            onClick={() => setFilter('all')}
                            active={filter === 'all'}
                        />
                        <StatCard
                            label="รอดำเนินการ"
                            value={stats.pending}
                            color="bg-yellow-100 text-yellow-700"
                            onClick={() => setFilter('pending')}
                            active={filter === 'pending'}
                        />
                        <StatCard
                            label="กำลังทำ"
                            value={stats.inProgress}
                            color="bg-blue-100 text-blue-700"
                            onClick={() => setFilter('inProgress')}
                            active={filter === 'inProgress'}
                        />
                        <StatCard
                            label="เสร็จแล้ว"
                            value={stats.done}
                            color="bg-green-100 text-green-700"
                            onClick={() => setFilter('done')}
                            active={filter === 'done'}
                        />
                        <StatCard
                            label="ส่งมอบ"
                            value={stats.delivered}
                            color="bg-emerald-100 text-emerald-700"
                            onClick={() => setFilter('delivered')}
                            active={filter === 'delivered'}
                        />
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            งานทั้งหมด ({filteredOrders.length})
                        </h3>
                    </div>
                    {filteredOrders.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => {
                                const status = statusLabels[order.tailorStatus || 'pending'] || statusLabels.pending;
                                const date = order.tailorAssignedAt
                                    ? new Date(order.tailorAssignedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                                    : '-';
                                return (
                                    <Link
                                        key={order._id}
                                        href={`/orders/${order._id}`}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{order.dressName}</p>
                                            <p className="text-sm text-slate-500">
                                                {order.orderNumber} • {order.customerName}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {order.color && `🎨 ${order.color}`} {order.size && `📏 ${order.size}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">{date}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                            <p>ไม่มีงานในหมวดนี้</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, color, onClick, active }: {
    label: string;
    value: number;
    color: string;
    onClick: () => void;
    active: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl text-center transition-all ${color} ${active ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'hover:scale-105'
                }`}
        >
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs">{label}</p>
        </button>
    );
}

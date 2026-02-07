'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Scissors, Loader2, Package, Clock, CheckCircle, Truck,
    Settings, Star, RefreshCw, User
} from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    dressName: string;
    tailorStatus?: string;
    tailorAssignedAt?: string;
    color?: string;
    size?: string;
    measurements?: {
        shoulder: number;
        chest: number;
        waist: number;
        hips: number;
        totalLength: number;
    };
}

const statusLabels: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: 'รอดำเนินการ', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock className="w-4 h-4" /> },
    cutting: { label: 'กำลังตัดผ้า', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Scissors className="w-4 h-4" /> },
    sewing: { label: 'กำลังเย็บ', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Settings className="w-4 h-4" /> },
    finishing: { label: 'เก็บงาน', color: 'text-pink-600', bg: 'bg-pink-100', icon: <Star className="w-4 h-4" /> },
    done: { label: 'เสร็จแล้ว', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
    delivered: { label: 'ส่งมอบแล้ว', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: <Truck className="w-4 h-4" /> },
};

export default function TailorMyJobsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'active' | 'done'>('active');

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            // This endpoint will need to identify the tailor by LINE login
            const res = await fetch('/api/tailor/my-jobs');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            } else {
                setError(data.error || 'ไม่สามารถโหลดข้อมูลได้');
            }
        } catch {
            setError('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const activeOrders = orders.filter(o => !['done', 'delivered'].includes(o.tailorStatus || ''));
    const completedOrders = orders.filter(o => ['done', 'delivered'].includes(o.tailorStatus || ''));
    const displayedOrders = filter === 'active' ? activeOrders : completedOrders;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-6 shadow-lg">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Scissors className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">งานของฉัน</h1>
                                <p className="text-white/80 text-sm">{orders.length} งานทั้งหมด</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchMyJobs}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setFilter('active')}
                        className={`p-4 rounded-2xl text-center transition-all ${filter === 'active'
                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                            : 'bg-white text-slate-600'
                            }`}
                    >
                        <p className="text-3xl font-bold">{activeOrders.length}</p>
                        <p className="text-sm">กำลังทำ</p>
                    </button>
                    <button
                        onClick={() => setFilter('done')}
                        className={`p-4 rounded-2xl text-center transition-all ${filter === 'done'
                            ? 'bg-green-500 text-white shadow-lg scale-105'
                            : 'bg-white text-slate-600'
                            }`}
                    >
                        <p className="text-3xl font-bold">{completedOrders.length}</p>
                        <p className="text-sm">เสร็จแล้ว</p>
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-600 p-4 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Orders List */}
                {displayedOrders.length > 0 ? (
                    <div className="space-y-3">
                        {displayedOrders.map((order) => {
                            const status = statusLabels[order.tailorStatus || 'pending'] || statusLabels.pending;
                            const measurements = (order.measurements || {}) as any;
                            const measureText = [
                                measurements.shoulder && `ไหล่ ${measurements.shoulder}"`,
                                measurements.chest && `อก ${measurements.chest}"`,
                                measurements.waist && `เอว ${measurements.waist}"`,
                                measurements.hips && `สะโพก ${measurements.hips}"`,
                            ].filter(Boolean).join(' • ');

                            return (
                                <Link
                                    key={order._id}
                                    href={`/tailor/orders/${order._id}`}
                                    className="bg-white rounded-2xl shadow-lg p-4 block hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-lg">{order.dressName}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <User className="w-4 h-4" />
                                                {order.customerName}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {order.orderNumber}
                                                {order.color && ` • 🎨 ${order.color}`}
                                                {order.size && ` • 📏 ${order.size}`}
                                            </p>
                                            {measureText && (
                                                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-2 inline-block">
                                                    📐 {measureText}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">
                            {filter === 'active' ? 'ไม่มีงานที่กำลังทำ' : 'ยังไม่มีงานที่เสร็จ'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

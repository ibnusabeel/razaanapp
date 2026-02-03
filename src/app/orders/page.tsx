'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Plus, Filter, ChevronLeft, ChevronRight,
    MoreHorizontal, Calendar, User, Package
} from 'lucide-react';

interface Order {
    _id: string;
    customerName: string;
    phone: string;
    orderDate: string;
    dressName: string;
    price: number;
    status: string;
}

const TABS = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'pending', label: 'รอ' },
    { id: 'producing', label: 'กำลังผลิต' },
    { id: 'ready_to_ship', label: 'พร้อมส่ง' }, // status=packing,ready_to_ship
    { id: 'completed', label: 'เสร็จสิ้น' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '10');
            if (search) params.set('search', search);

            if (activeTab !== 'all') {
                if (activeTab === 'ready_to_ship') params.set('status', 'packing,ready_to_ship');
                else params.set('status', activeTab);
            }

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setOrders(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, activeTab]);

    useEffect(() => {
        // Debounce search
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchOrders]);

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold text-slate-800">Orders</h1>
                    <Link href="/orders/new" className="btn-primary py-2 px-3 text-sm">
                        <Plus className="w-4 h-4" /> สร้างใหม่
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, เบอร์โทร, ชื่อชุด..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10 py-2.5 text-sm rounded-xl"
                    />
                </div>

                {/* Tags */}
                <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar -mx-4 px-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}
                    </div>
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <Link
                            key={order._id}
                            href={`/orders/${order._id}`}
                            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform block"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
                                        {order.customerName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-sm">{order.customerName}</h3>
                                        <span className="text-[10px] text-slate-400 block">{new Date(order.orderDate).toLocaleDateString('th-TH')}</span>
                                    </div>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                                        <Package className="w-3 h-3" /> {order.dressName}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <User className="w-3 h-3" /> {order.phone}
                                    </p>
                                </div>
                                <span className="font-bold text-violet-600">฿{order.price.toLocaleString()}</span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>ไม่พบรายการคำสั่งซื้อ</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 py-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 rounded-full border hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="self-center text-sm font-medium text-slate-600">{page} / {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 rounded-full border hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: any = {
        pending: { label: 'รอ', color: 'bg-amber-100 text-amber-700' },
        confirmed: { label: 'ยืนยัน', color: 'bg-blue-100 text-blue-700' },
        producing: { label: 'ตัดเย็บ', color: 'bg-violet-100 text-violet-700' },
        qc: { label: 'QC', color: 'bg-pink-100 text-pink-700' },
        packing: { label: 'แพ็ค', color: 'bg-orange-100 text-orange-700' },
        ready_to_ship: { label: 'พร้อมส่ง', color: 'bg-emerald-100 text-emerald-700' },
        completed: { label: 'เสร็จสิ้น', color: 'bg-slate-100 text-slate-600' },
        cancelled: { label: 'ยกเลิก', color: 'bg-red-50 text-red-500' }
    };
    const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-500' };

    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.color}`}>
            {s.label}
        </span>
    );
}

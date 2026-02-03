'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, Trash2, Search } from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    orderDate: string;
    dressName: string;
    color: string;
    size: string;
    price: number;
    deposit: number;
    balance: number;
    status: string;
}

const TABS = [
    { id: 'all', label: 'ทั้งหมด', color: 'from-violet-500 to-purple-600' },
    { id: 'pending', label: 'รอดำเนินการ', color: 'from-amber-500 to-orange-500' },
    { id: 'producing', label: 'กำลังผลิต', color: 'from-blue-500 to-indigo-500' },
    { id: 'ready_to_ship', label: 'พร้อมส่ง', color: 'from-emerald-500 to-teal-500' },
    { id: 'completed', label: 'เสร็จสิ้น', color: 'from-slate-500 to-gray-600' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '15');
            if (search) params.set('search', search);
            if (activeTab !== 'all') params.set('status', activeTab);

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setOrders(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotal(data.pagination.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, activeTab]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchOrders(), 300);
        return () => clearTimeout(timeout);
    }, [fetchOrders]);

    const handleDelete = async (id: string) => {
        if (!confirm('ลบออเดอร์นี้?')) return;
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        fetchOrders();
    };

    const statusColors: any = {
        pending: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
        confirmed: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
        producing: 'bg-gradient-to-r from-violet-400 to-purple-500 text-white',
        qc: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
        packing: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
        ready_to_ship: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white',
        completed: 'bg-gradient-to-r from-slate-400 to-gray-500 text-white',
        cancelled: 'bg-gradient-to-r from-red-400 to-rose-500 text-white',
    };
    const statusLabels: any = {
        pending: 'รอ', confirmed: 'ยืนยัน', producing: 'ผลิต',
        qc: 'QC', packing: 'แพ็ค', ready_to_ship: 'พร้อม', completed: 'เสร็จ', cancelled: 'ยกเลิก'
    };

    return (
        <AdminLayout
            title="ออเดอร์"
            subtitle={`ทั้งหมด ${total} รายการ`}
            actions={
                <Link
                    href="/orders/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-bold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">สร้างใหม่</span>
                </Link>
            }
        >
            {/* Search */}
            <div className="mb-4">
                <div className="relative w-full lg:w-80">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-purple-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setPage(1); }}
                        className={`px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all shadow-sm ${activeTab === tab.id
                                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                : 'bg-white text-slate-600 border-2 border-purple-100 hover:border-purple-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-purple-50">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                            <tr className="text-left text-xs text-purple-600 uppercase tracking-wider">
                                <th className="px-5 py-4 font-bold">เลขที่</th>
                                <th className="px-5 py-4 font-bold">ลูกค้า</th>
                                <th className="px-5 py-4 font-bold">รายการ</th>
                                <th className="px-5 py-4 font-bold">สถานะ</th>
                                <th className="px-5 py-4 font-bold text-right">ราคา</th>
                                <th className="px-5 py-4 font-bold text-right">คงเหลือ</th>
                                <th className="px-5 py-4 font-bold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-5 py-4">
                                            <div className="h-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-purple-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <Link href={`/orders/${order._id}`} className="text-sm font-bold text-purple-600 hover:underline">
                                                {order.orderNumber || order._id.slice(-6).toUpperCase()}
                                            </Link>
                                            <p className="text-xs text-slate-400">{new Date(order.orderDate).toLocaleDateString('th-TH')}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-800">{order.customerName}</p>
                                            <p className="text-xs text-slate-400">{order.phone}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-slate-800">{order.dressName}</p>
                                            <p className="text-xs text-slate-400">{order.color} {order.size && `• ${order.size}`}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                                            ฿{order.price?.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className={`text-sm font-bold ${order.balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                ฿{order.balance?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <Link href={`/orders/${order._id}`} className="p-2 hover:bg-purple-100 rounded-lg text-purple-400 hover:text-purple-600">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(order._id)} className="p-2 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                        ไม่พบออเดอร์
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-purple-50">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-4">
                                <div className="h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl animate-pulse" />
                            </div>
                        ))
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <Link key={order._id} href={`/orders/${order._id}`} className="block p-4 hover:bg-purple-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-slate-800">{order.customerName}</p>
                                        <p className="text-xs text-purple-500 font-medium">{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                                        {statusLabels[order.status] || order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">👗 {order.dressName} • {order.color}</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">฿{order.price?.toLocaleString()}</span>
                                    <span className={`font-bold ${order.balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        ค้าง ฿{order.balance?.toLocaleString()}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            ไม่พบออเดอร์
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
                    <span>หน้า {page} จาก {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border-2 border-purple-100 rounded-xl hover:bg-purple-50 disabled:opacity-50 shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5 text-purple-500" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border-2 border-purple-100 rounded-xl hover:bg-purple-50 disabled:opacity-50 shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5 text-purple-500" />
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

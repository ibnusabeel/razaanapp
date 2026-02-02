'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, Loader2, Plus, TrendingUp, Users, Wallet, Clock, Truck, CheckCircle } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import OrderCard from '@/components/OrderCard';

// Interface สำหรับ Order
interface Order {
    _id: string;
    customerName: string;
    phone: string;
    orderDate: string;
    dressName: string;
    color: string;
    size: string;
    price: number;
    deposit: number;
    balance: number;
    points: 'give' | 'no';
    status?: string;
    measurements?: {
        shoulder?: number;
        chest?: number;
        waist?: number;
        armhole?: number;
        sleeveLength?: number;
        wrist?: number;
        upperArm?: number;
        hips?: number;
        totalLength?: number;
    };
    deliveryAddress?: string;
    notes?: string;
    createdAt: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const STATUS_TABS = [
    { key: 'all', label: 'ทั้งหมด', icon: Package },
    { key: 'pending', label: 'รอ', icon: Clock },
    { key: 'producing', label: 'ผลิต', icon: Truck },
    { key: 'ready', label: 'พร้อมส่ง', icon: CheckCircle },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // ดึงข้อมูล Orders
    const fetchOrders = useCallback(async (search: string = '', page: number = 1, statusFilter: string = 'all') => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (statusFilter !== 'all') {
                // Map 'ready' to multiple statuses
                if (statusFilter === 'ready') {
                    params.set('status', 'packing,ready_to_ship');
                } else if (statusFilter === 'producing') {
                    params.set('status', 'confirmed,producing,qc');
                } else {
                    params.set('status', statusFilter);
                }
            }
            params.set('page', page.toString());
            params.set('limit', '20');

            const response = await fetch(`/api/orders?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setOrders(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // โหลดข้อมูลครั้งแรก
    useEffect(() => {
        fetchOrders('', 1, activeTab);
    }, [fetchOrders, activeTab]);

    // Handle search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        fetchOrders(query, 1, activeTab);
    }, [fetchOrders, activeTab]);

    // Handle delete
    const handleDelete = useCallback((id: string) => {
        setOrders(prev => prev.filter(order => order._id !== id));
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
    }, []);

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 pb-24">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-4 pt-8 pb-6 rounded-b-3xl shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">ออเดอร์</h1>
                            <p className="text-purple-200 text-sm">รายการสั่งตัดทั้งหมด</p>
                        </div>
                        <Link
                            href="/orders/new"
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">เพิ่มใหม่</span>
                        </Link>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                        {STATUS_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                                            ? 'bg-white text-purple-700 shadow-lg'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar onSearch={handleSearch} />
                </div>

                {/* Stats */}
                {pagination && (
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                        <span>
                            พบ <span className="font-semibold text-purple-600">{pagination.total}</span> รายการ
                        </span>
                        {searchQuery && (
                            <span>
                                ค้นหา: &quot;{searchQuery}&quot;
                            </span>
                        )}
                    </div>
                )}

                {/* Orders List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <div key={order._id} style={{ animationDelay: `${index * 0.05}s` }}>
                                <OrderCard order={order} onDelete={handleDelete} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {searchQuery ? 'ไม่พบคำสั่งซื้อที่ค้นหา' : 'ยังไม่มีคำสั่งซื้อ'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นสร้างคำสั่งซื้อใหม่เลย!'}
                        </p>
                        {!searchQuery && (
                            <Link href="/orders/new" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium">
                                <Plus className="w-4 h-4" />
                                สร้างคำสั่งซื้อใหม่
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => fetchOrders(searchQuery, page, activeTab)}
                                className={`w-10 h-10 rounded-full font-medium transition-all ${page === pagination.page
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-purple-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav active="orders" />
        </div>
    );
}

// Bottom Navigation Component
function BottomNav({ active = '' }: { active?: string }) {
    const linkClass = (name: string) =>
        `flex flex-col items-center ${active === name ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-around h-16">
                <Link href="/dashboard" className={linkClass('dashboard')}>
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs mt-1">หน้าหลัก</span>
                </Link>
                <Link href="/orders" className={linkClass('orders')}>
                    <Package className="w-5 h-5" />
                    <span className="text-xs mt-1">ออเดอร์</span>
                </Link>
                <Link
                    href="/orders/new"
                    className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full text-white shadow-lg border-4 border-white"
                >
                    <Plus className="w-7 h-7" />
                </Link>
                <Link href="/members" className={linkClass('members')}>
                    <Users className="w-5 h-5" />
                    <span className="text-xs mt-1">สมาชิก</span>
                </Link>
                <Link href="/orders" className={linkClass('wallet')}>
                    <Wallet className="w-5 h-5" />
                    <span className="text-xs mt-1">รายการ</span>
                </Link>
            </div>
        </nav>
    );
}

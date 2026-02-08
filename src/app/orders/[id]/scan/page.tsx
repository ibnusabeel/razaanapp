'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Loader2, Package, CheckCircle, ScanLine, ArrowLeft, Home } from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    dressName: string;
    color: string;
    size: string;
    status: string;
    tailorStatus?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'รอยืนยัน', color: 'bg-yellow-500' },
    confirmed: { label: 'ยืนยันแล้ว', color: 'bg-blue-500' },
    producing: { label: 'กำลังผลิต', color: 'bg-purple-500' },
    qc: { label: 'ตรวจสอบ', color: 'bg-pink-500' },
    packing: { label: 'แพ็ค', color: 'bg-orange-500' },
    ready_to_ship: { label: 'พร้อมส่ง', color: 'bg-cyan-500' },
    completed: { label: 'เสร็จสิ้น', color: 'bg-green-500' },
    cancelled: { label: 'ยกเลิก', color: 'bg-red-500' },
};

const tailorStatusLabels: Record<string, string> = {
    pending: '⏳ รอดำเนินการ',
    cutting: '✂️ กำลังตัดผ้า',
    sewing: '🧵 กำลังเย็บ',
    finishing: '✨ เก็บงาน',
    done: '✅ เสร็จแล้ว',
    delivered: '📦 ส่งมอบแล้ว',
};

export default function ScanOrderPage({ params }: PageProps) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            } else {
                setError('ไม่พบออเดอร์');
            }
        } catch {
            setError('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">ไม่พบออเดอร์</h1>
                    <p className="text-slate-500 mb-6">{error || 'ออเดอร์นี้ไม่มีในระบบ'}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
                    >
                        <Home className="w-5 h-5" />
                        กลับหน้าหลัก
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusLabels[order.status] || { label: order.status, color: 'bg-gray-500' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
            <div className="max-w-md mx-auto">
                {/* Success Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 mb-1">พบออเดอร์!</h1>
                        <p className="text-emerald-600 font-bold text-lg">{order.orderNumber}</p>
                    </div>
                </div>

                {/* Order Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Package className="w-6 h-6 text-blue-500" />
                        <h2 className="font-bold text-slate-800">รายละเอียดออเดอร์</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500">ชื่อชุด</span>
                            <span className="font-bold text-slate-800">{order.dressName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500">สี</span>
                            <span className="text-slate-700">{order.color}</span>
                        </div>
                        {order.size && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500">ไซส์</span>
                                <span className="text-slate-700">{order.size}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500">ลูกค้า</span>
                            <span className="text-slate-700">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500">โทร</span>
                            <a href={`tel:${order.phone}`} className="text-blue-600 underline">{order.phone}</a>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-2">สถานะปัจจุบัน</p>
                        <span className={`inline-block px-4 py-2 ${status.color} text-white rounded-full font-bold`}>
                            {status.label}
                        </span>
                        {order.tailorStatus && (
                            <p className="mt-3 text-slate-600">
                                {tailorStatusLabels[order.tailorStatus] || order.tailorStatus}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href={`/orders/${id}`}
                        className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
                    >
                        <Package className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-slate-700">ดูรายละเอียด</span>
                    </Link>
                    <Link
                        href={`/orders/${id}/print`}
                        className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
                    >
                        <ScanLine className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                        <span className="text-sm font-medium text-slate-700">พิมพ์ใบงาน</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

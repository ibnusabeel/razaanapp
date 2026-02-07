'use client';

import { useState, useEffect, use } from 'react';
import { Scissors, User, Package, Ruler, FileText, Check, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    orderNumber?: string;
    customerName: string;
    dressName: string;
    color: string;
    size: string;
    tailorStatus?: string;
    tailorNotes?: string;
    notes?: string;
    measurements: {
        shoulder: number;
        chest: number;
        waist: number;
        armhole: number;
        sleeveLength: number;
        wrist: number;
        upperArm: number;
        hips: number;
        totalLength: number;
    };
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const statusOptions = [
    { value: 'pending', label: 'รอดำเนินการ', icon: '⏳', color: 'bg-gray-100 text-gray-600 border-gray-300' },
    { value: 'cutting', label: 'กำลังตัดผ้า', icon: '✂️', color: 'bg-blue-100 text-blue-600 border-blue-300' },
    { value: 'sewing', label: 'กำลังเย็บ', icon: '🧵', color: 'bg-purple-100 text-purple-600 border-purple-300' },
    { value: 'finishing', label: 'เก็บงาน/ตกแต่ง', icon: '✨', color: 'bg-pink-100 text-pink-600 border-pink-300' },
    { value: 'done', label: 'เสร็จแล้ว', icon: '✅', color: 'bg-green-100 text-green-600 border-green-300' },
    { value: 'delivered', label: 'ส่งมอบแล้ว', icon: '📦', color: 'bg-emerald-100 text-emerald-600 border-emerald-300' },
];

export default function TailorOrderPage({ params }: PageProps) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [notes, setNotes] = useState('');
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
                setSelectedStatus(data.data.tailorStatus || 'pending');
                setNotes(data.data.tailorNotes || '');
            } else {
                setError('ไม่พบออเดอร์นี้');
            }
        } catch {
            setError('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}/tailor-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tailorStatus: selectedStatus,
                    tailorNotes: notes,
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('อัปเดตสถานะสำเร็จ!');
                fetchOrder();
            } else {
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            alert('เกิดข้อผิดพลาด');
        } finally {
            setUpdating(false);
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <Scissors className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h1 className="text-xl font-bold text-slate-800 mb-2">ไม่พบออเดอร์</h1>
                    <p className="text-slate-500">{error || 'ออเดอร์นี้อาจถูกลบไปแล้ว'}</p>
                </div>
            </div>
        );
    }

    const currentStatus = statusOptions.find(s => s.value === order.tailorStatus) || statusOptions[0];
    const measurements = order.measurements || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-6 shadow-lg">
                <div className="max-w-lg mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3">
                        <ArrowLeft className="w-4 h-4" /> กลับ
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Scissors className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{order.orderNumber || 'งานตัดชุด'}</h1>
                            <p className="text-white/80 text-sm">{order.dressName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
                {/* Current Status */}
                <div className="bg-white rounded-2xl shadow-lg p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">สถานะปัจจุบัน</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${currentStatus.color}`}>
                            {currentStatus.icon} {currentStatus.label}
                        </span>
                    </div>
                </div>

                {/* Customer & Product Info */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <User className="w-4 h-4" /> ข้อมูลลูกค้าและชุด
                        </h2>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500">ลูกค้า</span>
                            <span className="font-bold text-slate-800">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">ชื่อชุด</span>
                            <span className="font-bold text-slate-800">{order.dressName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">สี / ไซส์</span>
                            <span className="font-medium text-slate-700">{order.color || '-'} / {order.size || '-'}</span>
                        </div>
                        {order.notes && (
                            <div className="mt-3 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                                <strong>⚠️ หมายเหตุ:</strong> {order.notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Measurements */}
                {Object.values(measurements).some(v => v > 0) && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-3">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> สัดส่วน (นิ้ว)
                            </h2>
                        </div>
                        <div className="p-5 grid grid-cols-3 gap-3">
                            {measurements.shoulder > 0 && <MeasureItem label="ไหล่" value={measurements.shoulder} />}
                            {measurements.chest > 0 && <MeasureItem label="อก" value={measurements.chest} />}
                            {measurements.waist > 0 && <MeasureItem label="เอว" value={measurements.waist} />}
                            {measurements.hips > 0 && <MeasureItem label="สะโพก" value={measurements.hips} />}
                            {measurements.armhole > 0 && <MeasureItem label="วงแขน" value={measurements.armhole} />}
                            {measurements.sleeveLength > 0 && <MeasureItem label="แขนยาว" value={measurements.sleeveLength} />}
                            {measurements.wrist > 0 && <MeasureItem label="ข้อมือ" value={measurements.wrist} />}
                            {measurements.upperArm > 0 && <MeasureItem label="ต้นแขน" value={measurements.upperArm} />}
                            {measurements.totalLength > 0 && <MeasureItem label="ความยาว" value={measurements.totalLength} />}
                        </div>
                    </div>
                )}

                {/* Update Status */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <Package className="w-4 h-4" /> อัปเดตสถานะ
                        </h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Status Selector */}
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => setSelectedStatus(status.value)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedStatus === status.value
                                            ? `${status.color} border-current ring-2 ring-offset-2 ring-current`
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <span className="text-lg">{status.icon}</span>
                                    <span className="block mt-1">{status.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-1" />
                                บันทึกช่าง (ถ้ามี)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="เช่น ต้องแก้ไขขนาด, รอผ้าเพิ่ม..."
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={updateStatus}
                            disabled={updating}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 shadow-lg"
                        >
                            {updating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Check className="w-5 h-5" />
                            )}
                            {updating ? 'กำลังอัปเดต...' : 'บันทึกสถานะ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MeasureItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-600">{label}</p>
            <p className="font-bold text-slate-800 text-lg">{value}</p>
        </div>
    );
}

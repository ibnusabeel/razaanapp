'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    User, Phone, MapPin, Package, Edit, Trash2, Scissors,
    ArrowLeft, Loader2, X, Save, ShoppingBag, Calendar,
    MessageCircle
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Member {
    _id: string;
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    realName: string;
    phone: string;
    address?: string;
    role: string;
    isActive?: boolean;
    specialty?: string;
    measurements?: {
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
    createdAt: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    dressName: string;
    status: string;
    price: number;
    orderDate: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'รอยืนยัน', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-700' },
    producing: { label: 'กำลังผลิต', color: 'bg-purple-100 text-purple-700' },
    qc: { label: 'ตรวจสอบ', color: 'bg-pink-100 text-pink-700' },
    ready_to_ship: { label: 'พร้อมส่ง', color: 'bg-orange-100 text-orange-700' },
    completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-700' },
};

export default function MemberDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [member, setMember] = useState<Member | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [editForm, setEditForm] = useState({ realName: '', phone: '', address: '' });
    const [specialty, setSpecialty] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            const res = await fetch(`/api/members/${id}`);
            const data = await res.json();
            if (data.success) {
                setMember(data.data.member);
                setOrders(data.data.orders);
                setEditForm({
                    realName: data.data.member.realName || '',
                    phone: data.data.member.phone || '',
                    address: data.data.member.address || '',
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (data.success) {
                setMember(data.data);
                setShowEditModal(false);
                alert('อัปเดตสำเร็จ!');
            } else {
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            alert('เกิดข้อผิดพลาด');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('ต้องการลบสมาชิกนี้หรือไม่? ข้อมูลจะถูกลบถาวร')) return;

        try {
            const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert('ลบสมาชิกสำเร็จ');
                window.location.href = '/members';
            } else {
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handlePromote = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/members/${id}/promote-tailor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ specialty }),
            });
            const data = await res.json();
            if (data.success) {
                setShowPromoteModal(false);
                alert('เลื่อนเป็นช่างตัดสำเร็จ!');
                fetchMember();
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
            <AdminLayout title="กำลังโหลด..." subtitle="">
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!member) {
        return (
            <AdminLayout title="ไม่พบสมาชิก" subtitle="">
                <div className="text-center py-20">
                    <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">ไม่พบข้อมูลสมาชิก</p>
                    <Link href="/members" className="text-emerald-600 hover:underline mt-2 inline-block">
                        กลับไปหน้ารายการสมาชิก
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    const memberDate = new Date(member.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <AdminLayout
            title={member.realName || member.displayName}
            subtitle={`สมาชิกตั้งแต่ ${memberDate}`}
            actions={
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    {member.role !== 'tailor' && (
                        <button
                            onClick={() => setShowPromoteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700"
                        >
                            <Scissors className="w-4 h-4" />
                            <span className="hidden sm:inline">ตั้งเป็นช่าง</span>
                        </button>
                    )}
                </div>
            }
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Link href="/members" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
                    <ArrowLeft className="w-4 h-4" /> กลับไปรายการสมาชิก
                </Link>

                {/* Member Info Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                {member.pictureUrl ? (
                                    <img src={member.pictureUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <div className="text-white">
                                <h2 className="text-xl font-bold">{member.realName}</h2>
                                <p className="text-white/80 flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    @{member.displayName || 'LINE User'}
                                </p>
                                {member.role === 'tailor' && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        <Scissors className="w-3 h-3" /> ช่างตัด
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Phone className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-slate-400">เบอร์โทร</p>
                                <p className="font-medium text-slate-800">{member.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-slate-400">ที่อยู่</p>
                                <p className="font-medium text-slate-800">{member.address || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Package className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-slate-400">จำนวนออเดอร์</p>
                                <p className="font-medium text-slate-800">{orders.length} รายการ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-slate-400">สมัครเมื่อ</p>
                                <p className="font-medium text-slate-800">{memberDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Measurements (if available) */}
                {member.measurements && Object.values(member.measurements).some(v => v > 0) && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                            <h3 className="text-white font-bold">📐 สัดส่วน (นิ้ว)</h3>
                        </div>
                        <div className="p-6 grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {member.measurements.shoulder > 0 && <MeasureItem label="ไหล่" value={member.measurements.shoulder} />}
                            {member.measurements.chest > 0 && <MeasureItem label="อก" value={member.measurements.chest} />}
                            {member.measurements.waist > 0 && <MeasureItem label="เอว" value={member.measurements.waist} />}
                            {member.measurements.hips > 0 && <MeasureItem label="สะโพก" value={member.measurements.hips} />}
                            {member.measurements.armhole > 0 && <MeasureItem label="วงแขน" value={member.measurements.armhole} />}
                            {member.measurements.sleeveLength > 0 && <MeasureItem label="แขนยาว" value={member.measurements.sleeveLength} />}
                            {member.measurements.wrist > 0 && <MeasureItem label="ข้อมือ" value={member.measurements.wrist} />}
                            {member.measurements.upperArm > 0 && <MeasureItem label="ต้นแขน" value={member.measurements.upperArm} />}
                            {member.measurements.totalLength > 0 && <MeasureItem label="ความยาว" value={member.measurements.totalLength} />}
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            ประวัติออเดอร์ ({orders.length})
                        </h3>
                    </div>
                    {orders.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {orders.map((order) => {
                                const status = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
                                const date = new Date(order.orderDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
                                return (
                                    <Link
                                        key={order._id}
                                        href={`/orders/${order._id}`}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800">{order.dressName}</p>
                                            <p className="text-sm text-slate-500">{order.orderNumber} • {date}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <p className="text-sm font-bold text-slate-700 mt-1">฿{order.price?.toLocaleString()}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                            <p>ยังไม่มีออเดอร์</p>
                        </div>
                    )}
                </div>

                {/* Delete Button */}
                <div className="text-center">
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        ลบสมาชิก
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Edit className="w-5 h-5" /> แก้ไขข้อมูล
                            </h2>
                            <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อจริง</label>
                                <input
                                    type="text"
                                    value={editForm.realName}
                                    onChange={(e) => setEditForm({ ...editForm, realName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                                <textarea
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Promote to Tailor Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Scissors className="w-5 h-5" /> ตั้งเป็นช่างตัด
                            </h2>
                            <button onClick={() => setShowPromoteModal(false)} className="text-white/80 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-600">
                                ต้องการตั้ง <strong>{member.realName}</strong> เป็นช่างตัดหรือไม่?
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ความชำนาญ (ไม่บังคับ)</label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    placeholder="เช่น ชุดเจ้าสาว, อาบายะ"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPromoteModal(false)}
                                    className="flex-1 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handlePromote}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, Phone, User, Calendar, Package, ChevronDown, ChevronUp } from 'lucide-react';

// Interface สำหรับข้อมูล Order
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

interface OrderCardProps {
    order: Order;
    onDelete: (id: string) => void;
}

export default function OrderCard({ order, onDelete }: OrderCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // จัดรูปแบบวันที่
    const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // Handle delete
    const handleDelete = async () => {
        if (!confirm('ต้องการลบคำสั่งซื้อนี้หรือไม่?')) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/orders/${order._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onDelete(order._id);
                router.refresh();
            } else {
                alert('เกิดข้อผิดพลาดในการลบ');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="card animate-fade-in hover:scale-[1.01]">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-lg">
                        <Package className="w-5 h-5" />
                        {order.dressName}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {order.customerName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.phone}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/orders/${order._id}/edit`}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-t border-b border-gray-100">
                <div>
                    <span className="text-xs text-gray-500">สี</span>
                    <p className="font-medium">{order.color}</p>
                </div>
                <div>
                    <span className="text-xs text-gray-500">ไซส์</span>
                    <p className="font-medium">{order.size || '-'}</p>
                </div>
                <div>
                    <span className="text-xs text-gray-500">ราคา</span>
                    <p className="font-medium text-purple-600">{order.price?.toLocaleString()} ฿</p>
                </div>
                <div>
                    <span className="text-xs text-gray-500">คงเหลือ</span>
                    <p className={`font-medium ${order.balance > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                        {order.balance?.toLocaleString()} ฿
                    </p>
                </div>
            </div>

            {/* Expandable Section */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center w-full py-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
                {isExpanded ? (
                    <>
                        <ChevronUp className="w-4 h-4 mr-1" /> ซ่อนรายละเอียด
                    </>
                ) : (
                    <>
                        <ChevronDown className="w-4 h-4 mr-1" /> ดูรายละเอียด
                    </>
                )}
            </button>

            {isExpanded && (
                <div className="pt-3 border-t border-gray-100 animate-fade-in">
                    {/* Measurements */}
                    {order.measurements && (
                        <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">สัดส่วน</h4>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                {order.measurements.shoulder && (
                                    <span>ไหล่: {order.measurements.shoulder}</span>
                                )}
                                {order.measurements.chest && (
                                    <span>รอบอก: {order.measurements.chest}</span>
                                )}
                                {order.measurements.waist && (
                                    <span>เอว: {order.measurements.waist}</span>
                                )}
                                {order.measurements.hips && (
                                    <span>สะโพก: {order.measurements.hips}</span>
                                )}
                                {order.measurements.sleeveLength && (
                                    <span>ยาวแขน: {order.measurements.sleeveLength}</span>
                                )}
                                {order.measurements.totalLength && (
                                    <span>ความยาวชุด: {order.measurements.totalLength}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {order.notes && (
                            <div>
                                <span className="text-gray-500">หมายเหตุ:</span>
                                <p className="text-gray-700">{order.notes}</p>
                            </div>
                        )}
                        {order.deliveryAddress && (
                            <div>
                                <span className="text-gray-500">ที่อยู่จัดส่ง:</span>
                                <p className="text-gray-700">{order.deliveryAddress}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            สั่งเมื่อ: {orderDate}
                        </span>
                        <span>
                            แต้ม: {order.points === 'give' ? '✅ ให้' : '❌ ไม่ให้'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

import { notFound } from 'next/navigation';
import { Calendar, Package, Phone, User, MapPin, FileText, Ruler, CheckCircle, ShieldCheck, Clock, Truck, XCircle } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

// ดึงข้อมูล Order จาก Database
async function getOrder(id: string) {
    try {
        await connectDB();
        const order = await Order.findById(id).lean();
        return order;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

export default async function TrackingPage({ params }: PageProps) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    // จัดรูปแบบวันที่
    const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden relative">
                {/* Security Badge Background */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck className="w-32 h-32 text-purple-600" />
                </div>

                {/* Header */}
                <div className="bg-purple-700 text-white p-6 text-center relative z-10">
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold mb-1">ใบเสร็จรับเงินอิเล็กทรอนิกส์</h1>
                    <p className="text-purple-100 text-sm">Razaan - Dignity Among Women</p>
                    <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                            {order.status === 'pending' && <Clock className="w-3 h-3" />}
                            {order.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                            {order.status === 'producing' && <Truck className="w-3 h-3" />}
                            {order.status === 'qc' && <ShieldCheck className="w-3 h-3" />}
                            {order.status === 'packing' && <Package className="w-3 h-3" />}
                            {order.status === 'ready_to_ship' && <CheckCircle className="w-3 h-3" />}
                            {order.status === 'completed' && <Package className="w-3 h-3" />}
                            {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}

                            {order.status === 'pending' && 'รอรับชุด'}
                            {order.status === 'confirmed' && 'ยืนยันแล้ว'}
                            {order.status === 'producing' && 'กำลังตัด'}
                            {order.status === 'qc' && 'QC'}
                            {order.status === 'packing' && 'แพ็คของ'}
                            {order.status === 'ready_to_ship' && 'พร้อมส่ง'}
                            {order.status === 'completed' && 'ส่งมอบแล้ว'}
                            {order.status === 'cancelled' && 'ยกเลิก'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 relative z-10">
                    <div className="text-center mb-6 pb-6 border-b border-dashed border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">หมายเลขคำสั่งซื้อ</p>
                        <p className="text-lg font-mono font-medium text-gray-800">{id}</p>
                        <p className="text-xs text-gray-400 mt-2">{orderDate}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            ข้อมูลลูกค้า
                        </h3>
                        <div className="bg-purple-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">ชื่อ</span>
                                <span className="font-medium text-gray-900">{order.customerName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">เบอร์โทร</span>
                                <span className="font-medium text-gray-900">{order.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" />
                            รายการสั่งตัด
                        </h3>
                        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{order.dressName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">สี: {order.color} | ไซส์: {order.size || '-'}</p>
                                </div>
                            </div>

                            {/* Measurements Summary */}
                            {order.measurements && Object.values(order.measurements).some(v => v > 0) && (
                                <div className="pt-2 mt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                        <Ruler className="w-3 h-3" /> สัดส่วน
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        {order.measurements.shoulder > 0 && <span>ไหล่: {order.measurements.shoulder}</span>}
                                        {order.measurements.chest > 0 && <span>อก: {order.measurements.chest}</span>}
                                        {order.measurements.waist > 0 && <span>เอว: {order.measurements.waist}</span>}
                                        {order.measurements.hips > 0 && <span>สะโพก: {order.measurements.hips}</span>}
                                        {order.measurements.totalLength > 0 && <span>ยาว: {order.measurements.totalLength}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-900 text-white rounded-xl p-6 shadow-xl mb-6">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                            <span className="text-sm text-gray-300">ราคารวม</span>
                            <span className="text-lg font-bold">{order.price?.toLocaleString()} ฿</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">ชำระแล้ว (มัดจำ)</span>
                                <span className="text-green-400 font-medium">-{order.deposit?.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-medium text-white">ยอดคงเหลือ</span>
                                <span className={`text-xl font-bold ${order.balance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                    {order.balance?.toLocaleString()} ฿
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            ขอบคุณที่ไว้วางใจ Razaan
                        </p>
                        <p className="text-[10px] text-gray-300 mt-1">
                            เอกสารนี้ถูกสร้างขึ้นโดยระบบอัตโนมัติ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

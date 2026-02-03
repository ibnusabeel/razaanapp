import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: Props) {
    const { id } = await params;

    await connectDB();
    const order = await Order.findById(id).lean();

    if (!order) {
        notFound();
    }

    const statusMap: Record<string, { label: string; color: string; bg: string; icon: string }> = {
        pending: { label: 'รอดำเนินการ', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
        confirmed: { label: 'ยืนยันแล้ว', color: '#10B981', bg: '#D1FAE5', icon: '✅' },
        producing: { label: 'กำลังตัดเย็บ', color: '#3B82F6', bg: '#DBEAFE', icon: '✂️' },
        qc: { label: 'ตรวจสอบคุณภาพ', color: '#8B5CF6', bg: '#EDE9FE', icon: '🔍' },
        packing: { label: 'กำลังแพ็ค', color: '#EC4899', bg: '#FCE7F3', icon: '📦' },
        ready_to_ship: { label: 'พร้อมรับ/ส่ง', color: '#F97316', bg: '#FFEDD5', icon: '🛍️' },
        completed: { label: 'ส่งมอบแล้ว', color: '#6B7280', bg: '#F3F4F6', icon: '🎉' },
        cancelled: { label: 'ยกเลิก', color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
    };

    const status = statusMap[order.status as string] || { label: order.status, color: '#666', bg: '#f3f4f6', icon: '📋' };
    const orderDate = new Date(order.orderDate as Date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-violet-600 to-purple-700 text-white text-center py-8 px-4">
                <h1 className="text-2xl font-bold tracking-wide">✨ RAZAAN</h1>
                <p className="text-violet-200 text-sm mt-1">Dignity Among Women</p>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 -mt-4">
                {/* Receipt Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Order Number */}
                    <div className="bg-emerald-500 text-white text-center py-4">
                        <p className="text-xs opacity-80">เลขที่ออเดอร์</p>
                        <p className="text-2xl font-bold tracking-wider">{order.orderNumber || 'N/A'}</p>
                    </div>

                    {/* Status */}
                    <div className="p-6 border-b border-slate-100">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: status.bg, color: status.color }}
                        >
                            <span className="text-lg">{status.icon}</span>
                            {status.label}
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="p-6 border-b border-slate-100">
                        <p className="text-xs text-violet-500 font-semibold mb-1">👤 ลูกค้า</p>
                        <p className="text-lg font-bold text-slate-800">{order.customerName}</p>
                    </div>

                    {/* Product Details */}
                    <div className="p-6 bg-violet-50 border-b border-slate-100">
                        <p className="text-xs text-violet-500 font-semibold mb-2">👗 รายละเอียดชุด</p>
                        <p className="text-xl font-bold text-slate-800 mb-2">{order.dressName}</p>
                        <div className="flex gap-4 text-sm text-slate-600">
                            <span>🎨 สี: {order.color || '-'}</span>
                            <span>📏 ไซส์: {order.size || '-'}</span>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="p-6 space-y-3">
                        <p className="text-xs text-amber-500 font-semibold">💰 สรุปยอดชำระ</p>

                        <div className="flex justify-between text-slate-600">
                            <span>ราคาเต็ม</span>
                            <span>{(order.price as number)?.toLocaleString()} ฿</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-medium">
                            <span>มัดจำแล้ว</span>
                            <span>-{(order.deposit as number)?.toLocaleString()} ฿</span>
                        </div>
                        <hr className="border-slate-200" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">ยอดคงเหลือ</span>
                            <span className="text-2xl font-bold text-red-500">{(order.balance as number)?.toLocaleString()} ฿</span>
                        </div>
                    </div>

                    {/* Order Date */}
                    <div className="bg-slate-50 text-center py-4 text-sm text-slate-500">
                        📅 วันที่สั่ง: {orderDate}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-slate-400 text-sm">
                    <p>ขอบคุณที่ใช้บริการ Razaan ค่ะ 💜</p>
                    <p className="mt-1">หากมีคำถามติดต่อ LINE: @razaan</p>
                </div>
            </main>
        </div>
    );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, MapPin, FileText, Ruler, Palette, Tag, CreditCard, Edit } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import StatusSelector from '@/components/StatusSelector';
import AdminLayout from '@/components/AdminLayout';

interface PageProps {
    params: Promise<{ id: string }>;
}

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

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <AdminLayout
            title={order.orderNumber || `#${id.slice(-6).toUpperCase()}`}
            subtitle={`${order.customerName} • ${orderDate}`}
            actions={
                <div className="flex items-center gap-3">
                    <StatusSelector orderId={id} currentStatus={order.status || 'pending'} />
                    <Link
                        href={`/orders/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-violet-600 hover:to-purple-700 shadow-lg"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">แก้ไข</span>
                    </Link>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Customer Info */}
                <Section title="ข้อมูลลูกค้า" color="from-violet-500 to-purple-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="ชื่อ" value={order.customerName} />
                        <InfoItem label="เบอร์โทร" value={order.phone} icon={<Phone className="w-3 h-3" />} />
                    </div>
                </Section>

                {/* Product Info */}
                <Section title="รายละเอียดสินค้า" color="from-pink-500 to-rose-600">
                    <InfoItem label="ชื่อชุด" value={order.dressName} large />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        <InfoItem label="สี" value={order.color || '-'} icon={<Palette className="w-3 h-3" />} />
                        <InfoItem label="ไซส์" value={order.size || '-'} />
                        <InfoItem label="แต้ม" value={order.points === 'give' ? '✅ ให้แต้ม' : '❌ ไม่ให้'} />
                    </div>
                </Section>

                {/* Payment */}
                <Section title="การชำระเงิน" color="from-emerald-500 to-teal-600">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">ราคาเต็ม</p>
                            <p className="text-xl font-bold text-slate-700">฿{order.price?.toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center">
                            <p className="text-xs text-emerald-600 mb-1">มัดจำแล้ว</p>
                            <p className="text-xl font-bold text-emerald-600">฿{order.deposit?.toLocaleString()}</p>
                        </div>
                        <div className={`rounded-xl p-4 text-center ${order.balance > 0 ? 'bg-gradient-to-br from-rose-50 to-pink-50' : 'bg-gradient-to-br from-emerald-50 to-green-50'}`}>
                            <p className={`text-xs mb-1 ${order.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>คงเหลือ</p>
                            <p className={`text-xl font-bold ${order.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                ฿{order.balance?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Measurements */}
                {order.measurements && Object.values(order.measurements).some((v: any) => v > 0) && (
                    <Section title="สัดส่วน (นิ้ว)" color="from-blue-500 to-indigo-600">
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {order.measurements.shoulder > 0 && <MeasureItem label="ไหล่" value={order.measurements.shoulder} />}
                            {order.measurements.chest > 0 && <MeasureItem label="อก" value={order.measurements.chest} />}
                            {order.measurements.waist > 0 && <MeasureItem label="เอว" value={order.measurements.waist} />}
                            {order.measurements.hips > 0 && <MeasureItem label="สะโพก" value={order.measurements.hips} />}
                            {order.measurements.armhole > 0 && <MeasureItem label="วงแขน" value={order.measurements.armhole} />}
                            {order.measurements.sleeveLength > 0 && <MeasureItem label="แขนยาว" value={order.measurements.sleeveLength} />}
                            {order.measurements.wrist > 0 && <MeasureItem label="ข้อมือ" value={order.measurements.wrist} />}
                            {order.measurements.upperArm > 0 && <MeasureItem label="ต้นแขน" value={order.measurements.upperArm} />}
                            {order.measurements.totalLength > 0 && <MeasureItem label="ความยาว" value={order.measurements.totalLength} />}
                        </div>
                    </Section>
                )}

                {/* Notes & Delivery */}
                {(order.notes || order.deliveryAddress) && (
                    <Section title="หมายเหตุและการจัดส่ง" color="from-amber-500 to-orange-600">
                        {order.notes && <InfoItem label="หมายเหตุ" value={order.notes} />}
                        {order.deliveryAddress && (
                            <div className="mt-3">
                                <InfoItem label="ที่อยู่จัดส่ง" value={order.deliveryAddress} icon={<MapPin className="w-3 h-3" />} />
                            </div>
                        )}
                    </Section>
                )}
            </div>
        </AdminLayout>
    );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-purple-50">
            <div className={`px-5 py-3 bg-gradient-to-r ${color} flex items-center gap-2`}>
                <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon, large }: { label: string; value: string; icon?: React.ReactNode; large?: boolean }) {
    return (
        <div>
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                {icon} {label}
            </p>
            <p className={`text-slate-800 ${large ? 'text-lg font-bold' : 'font-medium'}`}>{value}</p>
        </div>
    );
}

function MeasureItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
            <p className="text-xs text-blue-600">{label}</p>
            <p className="font-bold text-slate-800 text-lg">{value}</p>
        </div>
    );
}

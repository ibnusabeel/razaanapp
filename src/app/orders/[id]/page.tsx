import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Package, Phone, User, MapPin, FileText, Ruler } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Status Badge Component
import StatusSelector from '@/components/StatusSelector';

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

export default async function OrderSummaryPage({ params }: PageProps) {
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
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-6 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-purple-700">รายละเอียด</h1>
                            <StatusSelector orderId={id} currentStatus={order.status || 'pending'} />
                        </div>
                        <p className="text-sm text-gray-500">Razaan - Dignity Among Women</p>
                    </div>
                </div>

                {/* Order ID */}
                <div className="card text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Order ID</h2>
                    <p className="text-sm text-gray-500 font-mono bg-gray-100 px-4 py-2 rounded-lg inline-block">{id}</p>
                </div>

                {/* Customer Info */}
                <div className="card mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        ข้อมูลลูกค้า
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-500">ชื่อลูกค้า</span>
                            <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> เบอร์ติดต่อ
                            </span>
                            <p className="font-medium">{order.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Order Info */}
                <div className="card mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        ข้อมูลคำสั่งซื้อ
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> วันที่สั่ง
                            </span>
                            <p className="font-medium">{orderDate}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">ชื่อชุด</span>
                            <p className="font-medium">{order.dressName}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <span className="text-xs text-gray-500">สี</span>
                            <p className="font-medium">{order.color}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">ไซส์</span>
                            <p className="font-medium">{order.size || '-'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">แต้ม</span>
                            <p className="font-medium">{order.points === 'give' ? '✅ ให้' : '❌ ไม่ให้'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <span className="text-xs text-gray-500">ราคา</span>
                            <p className="font-bold text-purple-600">{order.price?.toLocaleString()} ฿</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">มัดจำ</span>
                            <p className="font-medium text-green-600">{order.deposit?.toLocaleString()} ฿</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">คงเหลือ</span>
                            <p className={`font-bold ${order.balance > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                {order.balance?.toLocaleString()} ฿
                            </p>
                        </div>
                    </div>
                </div>

                {/* Measurements */}
                {order.measurements && Object.values(order.measurements).some((v: any) => v > 0) && (
                    <div className="card mb-4">
                        <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                            <Ruler className="w-5 h-5" />
                            สัดส่วน
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            {order.measurements.shoulder > 0 && (
                                <div><span className="text-gray-500">ไหล่:</span> {order.measurements.shoulder}</div>
                            )}
                            {order.measurements.chest > 0 && (
                                <div><span className="text-gray-500">รอบอก:</span> {order.measurements.chest}</div>
                            )}
                            {order.measurements.waist > 0 && (
                                <div><span className="text-gray-500">เอว:</span> {order.measurements.waist}</div>
                            )}
                            {order.measurements.armhole > 0 && (
                                <div><span className="text-gray-500">วงแขน:</span> {order.measurements.armhole}</div>
                            )}
                            {order.measurements.sleeveLength > 0 && (
                                <div><span className="text-gray-500">ยาวแขน:</span> {order.measurements.sleeveLength}</div>
                            )}
                            {order.measurements.wrist > 0 && (
                                <div><span className="text-gray-500">รอบข้อมือ:</span> {order.measurements.wrist}</div>
                            )}
                            {order.measurements.upperArm > 0 && (
                                <div><span className="text-gray-500">ต้นแขน:</span> {order.measurements.upperArm}</div>
                            )}
                            {order.measurements.hips > 0 && (
                                <div><span className="text-gray-500">สะโพก:</span> {order.measurements.hips}</div>
                            )}
                            {order.measurements.totalLength > 0 && (
                                <div><span className="text-gray-500">ความยาวชุด:</span> {order.measurements.totalLength}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes & Delivery */}
                {(order.notes || order.deliveryAddress) && (
                    <div className="card mb-4">
                        {order.notes && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    หมายเหตุ
                                </h3>
                                <p className="text-gray-600">{order.notes}</p>
                            </div>
                        )}
                        {order.deliveryAddress && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    ที่อยู่จัดส่ง
                                </h3>
                                <p className="text-gray-600">{order.deliveryAddress}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Link href="/orders" className="btn-outline">
                        กลับหน้ารายการ
                    </Link>
                    <Link href={`/orders/${id}/edit`} className="btn-primary">
                        แก้ไขข้อมูล
                    </Link>
                </div>
            </div>
        </div>
    );
}

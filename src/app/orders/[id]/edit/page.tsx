import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderForm from '@/components/OrderForm';

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

export const metadata = {
    title: 'แก้ไขคำสั่งซื้อ | Razaan',
    description: 'แก้ไขคำสั่งซื้อ - Razaan Order Management System',
};

export default async function EditOrderPage({ params }: PageProps) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    // แปลงข้อมูลให้เข้ากับ form
    const initialData = {
        customerName: order.customerName || '',
        phone: order.phone || '',
        orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
        dressName: order.dressName || '',
        color: order.color || '',
        size: order.size || '',
        price: order.price || '',
        deposit: order.deposit || '',
        points: order.points || 'no',
        measurements: {
            shoulder: order.measurements?.shoulder || '',
            chest: order.measurements?.chest || '',
            waist: order.measurements?.waist || '',
            armhole: order.measurements?.armhole || '',
            sleeveLength: order.measurements?.sleeveLength || '',
            wrist: order.measurements?.wrist || '',
            upperArm: order.measurements?.upperArm || '',
            hips: order.measurements?.hips || '',
            totalLength: order.measurements?.totalLength || '',
        },
        deliveryAddress: order.deliveryAddress || '',
        notes: order.notes || '',
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-6 px-4">
            <OrderForm initialData={initialData} orderId={id} isEdit />
        </div>
    );
}

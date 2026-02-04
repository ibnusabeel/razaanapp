import OrderForm from '@/components/OrderForm';
import AdminLayout from '@/components/AdminLayout';

export const metadata = {
    title: 'สร้างออเดอร์ใหม่ | Razaan',
    description: 'สร้างคำสั่งซื้อชุดใหม่ - Razaan Order Management System',
};

export default function NewOrderPage() {
    return (
        <AdminLayout
            title="สร้างออเดอร์ใหม่"
            subtitle="กรอกข้อมูลลูกค้าและรายละเอียดชุด"
        >
            <div className="max-w-3xl mx-auto">
                <OrderForm />
            </div>
        </AdminLayout>
    );
}

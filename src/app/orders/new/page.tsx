import OrderForm from '@/components/OrderForm';

export const metadata = {
    title: 'สร้างคำสั่งซื้อใหม่ | Razaan',
    description: 'สร้างคำสั่งซื้อชุดใหม่ - Razaan Order Management System',
};

export default function NewOrderPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-6 px-4">
            <OrderForm />
        </div>
    );
}

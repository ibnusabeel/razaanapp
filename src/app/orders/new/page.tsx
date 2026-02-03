import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrderForm from '@/components/OrderForm';

export const metadata = {
    title: 'สร้างออเดอร์ใหม่ | Razaan',
    description: 'สร้างคำสั่งซื้อชุดใหม่ - Razaan Order Management System',
};

export default function NewOrderPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="sticky top-0 bg-white/70 backdrop-blur-lg border-b border-purple-100 px-4 lg:px-8 py-4 z-30 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Link href="/orders" className="p-2 hover:bg-purple-100 rounded-xl text-purple-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">สร้างออเดอร์ใหม่</h1>
                        <p className="text-xs text-slate-500">กรอกข้อมูลลูกค้าและรายละเอียดชุด</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 lg:p-8">
                <OrderForm />
            </main>
        </div>
    );
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendTailorJobNotification } from '@/lib/line';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/assign-tailor
 * มอบหมายงานให้ช่างตัด
 */
export async function POST(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;
        const { tailorId } = await request.json();

        // ค้นหา Order
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ success: false, error: 'ไม่พบออเดอร์' }, { status: 404 });
        }

        // ค้นหาช่าง
        const tailor = await User.findById(tailorId);
        if (!tailor || tailor.role !== 'tailor') {
            return NextResponse.json({ success: false, error: 'ไม่พบช่างตัด' }, { status: 404 });
        }

        // มอบหมายงาน
        order.tailorId = tailorId;
        order.tailorStatus = 'pending';
        order.tailorAssignedAt = new Date();
        order.tailorNotes = '';

        // อัปเดตสถานะเป็น producing ถ้ายังไม่ถึง
        if (['pending', 'confirmed'].includes(order.status)) {
            order.status = 'producing';
        }

        await order.save();

        // ส่ง LINE แจ้งช่าง
        if (tailor.lineUserId) {
            await sendTailorJobNotification(tailor.lineUserId, order);
        }

        return NextResponse.json({
            success: true,
            data: order,
            message: `มอบหมายงานให้ ${tailor.realName} สำเร็จ`
        });
    } catch (error) {
        console.error('Error assigning tailor:', error);
        return NextResponse.json({ success: false, error: 'Failed to assign tailor' }, { status: 500 });
    }
}

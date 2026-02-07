import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendTailorStatusUpdate } from '@/lib/line';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * PUT /api/orders/[id]/tailor-status
 * ช่างหรือ Admin อัปเดตสถานะงานช่าง
 */
export async function PUT(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // รับทั้ง status และ tailorStatus
        const status = body.tailorStatus || body.status;
        const notes = body.tailorNotes || body.notes;

        const order = await Order.findById(id).populate('tailorId');
        if (!order) {
            return NextResponse.json({ success: false, error: 'ไม่พบออเดอร์' }, { status: 404 });
        }

        // ตรวจสอบว่าเป็นช่างที่รับงานนี้หรือไม่ (ถ้ามี lineUserId)
        // ถ้าไม่ส่ง lineUserId มา = Admin ทำแทน (bypass check)
        if (body.lineUserId && order.tailorId) {
            const tailor = order.tailorId as any;
            if (tailor.lineUserId !== body.lineUserId) {
                return NextResponse.json({ success: false, error: 'คุณไม่ใช่ช่างที่รับงานนี้' }, { status: 403 });
            }
        }

        // อัปเดตสถานะ
        const validStatuses = ['pending', 'cutting', 'sewing', 'finishing', 'done', 'delivered'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
        }

        order.tailorStatus = status;
        if (notes !== undefined) order.tailorNotes = notes;
        if (status === 'done') order.tailorCompletedAt = new Date();

        // อัปเดตสถานะหลักตามสถานะช่าง
        if (status === 'done') {
            order.status = 'qc';
        } else if (status === 'delivered') {
            order.status = 'ready_to_ship';
        }

        await order.save();

        // แจ้ง admin (ส่งผ่าน sendTailorStatusUpdate)
        try {
            await sendTailorStatusUpdate(order, status);
        } catch (lineError) {
            console.error('Error sending LINE notification:', lineError);
            // ไม่ fail การ update ถ้า LINE ส่งไม่ได้
        }

        return NextResponse.json({
            success: true,
            data: order,
            message: 'อัปเดตสถานะสำเร็จ'
        });
    } catch (error) {
        console.error('Error updating tailor status:', error);
        return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
    }
}

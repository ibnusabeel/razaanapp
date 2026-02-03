import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendStatusUpdate, sendTailorNotification } from '@/lib/line';
import Order from '@/models/Order';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findById(id).lean();

        if (!order) {
            return NextResponse.json({ success: false, error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: order });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

/**
 * PUT /api/orders/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const oldOrder = await Order.findById(id);

        // คำนวณยอดคงเหลือใหม่
        if (body.price !== undefined || body.deposit !== undefined) {
            body.balance = (body.price ?? oldOrder?.price ?? 0) - (body.deposit ?? oldOrder?.deposit ?? 0);
        }

        const order = await Order.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

        if (!order) {
            return NextResponse.json({ success: false, error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 });
        }

        // ส่ง LINE Notification ถ้าเปลี่ยนสถานะ
        if (body.status && order.lineUserId) {
            console.log('📤 Sending status update to customer:', body.status);
            await sendStatusUpdate(order.lineUserId, order, body.status);
        }

        // ส่งงานให้ช่างตัด ถ้าสถานะเปลี่ยนเป็น producing
        if (body.status === 'producing') {
            console.log('📤 Sending order to tailor...');
            await sendTailorNotification(order);
        }

        return NextResponse.json({ success: true, data: order, message: 'อัปเดตสำเร็จ' });
    } catch (error: unknown) {
        console.error('❌ Error:', error);
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

/**
 * DELETE /api/orders/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return NextResponse.json({ success: false, error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'ลบสำเร็จ' });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

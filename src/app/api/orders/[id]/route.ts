import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendStatusUpdate } from '@/lib/line';
import Order from '@/models/Order';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/orders/[id]
 * ดึงข้อมูล Order ตาม ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const order = await Order.findById(id).lean();

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบคำสั่งซื้อ' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/orders/[id]
 * อัปเดตข้อมูล Order
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // คำนวณยอดคงเหลือใหม่
        if (body.price !== undefined || body.deposit !== undefined) {
            const price = body.price ?? 0;
            const deposit = body.deposit ?? 0;
            body.balance = price - deposit;
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบคำสั่งซื้อ' },
                { status: 404 }
            );
        }

        // Send LINE Notification if status changed
        if (body.status && order.lineUserId) {
            await sendStatusUpdate(order.lineUserId, order, body.status);
        }

        return NextResponse.json({
            success: true,
            data: order,
            message: 'อัปเดตคำสั่งซื้อสำเร็จ',
        });
    } catch (error: unknown) {
        console.error('❌ Error updating order:', error);

        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดต' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/orders/[id]
 * ลบ Order
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบคำสั่งซื้อ' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'ลบคำสั่งซื้อสำเร็จ',
        });
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการลบ' },
            { status: 500 }
        );
    }
}

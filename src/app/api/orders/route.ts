import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendOrderConfirmation, sendTailorNotification } from '@/lib/line';

/**
 * GET /api/orders
 * ดึงรายการ Order ทั้งหมด
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query: any = {};
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        if (status) {
            const statusList = status.split(',').map(s => s.trim());
            query.status = statusList.length === 1 ? statusList[0] : { $in: statusList };
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

/**
 * POST /api/orders
 * สร้าง Order ใหม่
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const balance = (body.price || 0) - (body.deposit || 0);
        const existingUser = await User.findOne({ phone: body.phone });
        const finalLineUserId = body.lineUserId || existingUser?.lineUserId || null;

        console.log('📦 Creating order for:', body.customerName);
        console.log('📱 LINE User ID:', finalLineUserId || 'Not linked');

        // Generate Order Number: ORD-{YYMM}-{RUNNING}
        const now = new Date();
        const prefix = `ORD-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastOrder = await Order.findOne({ orderNumber: { $regex: `^${prefix}` } }).sort({ orderNumber: -1 });
        const nextNum = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1 : 1;
        const orderNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

        const order = await Order.create({
            ...body,
            orderNumber,
            customer: existingUser?._id,
            lineUserId: finalLineUserId,
            balance,
            orderDate: body.orderDate || new Date(),
        });

        // อัปเดตไซส์ล่าสุดลงใน User Profile
        if (existingUser && body.measurements) {
            await User.findByIdAndUpdate(existingUser._id, {
                $set: { measurements: body.measurements }
            });
            console.log('📏 Updated user measurements for:', existingUser.realName);
        }

        // ส่ง Flex ให้ลูกค้า
        if (order.lineUserId) {
            console.log('📤 Sending order confirmation...');
            await sendOrderConfirmation(order.lineUserId, order);
        }

        // ส่งงานให้ช่างตัด (ถ้าสถานะเป็น confirmed หรือ producing)
        if (['confirmed', 'producing'].includes(order.status)) {
            console.log('📤 Sending to tailor...');
            await sendTailorNotification(order);
        }

        return NextResponse.json({ success: true, data: order, message: 'บันทึกสำเร็จ' }, { status: 201 });
    } catch (error: unknown) {
        console.error('❌ Error creating order:', error);
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

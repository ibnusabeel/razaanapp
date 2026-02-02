import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { appendOrderToSheet } from '@/lib/googleSheets';
import User from '@/models/User';
import { sendOrderConfirmation } from '@/lib/line';
import { sendLineNotification } from '@/lib/lineNotify';

/**
 * GET /api/orders
 * ดึงรายการ Order ทั้งหมด พร้อมรองรับการค้นหา
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // รับ query parameters สำหรับการค้นหา
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // สร้าง query สำหรับการค้นหา
        const query: any = {};
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by status (supports comma-separated values)
        if (status) {
            const statusList = status.split(',').map(s => s.trim());
            if (statusList.length === 1) {
                query.status = statusList[0];
            } else {
                query.status = { $in: statusList };
            }
        }

        // นับจำนวนทั้งหมด
        const total = await Order.countDocuments(query);

        // ดึงข้อมูลพร้อม pagination
        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/orders
 * สร้าง Order ใหม่ พร้อมบันทึกลง Google Sheets และส่งแจ้งเตือน LINE
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();

        // คำนวณยอดคงเหลือ
        const balance = (body.price || 0) - (body.deposit || 0);

        // 1. ค้นหา User จากเบอร์โทร เพื่อเชื่อมโยงอัตโนมัติ
        const existingUser = await User.findOne({ phone: body.phone });

        // สร้าง Order ใหม่
        const orderData = {
            ...body,
            customer: existingUser?._id, // Link to User if exists
            lineUserId: existingUser?.lineUserId, // Copy LINE ID for easy access
            balance,
            orderDate: body.orderDate || new Date(),
        };

        const order = await Order.create(orderData);

        // บันทึกลง Google Sheets
        appendOrderToSheet(order).catch(console.error);

        // 2. แจ้งเตือนลูกค้า (Flex Message) ถ้ามีข้อมูลสมาชิก
        if (order.lineUserId) {
            sendOrderConfirmation(order.lineUserId, order).catch(console.error);
        }

        // 3. แจ้งเตือน Admin (เดิม)
        sendLineNotification(order).catch(console.error);

        return NextResponse.json(
            {
                success: true,
                data: order,
                message: 'บันทึกคำสั่งซื้อสำเร็จ',
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('❌ Error creating order:', error);

        // ตรวจสอบ Validation Error
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
            { status: 500 }
        );
    }
}

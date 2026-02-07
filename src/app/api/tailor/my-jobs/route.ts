import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

/**
 * GET /api/tailor/my-jobs
 * ดึงงานทั้งหมดที่มอบหมายให้ช่างคนนี้
 * ต้องส่ง lineUserId ผ่าน query หรือ header
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // ดึง lineUserId จาก query (สำหรับเรียกจากหน้าเว็บที่มี LINE auth)
        const { searchParams } = new URL(request.url);
        const lineUserId = searchParams.get('lineUserId');

        if (!lineUserId) {
            // ถ้าไม่มี lineUserId ส่ง error
            return NextResponse.json({
                success: false,
                error: 'กรุณาเข้าสู่ระบบผ่าน LINE'
            }, { status: 401 });
        }

        // หา tailor จาก lineUserId
        const tailor = await User.findOne({ lineUserId, role: 'tailor' }).lean();
        if (!tailor) {
            return NextResponse.json({
                success: false,
                error: 'ไม่พบข้อมูลช่าง กรุณาติดต่อ Admin'
            }, { status: 403 });
        }

        // ดึงงานที่มอบหมายให้ช่างคนนี้
        const orders = await Order.find({ tailorId: tailor._id } as any)
            .sort({ tailorAssignedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: orders,
            tailor: {
                name: tailor.realName,
                specialty: tailor.specialty,
            }
        });
    } catch (error) {
        console.error('Error fetching tailor jobs:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch jobs'
        }, { status: 500 });
    }
}

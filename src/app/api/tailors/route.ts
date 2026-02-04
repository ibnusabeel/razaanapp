import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/tailors
 * ดึงรายการช่างตัดทั้งหมด
 */
export async function GET() {
    try {
        await connectDB();

        const tailors = await User.find({ role: 'tailor' })
            .sort({ isActive: -1, createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: tailors.map(t => ({
                ...t,
                _id: (t._id as { toString(): string }).toString(),
            }))
        });
    } catch (error) {
        console.error('Error fetching tailors:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch tailors' }, { status: 500 });
    }
}

/**
 * POST /api/tailors
 * เพิ่มช่างใหม่ (Admin เพิ่มจาก LINE User ID ที่สมัครมา)
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        // ค้นหา User จาก lineUserId
        const user = await User.findOne({ lineUserId: body.lineUserId });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'ไม่พบผู้ใช้นี้ในระบบ กรุณาให้ช่างลงทะเบียนผ่าน LINE ก่อน'
            }, { status: 404 });
        }

        // อัปเดต role เป็น tailor
        user.role = 'tailor';
        user.specialty = body.specialty || '';
        user.isActive = true;
        await user.save();

        return NextResponse.json({
            success: true,
            data: user,
            message: 'เพิ่มช่างตัดสำเร็จ'
        });
    } catch (error) {
        console.error('Error adding tailor:', error);
        return NextResponse.json({ success: false, error: 'Failed to add tailor' }, { status: 500 });
    }
}

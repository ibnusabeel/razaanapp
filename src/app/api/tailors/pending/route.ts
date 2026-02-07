import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/tailors/pending
 * ดึงรายการผู้ใช้ที่สมัครช่างรอ Admin อนุมัติ
 * (Users ที่มี pendingTailorRequest = true)
 * หมายเหตุ: เนื่องจากเราไม่มี flag pendingTailorRequest 
 * ให้ admin ดูจาก members หน้าปกติแล้วเลือก add เป็น tailor แทน
 */
export async function GET() {
    try {
        await connectDB();

        // ดึง users ทั้งหมดที่เป็น customer (สำหรับให้ admin เลือก promote เป็น tailor)
        const customers = await User.find({ role: 'customer' })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            data: customers.map(c => ({
                ...c,
                _id: (c._id as { toString(): string }).toString(),
            }))
        });
    } catch (error) {
        console.error('Error fetching pending tailors:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}

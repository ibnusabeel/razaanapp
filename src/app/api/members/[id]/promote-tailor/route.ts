import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/members/[id]/promote-tailor
 * เลื่อนสมาชิกเป็นช่างตัด
 */
export async function POST(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const member = await User.findById(id);
        if (!member) {
            return NextResponse.json({ success: false, error: 'ไม่พบสมาชิก' }, { status: 404 });
        }

        if (member.role === 'tailor') {
            return NextResponse.json({ success: false, error: 'สมาชิกเป็นช่างอยู่แล้ว' }, { status: 400 });
        }

        member.role = 'tailor';
        member.isActive = true;
        if (body.specialty) {
            member.specialty = body.specialty;
        }
        await member.save();

        return NextResponse.json({
            success: true,
            data: member,
            message: 'เลื่อนเป็นช่างตัดสำเร็จ'
        });
    } catch (error) {
        console.error('Error promoting member:', error);
        return NextResponse.json({ success: false, error: 'Failed to promote member' }, { status: 500 });
    }
}

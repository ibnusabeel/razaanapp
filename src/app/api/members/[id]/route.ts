import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/members/[id]
 * ดึงข้อมูลสมาชิกและออเดอร์ทั้งหมด
 */
export async function GET(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;

        const member = await User.findById(id).lean();
        if (!member) {
            return NextResponse.json({ success: false, error: 'ไม่พบสมาชิก' }, { status: 404 });
        }

        // ดึงออเดอร์ของสมาชิกคนนี้
        const orders = await Order.find({
            $or: [
                { customerId: id },
                { lineUserId: member.lineUserId }
            ]
        })
            .sort({ orderDate: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                member,
                orders,
                orderCount: orders.length,
            }
        });
    } catch (error) {
        console.error('Error fetching member:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch member' }, { status: 500 });
    }
}

/**
 * PUT /api/members/[id]
 * อัปเดตข้อมูลสมาชิก
 */
export async function PUT(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // ไม่ให้แก้ไข role โดยตรง (ต้องใช้ promote endpoint)
        const { role, ...updateData } = body;

        const member = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!member) {
            return NextResponse.json({ success: false, error: 'ไม่พบสมาชิก' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: member,
            message: 'อัปเดตสำเร็จ'
        });
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({ success: false, error: 'Failed to update member' }, { status: 500 });
    }
}

/**
 * DELETE /api/members/[id]
 * ลบสมาชิก
 */
export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;

        const member = await User.findByIdAndDelete(id);
        if (!member) {
            return NextResponse.json({ success: false, error: 'ไม่พบสมาชิก' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'ลบสมาชิกสำเร็จ'
        });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete member' }, { status: 500 });
    }
}

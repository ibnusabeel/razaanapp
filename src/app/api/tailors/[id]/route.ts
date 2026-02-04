import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/tailors/[id]
 * ดึงข้อมูลช่างและงานที่รับผิดชอบ
 */
export async function GET(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;

        const tailor = await User.findById(id).lean();
        if (!tailor || tailor.role !== 'tailor') {
            return NextResponse.json({ success: false, error: 'ไม่พบช่างตัด' }, { status: 404 });
        }

        // ดึง orders ที่มอบหมายให้ช่างคนนี้
        const orders = await Order.find({ tailorId: id } as any)
            .sort({ tailorAssignedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                tailor,
                orders,
                stats: {
                    total: orders.length,
                    pending: orders.filter(o => o.tailorStatus === 'pending').length,
                    inProgress: orders.filter(o => ['cutting', 'sewing', 'finishing'].includes(o.tailorStatus || '')).length,
                    done: orders.filter(o => o.tailorStatus === 'done').length,
                    delivered: orders.filter(o => o.tailorStatus === 'delivered').length,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching tailor:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch tailor' }, { status: 500 });
    }
}

/**
 * PUT /api/tailors/[id]
 * อัปเดตข้อมูลช่าง
 */
export async function PUT(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const tailor = await User.findById(id);
        if (!tailor || tailor.role !== 'tailor') {
            return NextResponse.json({ success: false, error: 'ไม่พบช่างตัด' }, { status: 404 });
        }

        // อัปเดตข้อมูล
        if (body.specialty !== undefined) tailor.specialty = body.specialty;
        if (body.isActive !== undefined) tailor.isActive = body.isActive;
        if (body.realName !== undefined) tailor.realName = body.realName;
        if (body.phone !== undefined) tailor.phone = body.phone;

        await tailor.save();

        return NextResponse.json({ success: true, data: tailor, message: 'อัปเดตสำเร็จ' });
    } catch (error) {
        console.error('Error updating tailor:', error);
        return NextResponse.json({ success: false, error: 'Failed to update tailor' }, { status: 500 });
    }
}

/**
 * DELETE /api/tailors/[id]
 * ลบช่าง (เปลี่ยน role กลับเป็น customer)
 */
export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;

        const tailor = await User.findById(id);
        if (!tailor) {
            return NextResponse.json({ success: false, error: 'ไม่พบช่างตัด' }, { status: 404 });
        }

        // เปลี่ยน role กลับเป็น customer
        tailor.role = 'customer';
        tailor.specialty = '';
        await tailor.save();

        return NextResponse.json({ success: true, message: 'ลบช่างตัดสำเร็จ' });
    } catch (error) {
        console.error('Error removing tailor:', error);
        return NextResponse.json({ success: false, error: 'Failed to remove tailor' }, { status: 500 });
    }
}

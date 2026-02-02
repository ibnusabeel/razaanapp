import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET() {
    try {
        await connectDB();

        // Get date ranges
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Aggregate stats
        const [
            totalOrders,
            todayOrders,
            pendingOrders,
            producingOrders,
            readyOrders,
            completedOrders,
            totalMembers,
            recentOrders,
            revenueStats
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: { $in: ['confirmed', 'producing', 'qc'] } }),
            Order.countDocuments({ status: { $in: ['packing', 'ready_to_ship'] } }),
            Order.countDocuments({ status: 'completed' }),
            User.countDocuments({ role: 'customer' }),
            Order.find().sort({ createdAt: -1 }).limit(5).lean(),
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$price' },
                        totalDeposit: { $sum: '$deposit' },
                        totalBalance: { $sum: '$balance' },
                    }
                }
            ])
        ]);

        const revenue = revenueStats[0] || { totalRevenue: 0, totalDeposit: 0, totalBalance: 0 };

        return NextResponse.json({
            success: true,
            data: {
                orders: {
                    total: totalOrders,
                    today: todayOrders,
                    pending: pendingOrders,
                    producing: producingOrders,
                    ready: readyOrders,
                    completed: completedOrders,
                },
                members: {
                    total: totalMembers,
                },
                revenue: {
                    total: revenue.totalRevenue,
                    deposit: revenue.totalDeposit,
                    balance: revenue.totalBalance,
                },
                recentOrders,
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

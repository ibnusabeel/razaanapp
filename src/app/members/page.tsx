'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Users, Search, Loader2, Phone, MapPin,
    ChevronRight, TrendingUp, Package, Plus, Wallet,
    MessageCircle
} from 'lucide-react';

interface Member {
    _id: string;
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    realName: string;
    phone: string;
    address?: string;
    createdAt: string;
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [total, setTotal] = useState(0);

    const fetchMembers = useCallback(async (search: string = '') => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            const res = await fetch(`/api/members?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
                setTotal(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSearch = () => {
        fetchMembers(searchQuery);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 pb-24">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-600 to-green-800 text-white px-4 pt-8 pb-16 rounded-b-3xl shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">สมาชิก</h1>
                    </div>
                    <p className="text-green-200 text-sm">รายชื่อลูกค้าทั้งหมด {total} คน</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 -mt-10">
                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-lg p-3 mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, เบอร์โทร..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 outline-none text-sm"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        ค้นหา
                    </button>
                </div>

                {/* Members List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                    </div>
                ) : members.length > 0 ? (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <MemberCard key={member._id} member={member} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {searchQuery ? 'ไม่พบสมาชิก' : 'ยังไม่มีสมาชิก'}
                        </h3>
                        <p className="text-gray-400">
                            {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'รอลูกค้าลงทะเบียนผ่าน LINE'}
                        </p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav active="members" />
        </div>
    );
}

function MemberCard({ member }: { member: Member }) {
    const createdDate = new Date(member.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {member.pictureUrl ? (
                        <img
                            src={member.pictureUrl}
                            alt={member.displayName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                            {member.realName?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{member.realName}</h3>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {member.displayName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                        </span>
                        {member.address && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full truncate max-w-[150px]">
                                <MapPin className="w-3 h-3" />
                                {member.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{createdDate}</p>
                </div>
            </div>
        </div>
    );
}

// Bottom Navigation Component
function BottomNav({ active = '' }: { active?: string }) {
    const linkClass = (name: string) =>
        `flex flex-col items-center ${active === name ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-around h-16">
                <Link href="/dashboard" className={linkClass('dashboard')}>
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs mt-1">หน้าหลัก</span>
                </Link>
                <Link href="/orders" className={linkClass('orders')}>
                    <Package className="w-5 h-5" />
                    <span className="text-xs mt-1">ออเดอร์</span>
                </Link>
                <Link
                    href="/orders/new"
                    className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-full text-white shadow-lg border-4 border-white"
                >
                    <Plus className="w-7 h-7" />
                </Link>
                <Link href="/members" className={linkClass('members')}>
                    <Users className="w-5 h-5" />
                    <span className="text-xs mt-1">สมาชิก</span>
                </Link>
                <Link href="/orders" className={linkClass('wallet')}>
                    <Wallet className="w-5 h-5" />
                    <span className="text-xs mt-1">รายการ</span>
                </Link>
            </div>
        </nav>
    );
}

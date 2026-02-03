'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Phone, MapPin, MessageCircle, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';

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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            params.set('page', page.toString());
            params.set('limit', '20');
            const res = await fetch(`/api/members?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
                setTotal(data.pagination.total);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, page]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchMembers(), 300);
        return () => clearTimeout(timeout);
    }, [fetchMembers]);

    return (
        <AdminLayout title="สมาชิก" subtitle={`ลูกค้าทั้งหมด ${total} คน`}>
            {/* Search */}
            <div className="mb-6">
                <div className="relative w-full lg:w-80">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Members Grid/List */}
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : members.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {members.map((member) => (
                        <MemberCard key={member._id} member={member} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-emerald-200">
                    <Sparkles className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                    <p className="text-slate-500">{searchQuery ? 'ไม่พบสมาชิก' : 'ยังไม่มีสมาชิก'}</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 text-sm text-slate-500">
                    <span>หน้า {page} จาก {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border-2 border-emerald-100 rounded-xl hover:bg-emerald-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5 text-emerald-500" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border-2 border-emerald-100 rounded-xl hover:bg-emerald-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5 text-emerald-500" />
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function MemberCard({ member }: { member: Member }) {
    const createdDate = new Date(member.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    return (
        <div className="bg-white rounded-2xl border-2 border-emerald-50 p-4 hover:shadow-lg hover:shadow-emerald-100 transition-all hover:border-emerald-200">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {member.pictureUrl ? (
                        <img
                            src={member.pictureUrl}
                            alt={member.displayName}
                            className="w-14 h-14 rounded-full object-cover border-3 border-emerald-200 shadow-lg"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {member.realName?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{member.realName}</h3>
                    <p className="text-sm text-emerald-600 truncate flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {member.displayName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {member.phone}
                        </span>
                        {member.address && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-2.5 py-1 rounded-full border border-blue-100 truncate max-w-[140px]">
                                <MapPin className="w-3 h-3 text-blue-500" />
                                {member.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">{createdDate}</p>
                </div>
            </div>
        </div>
    );
}

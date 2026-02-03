'use client';

import { useState, useEffect } from 'react';
import { Users, Search, X, Check, Loader2 } from 'lucide-react';

interface Member {
    _id: string;
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    realName: string;
    phone: string;
    address?: string;
}

interface MemberSelectProps {
    onSelect: (member: Member | null) => void;
    selectedMember?: Member | null;
}

export default function MemberSelect({ onSelect, selectedMember }: MemberSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch members
    useEffect(() => {
        const fetchMembers = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.set('search', searchQuery);
                params.set('limit', '10');
                const res = await fetch(`/api/members?${params.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setMembers(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch members:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, searchQuery]);

    const handleSelect = (member: Member) => {
        onSelect(member);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        onSelect(null);
    };

    return (
        <div className="relative">
            {/* Selected Member Display or Button */}
            {selectedMember ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    {selectedMember.pictureUrl ? (
                        <img
                            src={selectedMember.pictureUrl}
                            alt={selectedMember.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                            {selectedMember.realName?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{selectedMember.realName}</p>
                        <p className="text-sm text-gray-500 truncate">{selectedMember.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-green-100 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center gap-3 p-3 bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-purple-700">เลือกลูกค้าสมาชิก LINE</p>
                        <p className="text-sm text-gray-500">เชื่อมต่อเพื่อส่งแจ้งเตือนอัตโนมัติ</p>
                    </div>
                </button>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-lg">เลือกลูกค้า</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Search */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อ, เบอร์โทร..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Members List */}
                        <div className="overflow-y-auto max-h-[50vh]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                                </div>
                            ) : members.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {members.map((member) => (
                                        <button
                                            key={member._id}
                                            type="button"
                                            onClick={() => handleSelect(member)}
                                            className="w-full flex items-center gap-3 p-4 hover:bg-purple-50 transition-colors text-left"
                                        >
                                            {member.pictureUrl ? (
                                                <img
                                                    src={member.pictureUrl}
                                                    alt={member.displayName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                                    {member.realName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{member.realName}</p>
                                                <p className="text-sm text-gray-500 truncate">{member.phone}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>ไม่พบสมาชิก</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

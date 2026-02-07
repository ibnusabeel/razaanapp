'use client';

import { useState, useEffect } from 'react';
import { Scissors, ChevronDown, Check, Loader2, User } from 'lucide-react';

interface Tailor {
    _id: string;
    realName: string;
    displayName: string;
    specialty: string;
    isActive: boolean;
    pictureUrl?: string;
}

interface TailorAssignmentProps {
    orderId: string;
    currentTailorId?: string;
    currentTailorStatus?: string;
    onAssigned?: () => void;
}

const tailorStatusLabels: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'รอดำเนินการ', color: 'text-gray-600', bg: 'bg-gray-100' },
    cutting: { label: 'กำลังตัดผ้า', color: 'text-blue-600', bg: 'bg-blue-100' },
    sewing: { label: 'กำลังเย็บ', color: 'text-purple-600', bg: 'bg-purple-100' },
    finishing: { label: 'เก็บงาน', color: 'text-pink-600', bg: 'bg-pink-100' },
    done: { label: 'เสร็จแล้ว', color: 'text-green-600', bg: 'bg-green-100' },
    delivered: { label: 'ส่งมอบแล้ว', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

export default function TailorAssignment({ orderId, currentTailorId, currentTailorStatus, onAssigned }: TailorAssignmentProps) {
    const [tailors, setTailors] = useState<Tailor[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null);

    useEffect(() => {
        fetchTailors();
    }, []);

    useEffect(() => {
        if (currentTailorId && tailors.length > 0) {
            const current = tailors.find(t => t._id === currentTailorId);
            if (current) setSelectedTailor(current);
        }
    }, [currentTailorId, tailors]);

    const fetchTailors = async () => {
        try {
            const res = await fetch('/api/tailors');
            const data = await res.json();
            if (data.success) {
                setTailors(data.data.filter((t: Tailor) => t.isActive));
            }
        } catch (error) {
            console.error('Error fetching tailors:', error);
        } finally {
            setLoading(false);
        }
    };

    const assignTailor = async (tailor: Tailor) => {
        setAssigning(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/assign-tailor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tailorId: tailor._id }),
            });
            const data = await res.json();
            if (data.success) {
                setSelectedTailor(tailor);
                setIsOpen(false);
                onAssigned?.();
                alert(`มอบหมายงานให้ ${tailor.realName} สำเร็จ!`);
            } else {
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error assigning tailor:', error);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังโหลด...
            </div>
        );
    }

    const statusInfo = currentTailorStatus ? tailorStatusLabels[currentTailorStatus] : null;

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 overflow-hidden border border-blue-50">
            <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    ช่างตัด
                </h3>
                {statusInfo && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                )}
            </div>
            <div className="p-5">
                {tailors.length === 0 ? (
                    <p className="text-sm text-slate-500">ยังไม่มีช่างในระบบ กรุณาเพิ่มช่างที่หน้า /tailors</p>
                ) : (
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            disabled={assigning}
                            className="w-full flex items-center justify-between px-4 py-3 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3">
                                {selectedTailor ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                            {selectedTailor.pictureUrl ? (
                                                <img src={selectedTailor.pictureUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">{selectedTailor.realName}</p>
                                            {selectedTailor.specialty && (
                                                <p className="text-xs text-blue-600">{selectedTailor.specialty}</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Scissors className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <span className="text-slate-500">เลือกช่างตัด...</span>
                                    </>
                                )}
                            </div>
                            {assigning ? (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : (
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {/* Dropdown */}
                        {isOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                                {tailors.map((tailor) => (
                                    <button
                                        key={tailor._id}
                                        onClick={() => assignTailor(tailor)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                                            {tailor.pictureUrl ? (
                                                <img src={tailor.pictureUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{tailor.realName}</p>
                                            {tailor.specialty && (
                                                <p className="text-xs text-blue-600">{tailor.specialty}</p>
                                            )}
                                        </div>
                                        {selectedTailor?._id === tailor._id && (
                                            <Check className="w-5 h-5 text-green-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Scissors, X, Check, Loader2, User, Package } from 'lucide-react';

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

const tailorStatusLabels: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending: { label: 'รอดำเนินการ', color: 'text-gray-600', bg: 'bg-gray-100', icon: '⏳' },
    cutting: { label: 'กำลังตัดผ้า', color: 'text-blue-600', bg: 'bg-blue-100', icon: '✂️' },
    sewing: { label: 'กำลังเย็บ', color: 'text-purple-600', bg: 'bg-purple-100', icon: '🧵' },
    finishing: { label: 'เก็บงาน', color: 'text-pink-600', bg: 'bg-pink-100', icon: '✨' },
    done: { label: 'เสร็จแล้ว', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' },
    delivered: { label: 'ส่งมอบแล้ว', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: '📦' },
};

const statusOptions = Object.entries(tailorStatusLabels).map(([value, info]) => ({
    value,
    ...info,
}));

export default function TailorAssignment({ orderId, currentTailorId, currentTailorStatus, onAssigned }: TailorAssignmentProps) {
    const [tailors, setTailors] = useState<Tailor[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

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
                setShowModal(false);
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

    const updateTailorStatus = async (newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/tailor-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tailorStatus: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setShowStatusModal(false);
                onAssigned?.();
                alert('อัปเดตสถานะสำเร็จ!');
            } else {
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setUpdatingStatus(false);
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
        <>
            <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 overflow-hidden border border-blue-50">
                <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Scissors className="w-4 h-4" />
                        ช่างตัด
                    </h3>
                    {statusInfo && (
                        <button
                            onClick={() => setShowStatusModal(true)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} hover:opacity-80 transition-opacity`}
                        >
                            {statusInfo.icon} {statusInfo.label}
                        </button>
                    )}
                </div>
                <div className="p-5">
                    {tailors.length === 0 ? (
                        <p className="text-sm text-slate-500">ยังไม่มีช่างในระบบ กรุณาเพิ่มช่างที่หน้า /tailors</p>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Current Tailor Display */}
                            <button
                                onClick={() => setShowModal(true)}
                                disabled={assigning}
                                className="flex-1 flex items-center gap-3 px-4 py-3 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-colors disabled:opacity-50 text-left"
                            >
                                {selectedTailor ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                                            {selectedTailor.pictureUrl ? (
                                                <img src={selectedTailor.pictureUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
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
                                        <span className="text-slate-500">กดเพื่อเลือกช่างตัด...</span>
                                    </>
                                )}
                            </button>

                            {/* Update Status Button */}
                            {selectedTailor && (
                                <button
                                    onClick={() => setShowStatusModal(true)}
                                    className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"
                                >
                                    <Package className="w-5 h-5" />
                                    <span className="hidden sm:inline">อัปเดตสถานะ</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tailor Selection Modal (Lightbox) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Scissors className="w-5 h-5" />
                                เลือกช่างตัด
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tailor List */}
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                            {tailors.map((tailor) => (
                                <button
                                    key={tailor._id}
                                    onClick={() => assignTailor(tailor)}
                                    disabled={assigning}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedTailor?._id === tailor._id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                        } ${assigning ? 'opacity-50' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                                        {tailor.pictureUrl ? (
                                            <img src={tailor.pictureUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{tailor.realName}</p>
                                        <p className="text-sm text-slate-500">@{tailor.displayName || 'LINE User'}</p>
                                        {tailor.specialty && (
                                            <p className="text-xs text-blue-600 mt-1">🎯 {tailor.specialty}</p>
                                        )}
                                    </div>
                                    {selectedTailor?._id === tailor._id && (
                                        <Check className="w-6 h-6 text-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                อัปเดตสถานะช่าง
                            </h2>
                            <button onClick={() => setShowStatusModal(false)} className="text-white/80 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Status Options */}
                        <div className="p-5 space-y-2">
                            {statusOptions.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => updateTailorStatus(status.value)}
                                    disabled={updatingStatus}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${currentTailorStatus === status.value
                                            ? `${status.bg} border-current`
                                            : 'border-slate-200 hover:border-slate-300'
                                        } ${updatingStatus ? 'opacity-50' : ''}`}
                                >
                                    <span className="text-2xl">{status.icon}</span>
                                    <span className={`font-bold ${status.color}`}>{status.label}</span>
                                    {currentTailorStatus === status.value && (
                                        <Check className="w-5 h-5 text-green-500 ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

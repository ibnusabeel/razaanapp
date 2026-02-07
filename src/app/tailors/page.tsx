'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Plus, Trash2, Search, ToggleLeft, ToggleRight, Scissors, Package, Eye } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Tailor {
    _id: string;
    lineUserId: string;
    displayName: string;
    realName: string;
    phone: string;
    specialty: string;
    isActive: boolean;
    pictureUrl?: string;
    createdAt: string;
}

export default function TailorsPage() {
    const [tailors, setTailors] = useState<Tailor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTailorId, setNewTailorId] = useState('');
    const [newTailorSpecialty, setNewTailorSpecialty] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const fetchTailors = useCallback(async () => {
        try {
            const res = await fetch('/api/tailors');
            const data = await res.json();
            if (data.success) {
                setTailors(data.data);
            }
        } catch (error) {
            console.error('Error fetching tailors:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTailors();
    }, [fetchTailors]);

    const handleAddTailor = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const res = await fetch('/api/tailors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lineUserId: newTailorId.trim(), specialty: newTailorSpecialty }),
            });
            const data = await res.json();
            if (data.success) {
                alert('เพิ่มช่างตัดสำเร็จ!');
                setShowAddModal(false);
                setNewTailorId('');
                setNewTailorSpecialty('');
                fetchTailors();
            } else {
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error adding tailor:', error);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setAddLoading(false);
        }
    };

    const toggleActive = async (id: string, currentState: boolean) => {
        try {
            const res = await fetch(`/api/tailors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentState }),
            });
            if (res.ok) {
                fetchTailors();
            }
        } catch (error) {
            console.error('Error toggling tailor:', error);
        }
    };

    const removeTailor = async (id: string, name: string) => {
        if (!confirm(`ต้องการลบ ${name} ออกจากรายชื่อช่างหรือไม่?`)) return;

        try {
            const res = await fetch(`/api/tailors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('ลบช่างตัดสำเร็จ');
                fetchTailors();
            }
        } catch (error) {
            console.error('Error removing tailor:', error);
        }
    };

    const filteredTailors = tailors.filter(t =>
        t.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery)
    );

    return (
        <AdminLayout title="จัดการช่างตัด" subtitle={`ช่างทั้งหมด ${tailors.length} คน`}>
            {/* Search & Add */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาช่าง..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มช่างตัด
                </button>
            </div>

            {/* Tailors Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">กำลังโหลด...</div>
            ) : filteredTailors.length === 0 ? (
                <div className="text-center py-20">
                    <Scissors className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">ยังไม่มีช่างตัด</p>
                    <p className="text-sm text-slate-400 mt-2">กด "เพิ่มช่างตัด" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTailors.map((tailor) => (
                        <div
                            key={tailor._id}
                            className={`bg-white rounded-2xl border-2 p-5 transition-all ${tailor.isActive ? 'border-blue-200 shadow-lg' : 'border-slate-200 opacity-60'}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${tailor.isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-300'}`}>
                                    {tailor.pictureUrl ? (
                                        <img src={tailor.pictureUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-white">✂️</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">{tailor.realName}</h3>
                                    <p className="text-sm text-slate-500">@{tailor.displayName || 'LINE User'}</p>
                                    <p className="text-sm text-slate-500 mt-1">📞 {tailor.phone}</p>
                                    {tailor.specialty && (
                                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-2">
                                            🎯 {tailor.specialty}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleActive(tailor._id, tailor.isActive); }}
                                        className={`p-2 rounded-lg transition-colors ${tailor.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        title={tailor.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                                    >
                                        {tailor.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeTailor(tailor._id, tailor.realName); }}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        title="ลบช่าง"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* View Jobs Link */}
                            <Link
                                href={`/tailors/${tailor._id}`}
                                className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-slate-600 font-medium">ดูงานทั้งหมด</span>
                                </div>
                                <Eye className="w-4 h-4 text-blue-500" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Scissors className="w-6 h-6 text-blue-600" />
                            เพิ่มช่างตัดใหม่
                        </h2>
                        <form onSubmit={handleAddTailor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    LINE User ID
                                </label>
                                <input
                                    type="text"
                                    value={newTailorId}
                                    onChange={(e) => setNewTailorId(e.target.value)}
                                    placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    * ช่างต้องลงทะเบียนผ่าน LINE ก่อน (พิมพ์ "สมัครช่าง" ในแชท)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    ความชำนาญ (ถ้ามี)
                                </label>
                                <input
                                    type="text"
                                    value={newTailorSpecialty}
                                    onChange={(e) => setNewTailorSpecialty(e.target.value)}
                                    placeholder="เช่น ชุดเจ้าสาว, อาบายะ"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={addLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {addLoading ? 'กำลังเพิ่ม...' : 'เพิ่มช่าง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

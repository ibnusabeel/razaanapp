'use client';

import { useState, useEffect, use } from 'react';
import { Loader2, Printer, QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    dressName: string;
    color: string;
    size: string;
    measurements?: {
        shoulder?: number;
        chest?: number;
        waist?: number;
        armhole?: number;
        sleeveLength?: number;
        wrist?: number;
        upperArm?: number;
        hips?: number;
        totalLength?: number;
    };
    notes?: string;
    tailorNotes?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function PrintOrderPage({ params }: PageProps) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [printMode, setPrintMode] = useState<'full' | 'label'>('full');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>ไม่พบออเดอร์</p>
            </div>
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';
    const qrUrl = `${appUrl}/orders/${order._id}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;
    const measurements = order.measurements || {};

    return (
        <>
            {/* Control Panel - Hidden when printing */}
            <div className="print:hidden bg-slate-100 p-4 sticky top-0 z-50">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                    <Link href={`/orders/${id}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                        กลับ
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPrintMode('full')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${printMode === 'full'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            📋 ใบงานเต็ม
                        </button>
                        <button
                            onClick={() => setPrintMode('label')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${printMode === 'label'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            🏷️ ป้ายติดชุด
                        </button>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-teal-700"
                    >
                        <Printer className="w-5 h-5" />
                        พิมพ์
                    </button>
                </div>
            </div>

            {/* Print Content */}
            <div className="print-content">
                {printMode === 'full' ? (
                    /* Full Work Order - 80mm Thermal Printer */
                    <div className="thermal-receipt">
                        {/* Header */}
                        <div className="text-center border-b-2 border-dashed border-black pb-2 mb-2">
                            <h1 className="text-lg font-bold">RAZAAN</h1>
                            <p className="text-xs">ใบงานช่าง</p>
                        </div>

                        {/* QR Code */}
                        <div className="text-center my-2">
                            <img
                                src={qrApiUrl}
                                alt="QR Code"
                                className="mx-auto"
                                style={{ width: '100px', height: '100px' }}
                            />
                            <p className="text-xs font-bold mt-1">{order.orderNumber}</p>
                        </div>

                        {/* Order Info */}
                        <div className="border-t border-dashed border-black pt-2 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold">ชื่อชุด:</span>
                                <span>{order.dressName}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="font-bold">สี:</span>
                                <span>{order.color}</span>
                            </div>
                            {order.size && (
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold">ไซส์:</span>
                                    <span>{order.size}</span>
                                </div>
                            )}
                        </div>

                        {/* Customer Info */}
                        <div className="border-t border-dashed border-black pt-2 mt-2 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold">ลูกค้า:</span>
                                <span>{order.customerName}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="font-bold">โทร:</span>
                                <span>{order.phone}</span>
                            </div>
                        </div>

                        {/* Measurements */}
                        <div className="border-t-2 border-dashed border-black pt-2 mt-2">
                            <p className="text-xs font-bold text-center mb-2">📐 สัดส่วน (นิ้ว)</p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                {measurements.shoulder !== undefined && measurements.shoulder > 0 && (
                                    <div className="flex justify-between">
                                        <span>ไหล่:</span>
                                        <span className="font-bold">{measurements.shoulder}"</span>
                                    </div>
                                )}
                                {measurements.chest !== undefined && measurements.chest > 0 && (
                                    <div className="flex justify-between">
                                        <span>อก:</span>
                                        <span className="font-bold">{measurements.chest}"</span>
                                    </div>
                                )}
                                {measurements.waist !== undefined && measurements.waist > 0 && (
                                    <div className="flex justify-between">
                                        <span>เอว:</span>
                                        <span className="font-bold">{measurements.waist}"</span>
                                    </div>
                                )}
                                {measurements.hips !== undefined && measurements.hips > 0 && (
                                    <div className="flex justify-between">
                                        <span>สะโพก:</span>
                                        <span className="font-bold">{measurements.hips}"</span>
                                    </div>
                                )}
                                {measurements.armhole !== undefined && measurements.armhole > 0 && (
                                    <div className="flex justify-between">
                                        <span>วงแขน:</span>
                                        <span className="font-bold">{measurements.armhole}"</span>
                                    </div>
                                )}
                                {measurements.sleeveLength !== undefined && measurements.sleeveLength > 0 && (
                                    <div className="flex justify-between">
                                        <span>แขนยาว:</span>
                                        <span className="font-bold">{measurements.sleeveLength}"</span>
                                    </div>
                                )}
                                {measurements.wrist !== undefined && measurements.wrist > 0 && (
                                    <div className="flex justify-between">
                                        <span>ข้อมือ:</span>
                                        <span className="font-bold">{measurements.wrist}"</span>
                                    </div>
                                )}
                                {measurements.upperArm !== undefined && measurements.upperArm > 0 && (
                                    <div className="flex justify-between">
                                        <span>ต้นแขน:</span>
                                        <span className="font-bold">{measurements.upperArm}"</span>
                                    </div>
                                )}
                                {measurements.totalLength !== undefined && measurements.totalLength > 0 && (
                                    <div className="flex justify-between col-span-2">
                                        <span>ความยาว:</span>
                                        <span className="font-bold">{measurements.totalLength}"</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {(order.notes || order.tailorNotes) && (
                            <div className="border-t border-dashed border-black pt-2 mt-2 text-xs">
                                <p className="font-bold">📝 หมายเหตุ:</p>
                                {order.notes && <p className="ml-2">{order.notes}</p>}
                                {order.tailorNotes && <p className="ml-2 text-gray-600">{order.tailorNotes}</p>}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t-2 border-dashed border-black pt-2 mt-3 text-center">
                            <p className="text-xs">สแกน QR เพื่อดูรายละเอียด</p>
                            <p className="text-xs text-gray-500">razaan.co</p>
                        </div>
                    </div>
                ) : (
                    /* Small Label - For attaching to garment */
                    <div className="thermal-label">
                        <div className="flex items-center gap-2">
                            <img
                                src={qrApiUrl}
                                alt="QR"
                                style={{ width: '60px', height: '60px' }}
                            />
                            <div className="flex-1 text-xs">
                                <p className="font-bold text-sm">{order.orderNumber}</p>
                                <p>{order.dressName}</p>
                                <p className="text-gray-600">{order.customerName}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    .thermal-receipt {
                        width: 72mm;
                        padding: 2mm;
                        font-family: 'Courier New', monospace;
                        font-size: 10px;
                        line-height: 1.3;
                        color: black;
                        background: white;
                    }
                    
                    .thermal-label {
                        width: 72mm;
                        padding: 2mm;
                        font-family: 'Courier New', monospace;
                        border: 1px dashed #000;
                    }
                    
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }
                
                /* Preview styles */
                @media screen {
                    .thermal-receipt {
                        width: 300px;
                        margin: 20px auto;
                        padding: 15px;
                        background: white;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        font-family: 'Courier New', monospace;
                    }
                    
                    .thermal-label {
                        width: 300px;
                        margin: 20px auto;
                        padding: 15px;
                        background: white;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        border: 2px dashed #ccc;
                        font-family: 'Courier New', monospace;
                    }
                }
            `}</style>
        </>
    );
}

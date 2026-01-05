"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PublicInvoicePage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/bookings/${id}`)
            .then(res => res.json())
            .then(data => {
                setBooking(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    // Auto-trigger print when loaded
    useEffect(() => {
        if (!loading && booking) {
            const timer = setTimeout(() => {
                window.print();
            }, 1000); // 1s delay to ensure fonts/images render
            return () => clearTimeout(timer);
        }
    }, [loading, booking]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-amber-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-600 font-semibold text-lg tracking-wide">Preparing your document...</p>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
            <div className="text-center p-12 bg-white rounded-3xl shadow-2xl border border-red-100">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Invoice Not Found</h3>
                <p className="text-slate-600">The requested document could not be located.</p>
            </div>
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "decimal",
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Calculate details
    const totalAmount = booking.totalAmount || 0;
    const dpAmount = booking.dpAmount || 0;
    const incomeTransactions = (booking.transactions || []).filter(t => t.type === 'INCOME');

    let payments = [];
    if (dpAmount > 0) {
        payments.push({ amount: dpAmount, description: 'DP' });
    } else if (incomeTransactions.length > 0) {
        payments = incomeTransactions;
    }

    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remaining = totalAmount - totalPaid;

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50/20 min-h-screen py-10 print:py-0 print:bg-white">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/30 rounded-full blur-3xl"></div>
            </div>

            {/* Mobile Scroll Wrapper - Ensures layout integrity on small screens */}
            <div className="p-4 md:p-0 overflow-x-auto print:overflow-visible print:p-0">
                <div className="relative bg-white p-8 md:p-12 min-w-[750px] md:min-w-0 md:max-w-[850px] mx-auto text-slate-800 printable-area shadow-[0_20px_80px_-15px_rgba(0,0,0,0.15)] print:shadow-none rounded-2xl print:rounded-none border border-slate-100/50 print:border-0">
                    {/* Elegant top border accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 print:hidden"></div>

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200/60">
                        {/* ... existing header content ... */}
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <h2 className="text-xs font-black tracking-[0.22em] uppercase text-slate-900">Jenggala Project</h2>
                                <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-amber-700">Wedding Organizer</p>
                            </div>
                            <div className="text-[10px] leading-relaxed text-slate-600 space-y-0.5 font-medium">
                                <p className="flex items-center gap-1.5">
                                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Perum Pesona Cigunung Blok C1 No.13
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Jenggalaproject.id@gmail.com
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    0811-1243-010
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-3">
                            <h1 className="text-5xl font-serif font-light tracking-wider text-slate-900 invoice-title">INVOICE</h1>
                            <div className="w-20 h-20 relative p-2.5 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-lg border border-amber-100/50">
                                <img src="/logo-jenggala.png" alt="Jenggala Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Meta Section */}
                    <div className="flex justify-end mb-5">
                        <div className="text-xs space-y-2 bg-gradient-to-br from-slate-50 to-amber-50/30 p-4 rounded-xl border border-slate-200/60 shadow-sm print:bg-transparent print:border-slate-300 print:shadow-none">
                            <div className="flex items-center justify-between gap-6">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Tanggal Invoice</span>
                                <span className="font-bold text-slate-900 tabular-nums text-[10px]">{formatDate(new Date())}</span>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                            <div className="flex items-center justify-between gap-6">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Nomor Invoice</span>
                                <span className="font-black text-amber-700 tabular-nums text-sm">#{String(booking.id).padStart(5, '0')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Client Section */}
                    <div className="mb-5 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border-l-4 border-amber-600 shadow-sm">
                        <div className="space-y-2">
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight mb-1">{booking.clientName}</h3>
                                    <p className="text-[10px] font-semibold text-slate-600 flex items-center gap-1.5">
                                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {booking.location || "Venue Location"}
                                    </p>
                                    <p className="text-[10px] font-black text-amber-700 mt-1 flex items-center gap-1.5">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(booking.eventDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow mb-5">
                        <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-900">All in Package Jenggala</h4>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent"></div>
                        </div>

                        {/* Table */}
                        <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
                            <table className="w-full border-collapse">
                                <thead className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 text-white">
                                    <tr>
                                        <th className="py-2.5 px-4 font-black text-[9px] border-r-2 border-slate-600 w-3/5 uppercase tracking-widest text-left">Deskripsi</th>
                                        <th className="py-2.5 px-4 font-black text-[9px] border-r-2 border-slate-600 uppercase tracking-widest text-right">Harga</th>
                                        <th className="py-2.5 px-4 font-black text-[9px] uppercase tracking-widest text-center">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {/* Total Package Row */}
                                    <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-amber-50/50 to-white">
                                        <td className="py-3.5 px-4 font-bold border-r-2 border-slate-200 text-slate-900">
                                            Booking All in Package Jenggala
                                        </td>
                                        <td className="py-3.5 px-4 font-black border-r-2 border-slate-200 text-right" colSpan="2">
                                            <div className="flex justify-end items-baseline gap-2">
                                                <span className="text-[10px] font-bold text-slate-600">Rp</span>
                                                <span className="text-lg tracking-tight text-slate-900">{formatCurrency(totalAmount)}</span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Payments / DP Rows */}
                                    {payments.length > 0 ? payments.map((p, idx) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                            <td className="py-2.5 px-4 border-r-2 border-slate-200 font-semibold text-slate-700">
                                                Pembayaran Termin {idx + 1}
                                            </td>
                                            <td className="py-2.5 px-4 border-r-2 border-slate-200 text-right">
                                                <div className="flex justify-end items-baseline gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-500">Rp</span>
                                                    <span className="font-bold text-slate-900">{formatCurrency(p.amount)}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-[8px] font-black uppercase tracking-wider">
                                                    DP
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr className="border-b border-slate-200 h-12 bg-slate-50/30">
                                            <td className="border-r-2 border-slate-200"></td>
                                            <td className="border-r-2 border-slate-200"></td>
                                            <td></td>
                                        </tr>
                                    )}

                                    {/* Sisa Pembayaran Row */}
                                    <tr className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-t-2 border-amber-200">
                                        <td className="py-4 px-4 text-right border-r-2 border-amber-200 uppercase tracking-[0.18em] text-[9px] font-black text-slate-900">
                                            Sisa Pembayaran
                                        </td>
                                        <td className="py-4 px-4" colSpan="2">
                                            <div className="flex justify-end items-baseline gap-2">
                                                <span className="text-sm font-bold text-amber-700">Rp</span>
                                                <span className="text-2xl font-black tracking-tight text-amber-900">{formatCurrency(remaining)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Note */}
                        <div className="flex items-start gap-2 mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-[9px] text-slate-600 leading-relaxed italic">
                                Invoice berlaku sebagai bukti penerimaan pembayaran saat pembayaran telah diterima.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Section: Signatures */}
                    <div className="flex justify-between items-end pt-5 mt-5 border-t-2 border-slate-200">
                        <div className="space-y-2.5 max-w-xs">
                            <p className="font-black uppercase tracking-wider text-[8px] text-slate-500 pb-1.5 border-b-2 border-amber-600">Perwakilan Jenggala Wedding Organizer</p>
                            <div className="space-y-1 text-[9px]">
                                <p className="font-black text-slate-900 text-xs">Irpan Syaipullah</p>
                                <p className="font-medium text-slate-600">Perumahan Pesona Cigunung Blok C1 No.13</p>
                                <p className="font-bold text-slate-700 tabular-nums">irpansyaipullah99@gmail.com</p>
                                <p className="font-bold text-slate-700 tabular-nums">0858-6024-6026</p>
                            </div>
                        </div>

                        <div className="text-center space-y-2.5">
                            <p className="font-black uppercase tracking-widest text-[8px] text-slate-500">Owner Jenggala Project</p>
                            <div className="h-14 flex items-center justify-center relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <img src="/logo-jenggala.png" alt="" className="h-full grayscale" />
                                </div>
                                <div className="w-44 border-b-2 border-slate-300"></div>
                            </div>
                            <p className="font-black text-xs text-slate-900">Irpan Syaipullah</p>
                        </div>
                    </div>

                    {/* Decorative bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 print:hidden rounded-b-2xl"></div>
                </div>
            </div>

            {/* Mobile/Floating Manual Download Button */}
            <div className="fixed bottom-6 inset-x-4 md:hidden z-50 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-slate-900/95 backdrop-blur-md text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-slate-700/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                </button>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .printable-area {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }
                
                .invoice-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 300;
                    letter-spacing: 0.05em;
                }

                @media print {
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    
                    html, body { 
                        background: white !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    
                    body * {
                        visibility: hidden;
                    }
                    
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    
                    .printable-area { 
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        box-shadow: none !important; 
                        width: 100% !important;
                        max-width: 100% !important; 
                        margin: 0 !important;
                        padding: 15mm 18mm !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background: white !important;
                    }
                    
                    .print\\:hidden { 
                        display: none !important;
                        visibility: hidden !important;
                    }
                    
                    .print\\:bg-transparent {
                        background: transparent !important;
                    }
                    
                    .print\\:border-slate-300 {
                        border-color: #cbd5e1 !important;
                    }
                    
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    
                    /* Hide all decorative elements */
                    .fixed, [class*="fixed"] {
                        display: none !important;
                    }
                    
                    .absolute[class*="bg-"] {
                        display: none !important;
                    }
                }

                @keyframes slide-in-from-bottom-5 {
                    from {
                        transform: translateY(20px) translateX(-50%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) translateX(-50%);
                        opacity: 1;
                    }
                }

                .animate-in {
                    animation: slide-in-from-bottom-5 0.7s ease-out;
                }
            `}</style>
        </div>
    );
}

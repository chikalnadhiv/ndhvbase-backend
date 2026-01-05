"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, X, Eye, Phone, Mail, Calendar as CalendarIcon, Package as PackageIcon, CheckCircle, Clock, XCircle, Download, FileText, CheckCircle2, AlertCircle, User, MapPin } from "lucide-react";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        eventDate: '',
        packageId: '',
        totalAmount: '',
        status: 'PENDING',
        notes: ''
    });
    const [selectedPreviewBooking, setSelectedPreviewBooking] = useState(null);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const searchParams = useSearchParams();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, packagesRes, clientsRes] = await Promise.all([
                fetch("/api/bookings"),
                fetch("/api/packages"),
                fetch("/api/clients")
            ]);

            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            }
            if (packagesRes.ok) {
                const packagesData = await packagesRes.json();
                setPackages(Array.isArray(packagesData) ? packagesData : []);
            }
            if (clientsRes.ok) {
                const clientsData = await clientsRes.json();
                const processedClients = Array.isArray(clientsData) ? clientsData : [];
                setClients(processedClients);

                // Check for clientId in URL safely
                const preClientId = searchParams.get('clientId');
                if (preClientId) {
                    const client = processedClients.find(c => c.id == preClientId);
                    if (client) {
                        setFormData(prev => ({
                            ...prev,
                            clientId: client.id,
                            clientName: client.name,
                            clientEmail: client.email || '',
                            clientPhone: client.phone,
                            clientAddress: client.address
                        }));
                        setShowModal(true);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Need to send as FormData because backend expects it (Moodboard support)
            const fData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) fData.append(key, formData[key]);
            });

            const res = await fetch("/api/bookings", {
                method: "POST",
                body: fData,
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
                showToast("New booking has been successfully recorded");
                setFormData({
                    clientName: '',
                    clientEmail: '',
                    clientPhone: '',
                    clientAddress: '',
                    eventDate: '',
                    packageId: '',
                    totalAmount: '',
                    status: 'PENDING',
                    notes: ''
                });
            }
        } catch (err) {
            console.error("Error saving booking", err);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchData();
                showToast(`Booking status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error("Failed to update status", err);
            showToast("Failed to update booking status", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Error deleting booking", err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle size={14} className="text-green-500" />;
            case 'PENDING': return <Clock size={14} className="text-yellow-500" />;
            case 'CANCELLED': return <XCircle size={14} className="text-red-500" />;
            default: return null;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-100';
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">Bookings</h1>
                    <p className="text-gray-400 text-sm">Monitor and organize incoming client requests.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 md:py-3 rounded-2xl md:rounded-full hover:scale-105 transition-transform font-bold shadow-lg shadow-black/10 w-full md:w-auto"
                >
                    <Plus size={20} />
                    New Booking
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100/50 overflow-hidden">
                {loading ? (
                    <div className="py-24 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-medium">Fetching bookings...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Client</th>
                                    <th className="hidden md:table-cell px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Event Info</th>
                                    <th className="hidden lg:table-cell px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Package</th>
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</th>
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Budget</th>
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-[#F7F4EF] items-center justify-center text-black font-bold text-lg flex-shrink-0">
                                                        {booking.clientName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#2D2D2D] leading-none mb-1.5 truncate max-w-[120px] md:max-w-none">{booking.clientName}</h4>
                                                        <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                                                            <span className="flex items-center gap-1"><Phone size={10} /> {booking.clientPhone}</span>
                                                            <span className="md:hidden flex items-center gap-1"><CalendarIcon size={10} /> {new Date(booking.eventDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm font-bold text-[#2D2D2D] mb-1">
                                                    <CalendarIcon size={14} className="text-gray-400" />
                                                    {new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-1 italic">{booking.notes || "No additional notes"}</p>
                                            </td>
                                            <td className="hidden lg:table-cell px-8 py-6">
                                                <div className="flex items-center gap-2 font-bold text-sm text-[#2D2D2D]">
                                                    <PackageIcon size={14} className="text-gray-400" />
                                                    {booking.package?.name || 'Custom Plan'}
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full text-[10px] font-black border tracking-wider leading-none ${getStatusStyle(booking.status)}`}>
                                                    {getStatusIcon(booking.status)}
                                                    <span className="hidden sm:inline">{booking.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-right font-black text-[#2D2D2D] text-sm md:text-base">
                                                {(booking.totalAmount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                                                className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                                                                title="Accept Booking"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                                                title="Reject Booking"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'CONFIRMED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                                                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                                            title="Mark as Completed"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/admin/bookings/${booking.id}`}
                                                        className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-100"
                                                        title="Project Sheet"
                                                    >
                                                        <FileText size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            console.log("Opening preview for:", booking);
                                                            setSelectedPreviewBooking(booking);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:text-black hover:bg-white border border-gray-100 transition-all shadow-sm"
                                                        title="Preview Client Dashboard"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {booking.moodboard && (
                                                        <a
                                                            href={booking.moodboard}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm border border-purple-100"
                                                            title="Download Moodboard"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                                                <CalendarIcon size={48} />
                                                <p className="font-bold text-gray-600">No bookings found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-2xl p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 overflow-y-auto max-h-[90vh] no-scrollbar">
                        <div className="flex justify-between items-center mb-8 md:mb-10">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-[#2D2D2D]">New Booking</h2>
                                <p className="text-sm text-gray-400">Fill in the event details to confirm.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Existing Client (Optional)</label>
                                <select
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold appearance-none"
                                    value={formData.clientId}
                                    onChange={(e) => {
                                        const cId = e.target.value;
                                        if (!cId) {
                                            setFormData({ ...formData, clientId: '', clientName: '', clientEmail: '', clientPhone: '', clientAddress: '' });
                                            return;
                                        }
                                        const client = clients.find(c => c.id == cId);
                                        if (client) {
                                            setFormData({
                                                ...formData,
                                                clientId: client.id,
                                                clientName: client.name,
                                                clientEmail: client.email || '',
                                                clientPhone: client.phone,
                                                clientAddress: client.address
                                            });
                                        }
                                    }}
                                >
                                    <option value="">-- New Client (Auto Signup) --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name} (@{client.username || client.phone})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Client Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                        placeholder="Amanda Smith"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Date</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                        value={formData.eventDate}
                                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                        placeholder="amanda@email.com"
                                        value={formData.clientEmail}
                                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="tel" required
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                        placeholder="08123456789"
                                        value={formData.clientPhone}
                                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                                <textarea
                                    required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold h-20 resize-none"
                                    placeholder="Current Residence..."
                                    value={formData.clientAddress}
                                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Package</label>
                                    <select
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold appearance-none"
                                        value={formData.packageId}
                                        onChange={(e) => {
                                            const pkgId = e.target.value;
                                            const pkg = packages.find(p => p.id == pkgId);
                                            setFormData({
                                                ...formData,
                                                packageId: pkgId,
                                                totalAmount: pkg ? pkg.price : formData.totalAmount
                                            });
                                        }}
                                    >
                                        <option value="">Choose Package</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Budget (Rp)</label>
                                    <input
                                        type="number" required
                                        className="w-full bg-[#F0F7FF] text-blue-600 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black"
                                        placeholder="0"
                                        value={formData.totalAmount || ""}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value === "" ? "" : Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Special Notes</label>
                                <textarea
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium h-32 resize-none"
                                    placeholder="Add any specific requirements or details..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold font-black shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedPreviewBooking && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 text-[#2D2D2D]">
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setSelectedPreviewBooking(null)}></div>
                    <div className="relative bg-[#FDFBF7] rounded-[40px] md:rounded-[56px] w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 md:p-14 shadow-2xl border border-white no-scrollbar">
                        <div className="flex justify-between items-start mb-8 md:mb-12">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-jenggala-gold/10 text-jenggala-gold px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Client View Preview
                                    </span>
                                    {!selectedPreviewBooking.isPublished && (
                                        <span className="bg-stone-200 text-stone-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Not Published Yet
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-stone-900 mb-2">{selectedPreviewBooking.package?.name || 'Custom Package'}</h2>
                                <p className="text-stone-400 font-medium">Project breakdown for <span className="text-stone-900">{selectedPreviewBooking.clientName}</span></p>
                            </div>
                            <button onClick={() => setSelectedPreviewBooking(null)} className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-100 hover:rotate-90 transition-all duration-500 shrink-0 text-stone-400 hover:text-stone-900">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                            <div className="lg:col-span-7 xl:col-span-8 space-y-12">
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Project Profile</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm">
                                            <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Client Name</p>
                                            <p className="text-lg font-black text-stone-900">{selectedPreviewBooking.clientName}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm">
                                            <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Event Date</p>
                                            <p className="text-lg font-black text-stone-900">
                                                {new Date(selectedPreviewBooking.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </p>
                                            <p className="text-xs font-bold text-orange-500 mt-1 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> {selectedPreviewBooking.status}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <PackageIcon size={20} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Vendor Assignments</h3>
                                        </div>
                                        <span className="text-[10px] font-black text-stone-300 uppercase bg-stone-50 px-3 py-1 rounded-full">
                                            {selectedPreviewBooking.vendors?.length || 0} Vendors
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedPreviewBooking.vendors?.length > 0 ? (
                                            <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-stone-50/50 border-b border-stone-100">
                                                            <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Category</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Vendor</th>
                                                            <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Inclusions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-stone-50">
                                                        {selectedPreviewBooking.vendors.map((vendor, vidx) => (
                                                            <tr key={vidx} className="hover:bg-stone-50/50 transition-colors">
                                                                <td className="px-6 py-6 align-top">
                                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter bg-orange-50 px-2 py-1 rounded-md">{vendor.category}</span>
                                                                </td>
                                                                <td className="px-6 py-6 align-top">
                                                                    <span className="text-sm font-black text-stone-800 break-words block">{vendor.vendorName}</span>
                                                                    <span className="md:hidden text-xs text-stone-400 mt-1 block">{vendor.packageIncludes}</span>
                                                                </td>
                                                                <td className="hidden md:table-cell px-6 py-6 align-top">
                                                                    <p className="text-xs font-medium text-stone-500 whitespace-pre-line leading-relaxed italic">{vendor.packageIncludes || '-'}</p>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center bg-stone-50 rounded-[40px] border-2 border-dashed border-stone-100">
                                                <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">No vendors assigned yet</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                            <Clock size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Timeline</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedPreviewBooking.preparation?.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedPreviewBooking.preparation.sort((a, b) => new Date(a.date) - new Date(b.date)).map((prep, pidx) => (
                                                    <div key={pidx} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex flex-col items-center justify-center text-stone-800 shrink-0">
                                                            <span className="text-[9px] font-black uppercase opacity-30">{new Date(prep.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                            <span className="text-lg font-black">{new Date(prep.date).getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-stone-800 text-sm mb-1">{prep.agenda}</h4>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                                                                <p className="text-[10px] font-bold text-orange-500 flex items-center gap-1">{prep.location || 'Location TBA'}</p>
                                                            </div>
                                                            {prep.notes && <p className="text-[10px] text-stone-400 italic">"{prep.notes}"</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center bg-stone-50 rounded-[40px] border-2 border-dashed border-stone-100">
                                                <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">No preparation milestones yet</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="lg:col-span-5 xl:col-span-4 space-y-10">
                                <section className="bg-stone-900 text-white rounded-[48px] p-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                                                <FileText size={16} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Financials</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Total Package</p>
                                                <p className="text-2xl font-black italic">Rp {Number(selectedPreviewBooking.totalAmount).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Down Payment</p>
                                                <p className="text-2xl font-black text-blue-400">Rp {Number(selectedPreviewBooking.dpAmount || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="pt-6 border-t border-white/10">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 text-red-400">Remaining</p>
                                                <p className="text-3xl font-black text-red-500">Rp {Number(selectedPreviewBooking.totalAmount - (selectedPreviewBooking.dpAmount || 0)).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 mb-6 ml-1">Included in Package</h3>
                                    <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
                                        <h4 className="text-xl font-black text-stone-800 mb-6">{selectedPreviewBooking.package?.name}</h4>
                                        {selectedPreviewBooking.items && selectedPreviewBooking.items.length > 0 ? (
                                            <ul className="space-y-4">
                                                {selectedPreviewBooking.items.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-stone-50/50 border border-stone-100/50 text-[11px] font-bold text-stone-600">
                                                        <CheckCircle2 size={14} className={`${item.isCustom ? 'text-blue-500' : 'text-green-500'} shrink-0 mt-0.5`} />
                                                        <div className="flex-1">
                                                            <span>{item.name}</span>
                                                            {item.isCustom && <span className="ml-2 text-[8px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Custom Item</span>}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <ul className="space-y-4">
                                                {((selectedPreviewBooking.notes || selectedPreviewBooking.package?.features)?.split(',') || []).map((feat, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-stone-600">
                                                        <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                                                        {feat.trim()}
                                                    </li>
                                                ))}
                                                {!(selectedPreviewBooking.notes || selectedPreviewBooking.package?.features) && (
                                                    <li className="text-[11px] text-stone-400 italic">No specific features listed.</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className={`flex items-center gap-4 px-8 py-4 rounded-[28px] shadow-2xl border backdrop-blur-md ${toast.type === 'success'
                        ? 'bg-white/90 border-green-100 text-stone-900'
                        : 'bg-red-50/90 border-red-100 text-red-600'
                        }`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Notification</span>
                            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => setToast({ ...toast, show: false })}
                            className="ml-4 p-2 hover:bg-stone-100 rounded-xl transition-colors"
                        >
                            <X size={16} className="opacity-20" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus, X, Save, ArrowLeft, Calendar, MapPin,
    CreditCard, LayoutDashboard, User, ListChecks,
    Trash2, ExternalLink, Send, SendHorizontal,
    CheckCircle2, Bell, AlertCircle, ChevronDown,
    Globe, Eye, Pencil, Clock
} from "lucide-react";

export default function BookingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Form states
    const [vendors, setVendors] = useState([]);
    const [preparation, setPreparation] = useState([]);
    const [items, setItems] = useState([]);
    const [masterServices, setMasterServices] = useState([]);
    const [formData, setFormData] = useState({
        location: '',
        dpAmount: 0,
        invoiceUrl: '',
        totalAmount: 0,
        eventDate: '',
        status: '',
        isPublished: false
    });

    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [currentVendorIndex, setCurrentVendorIndex] = useState(-1);
    const [vendorFormData, setVendorFormData] = useState({ category: '', vendorName: '', packageIncludes: '', notes: '', price: 0 });
    const [isSending, setIsSending] = useState(false);

    // Preparation Modal State
    const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
    const [currentPrepIndex, setCurrentPrepIndex] = useState(-1);
    const [prepFormData, setPrepFormData] = useState({ agenda: '', date: '', location: '', pendamping: '', notes: '' });

    const openPrepModal = (index = -1) => {
        setCurrentPrepIndex(index);
        if (index >= 0) {
            setPrepFormData({ ...preparation[index] });
        } else {
            setPrepFormData({
                agenda: '',
                date: new Date().toISOString().split('T')[0],
                time: '',
                location: '',
                pendamping: '',
                notes: ''
            });
        }
        setIsPrepModalOpen(true);
    };

    const savePrepFromModal = () => {
        if (!prepFormData.agenda) {
            showToast("Please enter an agenda name", "error");
            return;
        }

        const newPrep = [...preparation];
        if (currentPrepIndex >= 0) {
            newPrep[currentPrepIndex] = prepFormData;
        } else {
            newPrep.push(prepFormData);
        }
        setPreparation(newPrep);
        setIsPrepModalOpen(false);
        // Autosave to prevent data loss
        handleSave({ preparation: newPrep, skipFetch: true });
        showToast(currentPrepIndex >= 0 ? "Agenda updated" : "Agenda added");
    };

    const openVendorModal = (index = -1) => {
        setCurrentVendorIndex(index);
        if (index >= 0) {
            setVendorFormData({ ...vendors[index] });
        } else {
            setVendorFormData({ category: '', vendorName: '', packageIncludes: '', notes: '', price: 0 });
        }
        setIsVendorModalOpen(true);
    };

    const saveVendorFromModal = () => {
        // Validate?
        if (!vendorFormData.category) {
            showToast("Please select a category", "error");
            return;
        }

        const newVendors = [...vendors];
        if (currentVendorIndex >= 0) {
            newVendors[currentVendorIndex] = vendorFormData;
        } else {
            newVendors.push(vendorFormData);
        }
        setVendors(newVendors);
        setIsVendorModalOpen(false);
        // Autosave to prevent data loss
        handleSave({ vendors: newVendors, skipFetch: true });
        showToast(currentVendorIndex >= 0 ? "Vendor updated" : "Vendor added");
    };

    useEffect(() => {
        fetchBooking();
        fetchMasterData();
    }, [id]);

    const fetchMasterData = async () => {
        try {
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                setMasterServices(data);
            }
        } catch (err) {
            console.error("Failed to fetch master items", err);
        }
    };

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/bookings/${id}`);
            if (res.ok) {
                const data = await res.json();
                setBooking(data);
                setVendors(data.vendors || []);
                setPreparation(data.preparation || []);
                setItems(data.items || []);
                setFormData({
                    location: data.location || '',
                    dpAmount: data.dpAmount || 0,
                    invoiceUrl: data.invoiceUrl || '',
                    totalAmount: data.totalAmount || 0,
                    eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split('T')[0] : '',
                    status: data.status || '',
                    isPublished: data.isPublished || false
                });
            }
        } catch (err) {
            console.error("Failed to fetch booking", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVendor = () => {
        openVendorModal(-1);
    };

    const handleRemoveVendor = (index) => {
        const newVendors = vendors.filter((_, i) => i !== index);
        setVendors(newVendors);
        // Autosave removal
        handleSave({ vendors: newVendors, skipFetch: true });
    };

    const handleVendorChange = (index, field, value) => {
        const newVendors = [...vendors];
        newVendors[index][field] = value;
        setVendors(newVendors);
        // Autosave change
        handleSave({ vendors: newVendors, skipFetch: true });
    };

    const handleAddPrep = () => {
        openPrepModal(-1);
    };

    const handleRemovePrep = (index) => {
        const newPrep = preparation.filter((_, i) => i !== index);
        setPreparation(newPrep);
        // Autosave removal
        handleSave({ preparation: newPrep, skipFetch: true });
    };

    const handlePrepChange = (index, field, value) => {
        const newPrep = [...preparation];
        newPrep[index][field] = value;
        setPreparation(newPrep);
        // Autosave change
        handleSave({ preparation: newPrep, skipFetch: true });
    };

    const handleSave = async (options = {}) => {
        try {
            setIsSaving(true);
            const dataToSave = {
                ...formData,
                vendors: options.vendors !== undefined ? options.vendors : vendors,
                preparation: options.preparation !== undefined ? options.preparation : preparation,
                items: options.items !== undefined ? options.items : items,
                ...(options.overrideData || {})
            };
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSave)
            });
            if (res.ok) {
                showToast(options.message || (dataToSave.isPublished ? "Project published to client dashboard!" : "Project changes saved successfully!"));
                if (!options.skipFetch) fetchBooking();
                if (options.overrideData) {
                    setFormData(prev => ({ ...prev, ...options.overrideData }));
                    setBooking(prev => ({ ...prev, ...options.overrideData }));
                }
            }
        } catch (err) {
            console.error("Error saving booking", err);
            showToast("Failed to preserve data changes", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Custom Dropdown Component for Premium UI
    const CustomDropdown = ({ value, options, onChange, placeholder, disabled, label }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">{label}</label>
                <div className="relative">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full bg-white border border-gray-100 p-4 pr-10 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all flex items-center justify-between font-bold text-gray-800 shadow-sm hover:border-black/20 ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span className={!value ? 'text-gray-300' : 'text-gray-800'}>
                            {value || placeholder}
                        </span>
                        <ChevronDown className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : ''}`} size={16} />
                    </button>

                    {isOpen && !disabled && (
                        <>
                            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-[24px] shadow-2xl z-[101] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-[250px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                    {options.map((opt, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt.value);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${value === opt.value ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            {opt.label}
                                            {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="w-10 h-10 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Loading project details...</p>
        </div>
    );

    if (!booking) return <div className="p-10 text-center font-bold">Booking not found</div>;

    const totalVendorPrice = vendors.reduce((sum, v) => sum + (parseFloat(v.price) || 0), 0);
    const remainingBalance = formData.totalAmount - formData.dpAmount;
    const projectProfit = formData.totalAmount - totalVendorPrice;

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-[#2D2D2D]">Project Sheet</h1>
                        <p className="text-gray-400 text-sm">Manage vendors, timeline and finance for <span className="text-black font-bold">{booking.clientName}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const nextStatus = !formData.isPublished;
                            const message = nextStatus
                                ? "Project published! Visible to client."
                                : "Project unpublished. Hidden from client.";

                            handleSave({
                                overrideData: { isPublished: nextStatus },
                                message: message,
                                skipFetch: true
                            });
                        }}
                        disabled={isSaving}
                        className={`group relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl transition-all duration-500 font-black border-2 overflow-hidden ${formData.isPublished
                            ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:scale-105'
                            : 'bg-stone-50 text-stone-400 border-stone-100 hover:border-black hover:text-black hover:scale-105 active:scale-95'}`}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : formData.isPublished ? (
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Globe size={18} className="animate-pulse" />
                                    <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping scale-150"></div>
                                </div>
                                <span>Published</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                <span>Publish to Client</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Side: Client & Finance */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Client Info */}
                    <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#2D2D2D]">Client Data</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Status</label>
                                <select
                                    className="w-full bg-gray-50 border-0 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-black"
                                    value={formData.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        setFormData({ ...formData, status: newStatus });
                                        handleSave({ overrideData: { status: newStatus }, skipFetch: true });
                                    }}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Event Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border-0 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-black"
                                    value={formData.eventDate}
                                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                    onBlur={() => handleSave({ skipFetch: true })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Venue Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Balcony Hotel"
                                    className="w-full bg-gray-50 border-0 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-black"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    onBlur={() => handleSave({ skipFetch: true })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Finance Card */}
                    <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#2D2D2D]">Financials</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Total Package Price</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border-0 p-3 rounded-xl font-black text-lg text-black outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.totalAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    onBlur={() => handleSave({ skipFetch: true })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Down Payment (DP)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border-0 p-3 rounded-xl font-black text-lg text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.dpAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, dpAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    onBlur={() => handleSave({ skipFetch: true })}
                                />
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Vendor Cost</p>
                                <p className="text-xl font-black text-black">Rp {totalVendorPrice.toLocaleString()}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Estimated Profit</p>
                                <p className={`text-xl font-black ${projectProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Rp {projectProfit.toLocaleString()}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Remaining Balance</p>
                                <p className="text-2xl font-black text-red-500">Rp {remainingBalance.toLocaleString()}</p>
                            </div>
                            <div className="pt-4">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-3">Invoice Actions</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => router.push(`/admin/bookings/${id}/invoice`)}
                                        className="bg-black text-white p-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-black/10"
                                    >
                                        <Eye size={14} /> Preview
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setIsSending(true);
                                            try {
                                                // Update booking to published status
                                                const res = await fetch(`/api/bookings/${id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ isPublished: true })
                                                });

                                                if (res.ok) {
                                                    setToast({ show: true, message: 'Invoice sent to client dashboard!', type: 'success' });
                                                    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
                                                    // Refresh booking data
                                                    const updatedBooking = await res.json();
                                                    setBooking(updatedBooking);
                                                } else {
                                                    setToast({ show: true, message: 'Failed to send invoice', type: 'error' });
                                                    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
                                                }
                                            } catch (error) {
                                                console.error('Error sending invoice:', error);
                                                setToast({ show: true, message: 'Error sending invoice', type: 'error' });
                                                setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
                                            } finally {
                                                setIsSending(false);
                                            }
                                        }}
                                        disabled={isSending}
                                        className={`bg-green-500 text-white p-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-green-500/10 disabled:opacity-70 disabled:cursor-not-allowed ${isSending ? 'animate-pulse' : ''}`}
                                    >
                                        {isSending ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <SendHorizontal size={14} /> Send to Client
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-2 italic">Client can view & download invoice from their dashboard</p>
                            </div>
                        </div>
                    </section>
                    {/* Items & Customizations Section */}
                    <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <ListChecks size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#2D2D2D]">Additional Items</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {items.length === 0 ? (
                                <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold">No custom items added by client yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {items.filter(item => item.isCustom).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50 group transition-all hover:bg-blue-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                                <span className="font-bold text-sm text-[#2D2D2D]">{item.name}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const realIndex = items.findIndex(i => i === item);
                                                    const newItems = items.filter((_, i) => i !== realIndex);
                                                    setItems(newItems);
                                                    handleSave({ items: newItems, skipFetch: true });
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 flex gap-2">
                                <input
                                    id="admin-new-item"
                                    type="text"
                                    className="flex-1 bg-gray-50 border-0 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Add manual item..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            const newItems = [...items, { name: e.target.value.trim(), isCustom: true }];
                                            setItems(newItems);
                                            handleSave({ items: newItems, skipFetch: true });
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('admin-new-item');
                                        if (input && input.value.trim()) {
                                            const newItems = [...items, { name: input.value.trim(), isCustom: true }];
                                            setItems(newItems);
                                            handleSave({ items: newItems, skipFetch: true });
                                            input.value = '';
                                        }
                                    }}
                                    className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Main: Vendors & Preparation */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Vendors Section */}
                    <section className="bg-white rounded-[48px] p-8 md:p-12 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <LayoutDashboard size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#2D2D2D]">Vendor List</h3>
                                    <p className="text-xs text-gray-400">Map out the vendors involved in this project.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddVendor}
                                className="flex items-center gap-2 bg-gray-50 text-black px-5 py-3 rounded-2xl font-black text-xs hover:bg-black hover:text-white transition-all border border-gray-100"
                            >
                                <Plus size={16} /> Add Vendor
                            </button>
                        </div>

                        <div className="space-y-4">
                            {vendors.length === 0 ? (
                                <div className="py-20 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100 group">
                                    <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-4 text-gray-200 group-hover:scale-110 transition-transform">
                                        <LayoutDashboard size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No vendors assigned yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <div className="col-span-2">Category</div>
                                        <div className="col-span-4">Vendor Name</div>
                                        <div className="col-span-2 text-center">Cost</div>
                                        <div className="col-span-2 text-center">Status</div>
                                        <div className="col-span-2 text-right">Actions</div>
                                    </div>

                                    {vendors.map((vendor, idx) => (
                                        <div key={idx} className="group grid grid-cols-12 items-center px-8 py-6 bg-gray-50/50 rounded-[32px] border border-transparent hover:border-black/5 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                                            <div className="col-span-2">
                                                <span className="inline-flex px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm">
                                                    {vendor.category}
                                                </span>
                                            </div>
                                            <div className="col-span-4">
                                                <p className="font-black text-[#2D2D2D] text-sm group-hover:text-black transition-colors">{vendor.vendorName || 'Custom Vendor'}</p>
                                                {vendor.packageIncludes && (
                                                    <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5 max-w-[200px] italic">
                                                        {vendor.packageIncludes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <p className="text-xs font-black text-gray-900 bg-gray-100/50 px-3 py-1.5 rounded-lg inline-block">
                                                    Rp {(parseFloat(vendor.price) || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                {vendor.isConfirmed ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm shadow-green-100/30">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                        Confirmed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm shadow-red-100/30">
                                                        <Clock size={10} />
                                                        Not Selected
                                                    </span>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openVendorModal(idx)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveVendor(idx)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Vendor Modal */}
                    {isVendorModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsVendorModalOpen(false)}></div>
                            <div className="relative bg-white rounded-[40px] w-full max-w-2xl p-8 md:p-12 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <LayoutDashboard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-[#2D2D2D]">
                                                {currentVendorIndex >= 0 ? 'Edit Vendor' : 'Add Vendor'}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-medium">Map out the vendor details.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsVendorModalOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CustomDropdown
                                            label="Category"
                                            placeholder="Select Category"
                                            value={vendorFormData.category}
                                            options={masterServices.map(s => ({ value: s.name || s.title, label: s.name || s.title }))}
                                            onChange={(newVal) => {
                                                setVendorFormData(prev => ({ ...prev, category: newVal, vendorName: '' }));
                                            }}
                                        />
                                        <CustomDropdown
                                            label="Items / Vendor Detail"
                                            placeholder="Select Item"
                                            disabled={!vendorFormData.category}
                                            value={vendorFormData.vendorName}
                                            options={[
                                                ...(masterServices
                                                    .find(s => s.name === vendorFormData.category || s.title === vendorFormData.category)
                                                    ?.items.map(item => ({ value: item.name, label: item.name })) || []),
                                                { value: "Custom Vendor", label: "Custom Vendor / Input" }
                                            ]}
                                            onChange={(itemName) => {
                                                const currentService = masterServices.find(s => s.name === vendorFormData.category || s.title === vendorFormData.category);
                                                let desc = '';
                                                if (currentService) {
                                                    const item = currentService.items.find(i => i.name === itemName);
                                                    if (item) desc = item.description || '';
                                                }
                                                setVendorFormData(prev => ({ ...prev, vendorName: itemName, packageIncludes: desc }));
                                            }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Vendor Price / Cost</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-full bg-gray-50 pl-12 p-4 rounded-2xl border border-transparent text-sm font-black outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all"
                                                    value={vendorFormData.price || ''}
                                                    onChange={(e) => setVendorFormData({ ...vendorFormData, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Include Paket</label>
                                            <textarea
                                                placeholder="What's included in their package?"
                                                className="w-full bg-gray-50 p-4 rounded-2xl border border-transparent text-sm font-medium outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black h-14 resize-none transition-all"
                                                value={vendorFormData.packageIncludes || ''}
                                                onChange={(e) => setVendorFormData({ ...vendorFormData, packageIncludes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Notes / Keterangan</label>
                                        <textarea
                                            placeholder="Any special instructions or progress..."
                                            className="w-full bg-gray-50 p-4 rounded-2xl border border-transparent text-sm font-medium outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black h-20 resize-none transition-all"
                                            value={vendorFormData.notes || ''}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsVendorModalOpen(false)}
                                            className="px-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveVendorFromModal}
                                            className="px-8 py-4 bg-black text-white rounded-2xl font-black shadow-lg shadow-black/20 hover:scale-105 transition-transform"
                                        >
                                            {currentVendorIndex >= 0 ? 'Save Changes' : 'Add Vendor'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preparation Section */}
                    <section className="bg-white rounded-[48px] p-8 md:p-12 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <ListChecks size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#2D2D2D]">Preparation Schedule</h3>
                                    <p className="text-xs text-gray-400">Important dates leading up to the main event.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddPrep}
                                className="flex items-center gap-2 bg-gray-50 text-black px-5 py-3 rounded-2xl font-black text-xs hover:bg-black hover:text-white transition-all border border-gray-100"
                            >
                                <Plus size={16} /> Add Agenda
                            </button>
                        </div>

                        <div className="space-y-4">
                            {preparation.length === 0 ? (
                                <div className="py-12 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No agenda items added</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100/50 border-b border-gray-200/50">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agenda</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {preparation.map((prep, idx) => (
                                                <tr key={idx} className="hover:bg-white transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-sm text-[#2D2D2D]">{prep.agenda || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <p className="text-xs text-gray-900 font-bold whitespace-nowrap">
                                                                {prep.date ? new Date(prep.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </p>
                                                            {prep.time && (
                                                                <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block w-fit mt-1">
                                                                    {prep.time}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-6 py-4">
                                                        <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{prep.location || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openPrepModal(idx)}
                                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-amber-500 hover:border-amber-200 transition-colors"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemovePrep(idx)}
                                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Preparation Modal */}
                    {isPrepModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsPrepModalOpen(false)}></div>
                            <div className="relative bg-white rounded-[40px] w-full max-w-2xl p-8 md:p-12 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                            <ListChecks size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-[#2D2D2D]">
                                                {currentPrepIndex >= 0 ? 'Edit Agenda' : 'Add Agenda'}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-medium">Schedule the preparation steps.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsPrepModalOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">Agenda / Meeting Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Food Tasting, Site Visit"
                                                className="w-full bg-gray-50 border border-transparent p-4 rounded-2xl font-black text-lg outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all shadow-sm"
                                                value={prepFormData.agenda || ''}
                                                onChange={(e) => setPrepFormData({ ...prepFormData, agenda: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">Scheduled Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-50 border border-transparent p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all shadow-sm h-[60px]"
                                                value={prepFormData.date ? new Date(prepFormData.date).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setPrepFormData({ ...prepFormData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">Waktu / Jam</label>
                                            <input
                                                type="time"
                                                className="w-full bg-gray-50 border border-transparent p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all shadow-sm h-[60px]"
                                                value={prepFormData.time || ''}
                                                onChange={(e) => setPrepFormData({ ...prepFormData, time: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">Location</label>
                                            <input
                                                type="text"
                                                placeholder="Where?"
                                                className="w-full bg-gray-50 border border-transparent p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all shadow-sm h-[60px]"
                                                value={prepFormData.location || ''}
                                                onChange={(e) => setPrepFormData({ ...prepFormData, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">Pendamping Team</label>
                                            <input
                                                type="text"
                                                placeholder="Who will assist?"
                                                className="w-full bg-gray-50 border border-transparent p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all shadow-sm"
                                                value={prepFormData.pendamping || ''}
                                                onChange={(e) => setPrepFormData({ ...prepFormData, pendamping: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block ml-1">Notes / Keterangan</label>
                                            <input
                                                type="text"
                                                placeholder="Any special notes?"
                                                className="w-full bg-gray-50 border border-transparent p-4 rounded-2xl font-medium text-sm outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black transition-all shadow-sm"
                                                value={prepFormData.notes || ''}
                                                onChange={(e) => setPrepFormData({ ...prepFormData, notes: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsPrepModalOpen(false)}
                                            className="px-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={savePrepFromModal}
                                            className="px-8 py-4 bg-black text-white rounded-2xl font-black shadow-lg shadow-black/20 hover:scale-105 transition-transform"
                                        >
                                            {currentPrepIndex >= 0 ? 'Save Changes' : 'Add Agenda'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Toast Notification */}
            {
                toast.show && (
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
                )
            }
        </div>
    );
}


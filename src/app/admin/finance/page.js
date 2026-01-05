"use client";
import { useState, useEffect } from "react";
import { Plus, X, ArrowUpRight, ArrowDownRight, Wallet, Filter, Search, MoreHorizontal, Calendar } from "lucide-react";

export default function FinancePage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'INCOME',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/finance");
            if (res.ok) {
                const data = await res.json();
                setTransactions(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/finance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                }),
            });
            if (res.ok) {
                setShowModal(false);
                fetchTransactions();
                setFormData({
                    type: 'INCOME',
                    category: '',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                });
            }
        } catch (err) {
            console.error("Error saving transaction", err);
        }
    };

    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const balance = totalIncome - totalExpenses;

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">Finance</h1>
                    <p className="text-gray-400 text-sm">Track your business revenue and expenses.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 md:py-3 rounded-2xl md:rounded-full hover:scale-105 transition-transform font-bold shadow-lg shadow-black/10 w-full md:w-auto"
                >
                    <Plus size={20} />
                    Add Transaction
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Total Balance Card */}
                <div className="bg-black text-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Current Balance</p>
                        <h2 className="text-2xl md:text-3xl font-black">Rp {balance.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Total Income Card */}
                <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100/50 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                            <ArrowUpRight size={20} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Income</p>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#2D2D2D]">Rp {totalIncome.toLocaleString()}</h2>
                </div>

                {/* Total Expense Card */}
                <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100/50 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                            <ArrowDownRight size={20} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Expenses</p>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#2D2D2D]">Rp {totalExpenses.toLocaleString()}</h2>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-xl">Recent Transactions</h3>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text" placeholder="Search..."
                                className="bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none w-full sm:w-48 font-medium transition-all"
                            />
                        </div>
                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-black transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-medium">Processing records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Date</th>
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Description</th>
                                    <th className="hidden lg:table-cell px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Category</th>
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Amount</th>
                                    <th className="px-6 md:px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.length > 0 ? (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm font-bold text-[#2D2D2D]">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span className="hidden sm:inline">{new Date(t.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                                    <span className="sm:hidden">{new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6">
                                                <p className="text-sm font-bold text-[#2D2D2D] line-clamp-1">{t.description}</p>
                                                <span className="lg:hidden text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t.category}</span>
                                            </td>
                                            <td className="hidden lg:table-cell px-8 py-6 text-sm">
                                                <span className="bg-[#F7F4EF] px-3 py-1 rounded-full text-[11px] font-bold text-[#2D2D2D] uppercase tracking-wider">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className={`px-6 md:px-8 py-6 text-right font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="hidden sm:inline">{t.type === 'INCOME' ? '+' : '-'} Rp </span>{(t.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 md:px-8 py-6">
                                                <div className="flex justify-center">
                                                    <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all shadow-sm">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                                                <Wallet size={48} />
                                                <p className="font-bold text-gray-600">No transactions recorded</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-md p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-[#2D2D2D]">Track Finance</h2>
                                <p className="text-sm text-gray-400">Record a new income or expense.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                                        className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.type === 'INCOME' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                                        className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.type === 'EXPENSE' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        Expense
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (Rp)</label>
                                <input
                                    type="number" required
                                    className={`w-full border-0 p-4 rounded-2xl focus:ring-2 outline-none transition-all font-black ${formData.type === 'INCOME' ? 'bg-green-50 text-green-600 focus:ring-green-500' : 'bg-red-50 text-red-600 focus:ring-red-500'}`}
                                    placeholder="0"
                                    value={formData.amount || ""}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value === "" ? "" : Number(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <input
                                    type="text" required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    placeholder="e.g. Catering, Venue, Ads"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                                <input
                                    type="date" required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium h-24 resize-none"
                                    placeholder="Additional details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold font-black shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon, Wallet, Plus, ChevronDown, Check, X, Target, TrendingUp, ArrowUpRight, CheckCircle2, Clock, XCircle, Globe, Package as Box, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";

function DashboardContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q')?.toLowerCase() || '';
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [stats, setStats] = useState({
        packages: 0,
        testimonials: 0,
        bookings: 0,
        income: 0,
        balance: 0,
        recentBookings: [],
        allBookings: [],
        packageStats: [],
        packagesData: [],
        packagesGroups: [],
        groupStats: []
    });
    const [growthView, setGrowthView] = useState('packages'); // 'packages' or 'groups'
    const [revenueView, setRevenueView] = useState('packages'); // 'packages' or 'groups'
    const [targets, setTargets] = useState({
        clientGoal: 50,
        revenueGoal: 150000000
    });
    const [loading, setLoading] = useState(true);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState('global');
    const [tempTargets, setTempTargets] = useState({ ...targets });
    const [timePeriod, setTimePeriod] = useState('this-month');
    const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

    const [viewDate, setViewDate] = useState(new Date());

    // Time period options
    const timePeriods = [
        { value: 'this-week', label: 'This Week' },
        { value: 'last-week', label: 'Last Week' },
        { value: 'this-month', label: 'This Month' },
        { value: 'last-month', label: 'Last Month' },
        { value: 'this-year', label: 'This Year' },
        { value: 'last-year', label: 'Last Year' },
    ];

    // Get date range based on selected period
    const getDateRange = (period) => {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'this-week':
                const dayOfWeek = now.getDay();
                const monday = new Date(now);
                monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                monday.setHours(0, 0, 0, 0);
                startDate = monday;
                endDate = new Date();
                break;

            case 'last-week':
                const lastMonday = new Date(now);
                const currentDay = now.getDay();
                lastMonday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) - 7);
                lastMonday.setHours(0, 0, 0, 0);
                const lastSunday = new Date(lastMonday);
                lastSunday.setDate(lastMonday.getDate() + 6);
                lastSunday.setHours(23, 59, 59, 999);
                startDate = lastMonday;
                endDate = lastSunday;
                break;

            case 'this-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date();
                break;

            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;

            case 'this-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date();
                break;

            case 'last-year':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
                break;

            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date();
        }

        return { startDate, endDate };
    };

    useEffect(() => {
        if (selectedPackageId === 'global') {
            setTempTargets({ clientGoal: targets.clientGoal, revenueGoal: targets.revenueGoal });
        } else if (typeof selectedPackageId === 'string' && selectedPackageId.startsWith('group-')) {
            const groupId = parseInt(selectedPackageId.replace('group-', ''));
            const group = stats.packagesGroups.find(g => g.id === groupId);
            if (group) {
                const groupPkgs = stats.packagesData.filter(p => String(p.groupId) === String(group.id));
                const aggBookingGoal = groupPkgs.reduce((sum, p) => sum + (p.bookingGoal || 0), 0);
                const aggRevenueGoal = groupPkgs.reduce((sum, p) => sum + (p.revenueGoal || 0), 0);

                setTempTargets({
                    clientGoal: group.bookingGoal || aggBookingGoal,
                    revenueGoal: group.revenueGoal || aggRevenueGoal
                });
            }
        } else {
            const pkg = stats.packagesData.find(p => p.id === parseInt(selectedPackageId));
            if (pkg) {
                setTempTargets({ clientGoal: pkg.bookingGoal || 0, revenueGoal: pkg.revenueGoal || 0 });
            }
        }
    }, [selectedPackageId, showGoalModal, targets, stats.packagesData, stats.packagesGroups]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleString('default', { month: 'long' });

    const fetchAllData = async () => {
        try {
            const [pkgsRaw, testsRaw, bksRaw, finsRaw, settingsRaw, groupsRaw] = await Promise.all([
                fetch("/api/packages").then(r => r.json()).catch(() => []),
                fetch("/api/testimonials").then(r => r.json()).catch(() => []),
                fetch("/api/bookings").then(r => r.json()).catch(() => []),
                fetch("/api/finance").then(r => r.json()).catch(() => []),
                fetch("/api/settings").then(r => r.json()).catch(() => ({})),
                fetch("/api/service-groups").then(r => r.json()).catch(() => [])
            ]);

            const pkgs = Array.isArray(pkgsRaw) ? pkgsRaw : [];
            const allBookings = Array.isArray(bksRaw) ? bksRaw : [];
            const fins = Array.isArray(finsRaw) ? finsRaw : [];

            // Get date range for selected period
            const { startDate, endDate } = getDateRange(timePeriod);

            // Filter bookings by selected time period
            const bks = allBookings.filter(b => {
                const bookingDate = new Date(b.createdAt);
                return bookingDate >= startDate && bookingDate <= endDate;
            });

            // Filter finance by selected time period
            const filteredFins = fins.filter(f => {
                const finDate = new Date(f.createdAt);
                return finDate >= startDate && finDate <= endDate;
            });

            const totalIncome = filteredFins
                .filter(t => t && t.type === 'INCOME')
                .reduce((sum, t) => sum + (t.amount || 0), 0);

            const totalExpenses = filteredFins
                .filter(t => t && t.type === 'EXPENSE')
                .reduce((sum, t) => sum + (t.amount || 0), 0);

            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            setStats({
                packages: pkgs.length,
                testimonials: testsRaw.length || 0,
                bookings: bks.length,
                income: totalIncome,
                balance: totalIncome - totalExpenses,
                recentBookings: bks.slice(0, 4),
                allBookings: allBookings,
                packagesData: pkgs,
                packagesGroups: Array.isArray(groupsRaw) ? groupsRaw : [],
                packageStats: pkgs.map(pkg => {
                    const pkgBookings = bks.filter(b => b.packageId === pkg.id);
                    const count = pkgBookings.length;
                    const revenue = pkgBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

                    const currentMonthCount = pkgBookings.filter(b => {
                        const d = new Date(b.createdAt);
                        return d >= currentMonthStart;
                    }).length;

                    const prevMonthCount = pkgBookings.filter(b => {
                        const d = new Date(b.createdAt);
                        return d >= prevMonthStart && d <= prevMonthEnd;
                    }).length;

                    let growth = 0;
                    if (prevMonthCount > 0) {
                        growth = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
                    } else if (currentMonthCount > 0) {
                        growth = 100;
                    }

                    // Calculate progress based on package goals
                    const bookingGoal = pkg.bookingGoal || 0;
                    const revenueGoal = pkg.revenueGoal || 0;

                    const bookingProgress = bookingGoal > 0 ? Math.min(100, Math.round((count / bookingGoal) * 100)) : 0;
                    const revenueProgress = revenueGoal > 0 ? Math.min(100, Math.round((revenue / revenueGoal) * 100)) : 0;

                    return {
                        ...pkg,
                        count,
                        revenue,
                        growth: Math.round(growth),
                        percent: bks.length > 0 ? Math.round((count / bks.length) * 100) : 0,
                        bookingProgress,
                        revenueProgress
                    };
                }).sort((a, b) => b.revenue - a.revenue),
                groupStats: (Array.isArray(groupsRaw) ? groupsRaw : []).map(group => {
                    const groupPkgs = pkgs.filter(p => String(p.groupId) === String(group.id));
                    const groupBookings = bks.filter(b => groupPkgs.some(p => String(p.id) === String(b.packageId)));
                    const count = groupBookings.length;
                    const revenue = groupBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                    const packageCount = groupPkgs.length;

                    // Growth goal: calculation from packages (sum of goals)
                    const bookingGoal = groupPkgs.reduce((sum, p) => sum + (p.bookingGoal || 0), 0);

                    // Revenue goal: aggregate from child packages
                    const revenueTarget = groupPkgs.reduce((sum, p) => sum + (p.revenueGoal || 0), 0);

                    // Month-over-month growth for group (from bookings)
                    const currentMonthCount = groupBookings.filter(b => {
                        const d = new Date(b.createdAt);
                        return d >= currentMonthStart;
                    }).length;

                    const prevMonthCount = groupBookings.filter(b => {
                        const d = new Date(b.createdAt);
                        return d >= prevMonthStart && d <= prevMonthEnd;
                    }).length;

                    let growth = 0;
                    if (prevMonthCount > 0) {
                        growth = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
                    } else if (currentMonthCount > 0) {
                        growth = 100;
                    }

                    const bookingProgress = bookingGoal > 0 ? Math.min(100, Math.round((count / bookingGoal) * 100)) : 0;
                    const revenueProgress = revenueTarget > 0 ? Math.min(100, Math.round((revenue / revenueTarget) * 100)) : 0;

                    return {
                        ...group,
                        count,
                        revenue,
                        growth: Math.round(growth),
                        packageCount,
                        bookingGoal,
                        revenueGoal: revenueTarget,
                        bookingProgress,
                        revenueProgress
                    };
                })
            });

            if (settingsRaw.client_goal || settingsRaw.revenue_goal) {
                const newTargets = {
                    clientGoal: parseInt(settingsRaw.client_goal) || 50,
                    revenueGoal: parseInt(settingsRaw.revenue_goal) || 150000000
                };
                setTargets(newTargets);
                setTempTargets(newTargets);
            }
        } catch (err) {
            console.error("Error fetching dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        const { startDate } = getDateRange(timePeriod);
        setViewDate(new Date(startDate));
    }, [timePeriod]);

    // Handle "set-goals" action from URL
    useEffect(() => {
        if (searchParams.get('action') === 'set-goals') {
            setShowGoalModal(true);
            // Clear the action from URL to prevent reopening on refresh
            const params = new URLSearchParams(window.location.search);
            params.delete('action');
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    const handleSaveGoals = async (e) => {
        e.preventDefault();
        try {
            if (selectedPackageId === 'global') {
                const res = await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        client_goal: tempTargets.clientGoal,
                        revenue_goal: tempTargets.revenueGoal
                    })
                });
                if (res.ok) {
                    setTargets({ ...tempTargets });
                    setShowGoalModal(false);
                    fetchAllData();
                }
            } else {
                // Save package targets
                const pkgId = parseInt(selectedPackageId);
                const pkg = stats.packagesData.find(p => p.id === pkgId);
                if (!pkg) return;

                const res = await fetch(`/api/packages/${pkgId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...pkg,
                        bookingGoal: tempTargets.clientGoal,
                        revenueGoal: tempTargets.revenueGoal
                    })
                });
                if (res.ok) {
                    setShowGoalModal(false);
                    fetchAllData();
                }
            }
        } catch (err) {
            console.error("Error saving goals", err);
        }
    };

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (month, year) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Calendar View Helpers
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    const viewMonthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const totalDays = daysInMonth(viewMonth, viewYear);
    const startPadding = startDayOfMonth(viewMonth, viewYear);

    const nextMonth = () => {
        setViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const prevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const getDayData = (day) => {
        const date = new Date(viewYear, viewMonth, day);
        date.setHours(0, 0, 0, 0);

        const dayBookings = stats.allBookings.filter(b => {
            const bDate = new Date(b.eventDate);
            bDate.setHours(0, 0, 0, 0);
            return bDate.getTime() === date.getTime();
        });

        if (dayBookings.length === 0) return null;

        // Priority for marking:
        if (dayBookings.some(b => b.status === 'COMPLETED')) return { type: 'COMPLETED' };
        if (dayBookings.some(b => b.status === 'CONFIRMED')) return { type: 'CONFIRMED' };
        if (dayBookings.some(b => b.status === 'PENDING')) return { type: 'PENDING' };
        if (dayBookings.some(b => b.status === 'CANCELLED')) return { type: 'CANCELLED' };

        return null;
    };

    const clientGrowthPercent = Math.min(100, Math.round((stats.bookings / targets.clientGoal) * 100)) || 0;
    const revenuePercent = Math.min(100, Math.round((stats.income / targets.revenueGoal) * 100)) || 0;

    const filteredPackageStats = stats.packageStats.filter(p => !q || p.name?.toLowerCase().includes(q));
    const filteredGroupStats = stats.groupStats.filter(g => !q || g.name?.toLowerCase().includes(q));
    const filteredRecentBookings = stats.recentBookings.filter(b => !q || b.clientName?.toLowerCase().includes(q));
    const filteredPackagesData = stats.packagesData.filter(p => !q || p.name?.toLowerCase().includes(q));

    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clientGrowthPercent / 100) * circumference;

    return (
        <div className="h-full pb-32 space-y-6 md:space-y-8">
            {/* Time Period Selector */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gradient-to-br from-white to-stone-50 rounded-[32px] p-6 md:p-8 shadow-sm border border-stone-100">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-stone-900 mb-1">Dashboard Overview</h2>
                    <p className="text-sm text-stone-400 font-medium">Monitor your business performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] hidden md:inline">Period:</span>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                            className="min-w-[200px] bg-white border-2 border-stone-100 px-6 py-3.5 rounded-2xl font-bold text-stone-800 text-sm hover:border-stone-900 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between gap-4 group"
                        >
                            <span>{timePeriods.find(p => p.value === timePeriod)?.label}</span>
                            <ChevronDown size={18} className={`text-stone-400 transition-transform duration-300 group-hover:text-stone-900 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isPeriodDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setIsPeriodDropdownOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-stone-100 z-[101] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    {timePeriods.map((period, idx) => (
                                        <button
                                            key={period.value}
                                            type="button"
                                            onClick={() => {
                                                setTimePeriod(period.value);
                                                setIsPeriodDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-all hover:bg-stone-50 flex items-center justify-between group ${timePeriod === period.value ? 'bg-stone-50 text-stone-900' : 'text-stone-600'
                                                } ${idx === 0 ? 'rounded-t-2xl' : ''} ${idx === timePeriods.length - 1 ? 'rounded-b-2xl' : ''}`}
                                        >
                                            <span>{period.label}</span>
                                            {timePeriod === period.value && (
                                                <Check size={16} className="text-stone-900" strokeWidth={3} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                {/* Left Column */}
                <div className="col-span-full md:col-span-8 flex flex-col gap-6 md:gap-8">
                    <div className="relative bg-[#D2C8B8] rounded-[48px] p-8 md:p-10 pb-14 md:pb-16 min-h-[400px] md:h-[420px] overflow-hidden flex flex-col shadow-2xl shadow-stone-200/50 group">
                        {/* Elegant background elements */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/30 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-stone-900/5 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="relative z-10 flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-stone-900 mb-1 tracking-tight">Monthly Insights</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-stone-900 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] font-black text-stone-600/60 uppercase tracking-[0.3em]">{timePeriods.find(p => p.value === timePeriod)?.label || 'Overview'}</p>
                                </div>
                            </div>
                            <div className="bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/40 text-stone-900">
                                <TrendingUp size={20} />
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 lg:gap-12 py-6">
                            {/* Packages Card */}
                            <div className="bg-stone-900 text-white w-32 h-32 md:w-36 md:h-36 rounded-[32px] flex flex-col items-center justify-center shadow-xl rotate-[-4deg] md:-translate-x-4 transition-all hover:rotate-0 hover:translate-x-0 hover:scale-105 duration-500 z-20 cursor-default group/card">
                                <Box size={20} className="mb-3 text-stone-500 group-hover/card:text-red-400 transition-colors" />
                                <span className="text-2xl font-black tracking-tight">{Number(stats.packages || 0)}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Packages</span>
                            </div>

                            {/* Income Card - Featured */}
                            <div className="bg-[#FFDE6B] text-stone-900 w-48 h-48 md:w-56 md:h-56 rounded-[48px] md:rounded-[56px] flex flex-col items-center justify-center shadow-2xl relative z-30 md:scale-110 border-4 border-[#D2C8B8] transform transition-all hover:scale-[1.15] duration-500 cursor-default group/card overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
                                <div className="p-4 bg-white/20 rounded-2xl mb-4 group-hover/card:bg-white/40 transition-colors">
                                    <Wallet size={24} />
                                </div>
                                <span className="text-xl md:text-2xl font-black px-6 text-center leading-tight tracking-tight relative z-10">
                                    Rp {Number(stats.income || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-2 relative z-10">Total Income</span>
                            </div>

                            {/* Bookings Card */}
                            <div className="bg-[#FF7D7D] text-stone-900 w-32 h-32 md:w-36 md:h-36 rounded-[32px] flex flex-col items-center justify-center shadow-xl rotate-[6deg] md:translate-x-4 transition-all hover:rotate-0 hover:translate-x-0 hover:scale-105 duration-500 z-20 cursor-default group/card">
                                <CalendarIcon size={20} className="mb-3 text-stone-900/30 group-hover/card:text-stone-900 transition-colors" />
                                <span className="text-2xl font-black tracking-tight">{Number(stats.bookings || 0)}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mt-1">Bookings</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex justify-center md:justify-start gap-8 mt-4 pt-6 border-t border-stone-900/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-stone-900 rounded-full shadow-lg shadow-stone-900/20"></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">Inventory</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-[#FFDE6B] rounded-full shadow-lg shadow-yellow-500/30"></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">Revenue</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-[#FF7D7D] rounded-full shadow-lg shadow-red-500/30"></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">Growth</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white rounded-[40px] md:rounded-[48px] p-6 md:p-10 flex flex-col justify-between shadow-sm border border-stone-200/40 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-3xl opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-stone-800 mb-1">Growth</h3>
                                        <p className="text-xs font-bold text-stone-400">Monthly Targets</p>
                                    </div>
                                    <div className="bg-red-50 text-[#FF7D7D] p-3 rounded-2xl">
                                        <TrendingUp size={20} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center mb-10">
                                    <div className="relative w-40 h-40 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 160 160">
                                            <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-stone-50" />
                                            <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="16" fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                strokeLinecap="round" className="text-[#FF7D7D] transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-4xl font-black text-stone-800 leading-none">{clientGrowthPercent}</span>
                                                <span className="text-xl font-bold text-stone-400">%</span>
                                            </div>
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-2">Target</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-stone-50 p-4 rounded-3xl">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active</span>
                                            <span className="text-sm font-black text-stone-800">{Number(stats.bookings || 0)} Bookings</span>
                                        </div>
                                        <div className="w-px h-8 bg-stone-200"></div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Goal</span>
                                            <span className="text-sm font-black text-[#FF7D7D]">{Number(targets.clientGoal || 0)} Orders</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between -mx-2 px-2">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setGrowthView('packages')}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${growthView === 'packages' ? 'bg-stone-900 text-white' : 'text-stone-300 hover:text-stone-500'}`}
                                                >
                                                    Packages
                                                </button>
                                                <button
                                                    onClick={() => setGrowthView('groups')}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${growthView === 'groups' ? 'bg-stone-900 text-white' : 'text-stone-300 hover:text-stone-500'}`}
                                                >
                                                    Groups
                                                </button>
                                            </div>
                                            <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Detail View</span>
                                        </div>

                                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 no-scrollbar">
                                            {growthView === 'packages' ? (
                                                <>
                                                    {filteredPackageStats.map((pkg, idx) => (
                                                        <div key={idx} className="space-y-2 group/pkg p-3 -mx-3 rounded-2xl hover:bg-stone-50 transition-all duration-300 relative">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex flex-col flex-1">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <div className="flex flex-col">
                                                                            {(pkg.group?.name || stats.packagesGroups.find(g => String(g.id) === String(pkg.groupId))?.name) && (
                                                                                <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.2em] leading-none mb-1">
                                                                                    {pkg.group?.name || stats.packagesGroups.find(g => String(g.id) === String(pkg.groupId))?.name}
                                                                                </span>
                                                                            )}
                                                                            <span className="text-[12px] font-black text-stone-800 truncate max-w-[120px] leading-tight">{String(pkg.name || '')}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedPackageId(pkg.id);
                                                                                setShowGoalModal(true);
                                                                            }}
                                                                            className="opacity-0 group-hover/pkg:opacity-100 w-5 h-5 rounded-lg bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-all"
                                                                            title="Set target for this package"
                                                                        >
                                                                            <Target size={11} strokeWidth={2.5} />
                                                                        </button>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-stone-400">Rp {Number(pkg.revenue || 0).toLocaleString()} / Target: {Number(pkg.revenueGoal || 0).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-1.5 font-black text-stone-900 leading-none">
                                                                        <span className="text-[11px]">{Number(pkg.count || 0)}</span>
                                                                        <span className="text-stone-200">/</span>
                                                                        <span className="text-[11px] text-[#FF7D7D]">{Number(pkg.bookingGoal || 0)}</span>
                                                                    </div>
                                                                    <div className={`flex items-center gap-1 mt-0.5 ${Number(pkg.growth || 0) >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                                                                        <TrendingUp size={10} className={Number(pkg.growth || 0) < 0 ? 'rotate-180' : ''} />
                                                                        <span className="text-[9px] font-black uppercase tracking-tight">{Math.abs(Number(pkg.growth || 0))}% {Number(pkg.growth || 0) >= 0 ? 'Growth' : 'Decline'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/20">
                                                                <div
                                                                    className="h-full bg-[#FF7D7D]/60 rounded-full transition-all duration-1000 group-hover/pkg:bg-[#FF7D7D]"
                                                                    style={{ width: `${Number(pkg.bookingProgress || 0)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {stats.packageStats.length === 0 && (
                                                        <p className="text-[10px] font-bold text-stone-300 italic">No package data available</p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {filteredGroupStats.map((group, idx) => (
                                                        <div key={idx} className="space-y-2 group/pkg p-3 -mx-3 rounded-2xl hover:bg-stone-50 transition-all duration-300 relative">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex flex-col flex-1">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[12px] font-black text-stone-800 truncate leading-tight uppercase tracking-wider">{String(group.name || '')}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-stone-400">{group.packageCount || 0} Packages Aggregated</span>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-1.5 font-black text-stone-800 leading-none">
                                                                        <span className="text-[11px]">{Number(group.count || 0)}</span>
                                                                        <span className="text-stone-200">/</span>
                                                                        <span className="text-[11px] text-[#FF7D7D]">{Number(group.bookingGoal || 0)}</span>
                                                                    </div>
                                                                    <div className={`flex items-center gap-1 mt-0.5 ${Number(group.growth || 0) >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                                                                        <TrendingUp size={10} className={Number(group.growth || 0) < 0 ? 'rotate-180' : ''} />
                                                                        <span className="text-[9px] font-black uppercase tracking-tight">{Math.abs(Number(group.growth || 0))}% {Number(group.growth || 0) >= 0 ? 'Growth' : 'Decline'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/20">
                                                                <div
                                                                    className="h-full bg-stone-900/60 rounded-full transition-all duration-1000 group-hover/pkg:bg-stone-900"
                                                                    style={{ width: `${Number(group.bookingProgress || 0)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {stats.groupStats.length === 0 && (
                                                        <p className="text-[10px] font-bold text-stone-300 italic">No group data available</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {growthView === 'packages' && (
                                        <button
                                            onClick={() => setShowGoalModal(true)}
                                            className="w-full bg-stone-900 text-white py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-stone-200 hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            Adjust Target <ArrowUpRight size={14} className="opacity-50" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] md:rounded-[48px] p-6 md:p-10 flex flex-col justify-between shadow-sm border border-stone-200/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-3xl opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h3 className="text-xl font-black text-stone-800 mb-1">Revenue</h3>
                                        <p className="text-xs font-bold text-stone-400">Financial Performance</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-black text-stone-900">{revenuePercent}%</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Tracking Live</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-14">
                                    <div className="relative pt-10 pb-4">
                                        <div className="h-4 w-full bg-stone-50 rounded-full overflow-hidden border border-stone-100">
                                            <div
                                                className="h-full bg-stone-900 rounded-full transition-all duration-1000 ease-in-out relative"
                                                style={{ width: `${revenuePercent}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute top-0 transition-all duration-1000 ease-in-out"
                                            style={{ left: `${revenuePercent}%`, transform: 'translateX(-50%)' }}
                                        >
                                            <div className="bg-stone-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl mb-3 shadow-2xl relative">
                                                Rp {Number(stats.income || 0).toLocaleString()}
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rotate-45"></div>
                                            </div>
                                            <div className="w-4 h-4 rounded-full bg-white border-[4px] border-stone-900 shadow-xl mx-auto ring-4 ring-stone-900/5"></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Base 0</span>
                                        <span className="text-[10px] font-black text-stone-800 uppercase tracking-widest">Target Rp {Number(targets.revenueGoal || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#D2C8B8]/10 rounded-[32px] border border-[#D2C8B8]/20 flex items-center gap-5 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#D2C8B8]/30 flex items-center justify-center text-stone-900 shadow-sm">
                                        <Target size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">Gap to Achieve</p>
                                        <p className="text-base font-black text-stone-800">Rp {Math.max(0, (Number(targets.revenueGoal || 0) - Number(stats.income || 0))).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between -mx-2 px-2">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setRevenueView('packages')}
                                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${revenueView === 'packages' ? 'bg-stone-900 text-white' : 'text-stone-300 hover:text-stone-500'}`}
                                            >
                                                Packages
                                            </button>
                                            <button
                                                onClick={() => setRevenueView('groups')}
                                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${revenueView === 'groups' ? 'bg-stone-900 text-white' : 'text-stone-300 hover:text-stone-500'}`}
                                            >
                                                Groups
                                            </button>
                                        </div>
                                        <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Revenue Detail</span>
                                    </div>

                                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 no-scrollbar">
                                        {revenueView === 'packages' ? (
                                            <>
                                                {filteredPackageStats.map((pkg, idx) => (
                                                    <div key={idx} className="space-y-2 group/pkg p-3 -mx-3 rounded-2xl hover:bg-stone-50 transition-all duration-300 relative border border-transparent hover:border-stone-100">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex flex-col flex-1">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <div className="flex flex-col">
                                                                        {(pkg.group?.name || stats.packagesGroups.find(g => String(g.id) === String(pkg.groupId))?.name) && (
                                                                            <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.2em] leading-none mb-1">
                                                                                {pkg.group?.name || stats.packagesGroups.find(g => String(g.id) === String(pkg.groupId))?.name}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[12px] font-black text-stone-800 truncate max-w-[120px] leading-tight">{String(pkg.name || '')}</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedPackageId(pkg.id);
                                                                            setShowGoalModal(true);
                                                                        }}
                                                                        className="opacity-0 group-hover/pkg:opacity-100 w-5 h-5 rounded-lg bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-all"
                                                                    >
                                                                        <Target size={11} strokeWidth={2.5} />
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-stone-400">Rp {Number(pkg.revenue || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <div className="flex items-center gap-1.5 font-black text-stone-900 leading-none">
                                                                    <span className="text-[10px] text-stone-300">Target</span>
                                                                    <span className="text-[11px]">Rp {Number(pkg.revenueGoal || 0).toLocaleString()}</span>
                                                                </div>
                                                                <span className={`text-[10px] font-black mt-1 ${Number(pkg.revenueProgress || 0) >= 100 ? 'text-green-500' : 'text-stone-400'}`}>{Number(pkg.revenueProgress || 0)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/20">
                                                            <div
                                                                className="h-full bg-green-500/60 rounded-full transition-all duration-1000 group-hover/pkg:bg-green-500"
                                                                style={{ width: `${Number(pkg.revenueProgress || 0)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {filteredGroupStats.map((group, idx) => (
                                                    <div key={idx} className="space-y-3 p-3 -mx-3 rounded-2xl hover:bg-stone-50 transition-all duration-300 group/pkg">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex flex-col flex-1">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[12px] font-black text-stone-800 truncate leading-tight uppercase tracking-wider">{String(group.name || '')}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-bold text-stone-900">Rp {Number(group.revenue || 0).toLocaleString()}</span>
                                                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5">{group.packageCount || 0} Packages Total</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <div className="flex items-center gap-1.5 font-black text-stone-900 leading-none">
                                                                    <span className="text-[10px] text-stone-300">Target</span>
                                                                    <span className="text-[11px]">Rp {Number(group.revenueGoal || 0).toLocaleString()}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-amber-600 mt-1">{Math.min(100, Math.round((Number(group.revenue || 0) / (Number(group.revenueGoal) || 1)) * 100))}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-stone-900/40 rounded-full transition-all duration-1000 group-hover/pkg:bg-stone-900"
                                                                style={{ width: `${Math.min(100, Math.round((Number(group.revenue || 0) / (Number(group.revenueGoal) || 1)) * 100))}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-full md:col-span-4 flex flex-col gap-6 md:gap-8">
                    <div className="bg-stone-900 text-white rounded-[40px] md:rounded-[48px] p-6 md:p-8 min-h-[450px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black tracking-tight">Calendar</h3>
                                <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl border border-white/5">
                                    <button
                                        onClick={prevMonth}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 min-w-[100px] text-center">
                                        {viewMonthName}
                                    </span>
                                    <button
                                        onClick={nextMonth}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-y-3 text-center mb-6">
                                {days.map((day, idx) => (
                                    <div key={idx} className="text-[10px] font-black opacity-20 mb-2 tracking-[0.2em] uppercase">{day}</div>
                                ))}
                                {[...Array(startPadding)].map((_, i) => (
                                    <div key={`pad-${i}`} className="p-1"></div>
                                ))}
                                {[...Array(totalDays)].map((_, i) => {
                                    const dayNum = i + 1;
                                    const data = getDayData(dayNum);
                                    return (
                                        <div key={i} className="flex items-center justify-center p-1">
                                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs transition-all cursor-pointer border-2 ${data?.type === 'COMPLETED' ? 'bg-[#FFDE6B] text-stone-900 font-black border-[#FFDE6B] shadow-lg shadow-yellow-500/20' :
                                                data?.type === 'CONFIRMED' ? 'bg-green-500 text-white font-black border-green-500 shadow-lg shadow-green-500/20' :
                                                    data?.type === 'PENDING' ? 'border-white/20 bg-white/5 text-white/60 font-black' :
                                                        data?.type === 'CANCELLED' ? 'border-red-500/50 bg-red-500/10 text-red-400 font-black' :
                                                            'opacity-20 hover:opacity-100 hover:bg-white/5 border-transparent'
                                                }`}>
                                                {dayNum}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-auto pt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/40"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Pending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Confirmed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFDE6B]"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Completed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Cancelled</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] md:rounded-[48px] p-6 md:p-10 flex-1 shadow-sm border border-stone-200/40 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-stone-800">Recents</h3>
                            <Link href="/admin/bookings" className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center transition-all hover:scale-110">
                                <Plus size={20} />
                            </Link>
                        </div>
                        <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                            {filteredRecentBookings.length > 0 ? (
                                filteredRecentBookings.map((bk, i) => (
                                    <Link key={bk.id} href={`/admin/bookings/${bk.id}`} className="flex items-center gap-5 group p-2 -mx-2 rounded-[24px] hover:bg-stone-50 transition-all duration-300">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center text-stone-300 flex-shrink-0 border border-stone-200/30">
                                            <UserIcon size={24} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="text-[15px] font-black text-stone-800 truncate leading-none mb-2">{String(bk.clientName || '')}</h4>
                                            <div className="flex items-center gap-2 text-stone-400">
                                                <CalendarIcon size={12} className="opacity-50" />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">
                                                    {new Date(bk.eventDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-xl border flex items-center justify-center ${bk.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border-green-100' :
                                            bk.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                bk.status === 'COMPLETED' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                    'bg-stone-50 text-stone-400 border-stone-100'
                                            }`}>
                                            {bk.status === 'CONFIRMED' ? <CheckCircle2 size={16} /> :
                                                bk.status === 'CANCELLED' ? <XCircle size={16} /> :
                                                    bk.status === 'PENDING' ? <Clock size={16} /> :
                                                        <CheckCircle2 size={16} className="opacity-50" />}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-stone-200 gap-5">
                                    <div className="w-20 h-20 rounded-[32px] bg-stone-50 flex items-center justify-center">
                                        <CalendarIcon size={40} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">No Activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {
                showGoalModal && (
                    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                        <div className="bg-white rounded-[56px] w-full max-w-4xl p-8 md:p-14 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
                            {/* Sticky Header & Navigation Section */}
                            <div className="sticky top-0 bg-white z-[20] -mx-8 md:-mx-14 px-8 md:px-14 pb-8 mb-8 border-b border-stone-100/50">
                                <div className="flex justify-between items-start mb-8 pt-4">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-stone-900 leading-tight">Define Targets</h2>
                                        <p className="text-sm font-bold text-stone-400 mt-1 uppercase tracking-widest">Business Goal Setting</p>
                                    </div>
                                    <button
                                        onClick={() => setShowGoalModal(false)}
                                        className="w-14 h-14 rounded-[28px] bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all shrink-0 hover:rotate-90 duration-300 outline-none"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-5 py-4 -my-4">
                                    {/* Fixed Section: Global */}
                                    {/* Global Target */}
                                    <div className="flex gap-4 shrink-0 px-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPackageId('global')}
                                            className={`w-32 py-8 rounded-[40px] transition-all border-2 shrink-0 outline-none flex flex-col items-center justify-center gap-3 ${selectedPackageId === 'global' ? 'bg-stone-900 text-white border-stone-900 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] scale-105' : 'bg-white text-stone-300 border-stone-50 hover:border-stone-200 hover:text-stone-500 hover:bg-stone-50/50'}`}
                                        >
                                            <div className={`p-3 rounded-2xl ${selectedPackageId === 'global' ? 'bg-white/10' : 'bg-stone-50'}`}>
                                                <Globe size={22} className={selectedPackageId === 'global' ? 'text-white' : 'text-stone-300'} />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Global</span>
                                                <span className="text-[12px] font-black opacity-40">{targets.clientGoal || 0}</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-16 bg-stone-100/80 shrink-0"></div>

                                    {/* Scrollable Section: Packages */}
                                    <div className="flex gap-4 overflow-x-auto pt-4 pb-10 -mb-10 no-scrollbar pr-14 px-2">
                                        {filteredPackagesData.map(pkg => {
                                            const isSelected = selectedPackageId === pkg.id;
                                            const currentGoal = pkg.bookingGoal || 0;
                                            const groupName = pkg.group?.name || stats.packagesGroups.find(g => String(g.id) === String(pkg.groupId))?.name;

                                            return (
                                                <button
                                                    key={pkg.id}
                                                    type="button"
                                                    onClick={() => setSelectedPackageId(pkg.id)}
                                                    className={`min-w-[140px] px-6 py-8 rounded-[40px] transition-all border-2 shrink-0 outline-none ${isSelected ? 'bg-stone-900 text-white border-stone-900 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] scale-105' : 'bg-white text-stone-300 border-stone-50 hover:border-stone-200 hover:text-stone-500 hover:bg-stone-50/50'}`}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        {groupName ? (
                                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full ${isSelected ? 'bg-amber-400/20 text-amber-400' : 'bg-stone-50 text-stone-400'}`}>
                                                                {groupName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full bg-stone-50 opacity-20">No Group</span>
                                                        )}
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-stone-50'}`}>
                                                                <Box size={14} className={isSelected ? 'text-white' : 'text-stone-300'} />
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase tracking-wider">{pkg.name}</span>
                                                        </div>
                                                        <span className="text-[12px] font-black opacity-40">{currentGoal}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSaveGoals} className="space-y-10 pb-12">
                                {/* Scope Indicator */}
                                <div className="bg-gradient-to-br from-white to-stone-50/50 border-2 border-stone-100/50 rounded-[48px] p-10 shadow-sm transition-all duration-500">
                                    <div className="flex items-center gap-8">
                                        <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-2xl shadow-xl transition-all duration-500 ${selectedPackageId === 'global' ? 'bg-stone-900 text-white shadow-stone-200' : 'bg-green-50 text-green-500 shadow-green-100/50'}`}>
                                            {selectedPackageId === 'global' ? <Globe size={28} /> : <Box size={28} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] mb-2">Editing Target For</p>
                                            <p className="text-2xl font-black text-stone-900 leading-tight tracking-tight">
                                                {selectedPackageId === 'global' ? (
                                                    "Global Business"
                                                ) : (
                                                    stats.packagesData.find(p => p.id === selectedPackageId)?.name
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-4 space-y-4">
                                        <label className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] ml-6 whitespace-nowrap">Booking Goal</label>
                                        <div className="group">
                                            <div className="flex items-center bg-stone-50 border-2 border-transparent rounded-[40px] focus-within:bg-white focus-within:border-stone-900 focus-within:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all group-hover:bg-stone-100/50 px-8 py-6 min-h-[96px]">
                                                <input
                                                    type="number" required
                                                    className="flex-1 bg-transparent outline-none font-black text-3xl min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={tempTargets.clientGoal || ''}
                                                    onChange={(e) => setTempTargets({ ...tempTargets, clientGoal: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                                    placeholder="0"
                                                />
                                                <div className="shrink-0 flex items-center justify-center px-4 py-2 bg-white rounded-2xl border border-stone-100 shadow-sm ml-4 pointer-events-none select-none">
                                                    <span className="text-stone-400 font-black text-[10px] uppercase tracking-widest">Orders</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-8 space-y-4">
                                        <label className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] ml-6 whitespace-nowrap">Monthly Revenue Target</label>
                                        <div className="group">
                                            <div className="flex items-center bg-stone-50 border-2 border-transparent rounded-[40px] focus-within:bg-white focus-within:border-stone-900 focus-within:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all group-hover:bg-stone-100/50 px-10 py-6 min-h-[96px]">
                                                <div className="shrink-0 bg-white rounded-2xl shadow-sm w-14 h-14 flex items-center justify-center text-stone-900 font-black text-sm border border-stone-100 mr-6 transition-transform group-focus-within:scale-110">
                                                    Rp
                                                </div>
                                                <input
                                                    type="number" required
                                                    className="flex-1 bg-transparent outline-none font-black text-3xl min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={tempTargets.revenueGoal || ''}
                                                    onChange={(e) => setTempTargets({ ...tempTargets, revenueGoal: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                                />
                                                <div className="shrink-0 flex items-center justify-center px-5 py-2 bg-stone-200/20 rounded-2xl border border-transparent ml-6 pointer-events-none select-none">
                                                    <span className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">IDR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12">
                                    <button
                                        type="submit"
                                        className="w-full bg-stone-900 text-stone-50 py-7 rounded-[40px] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] hover:bg-stone-800 hover:scale-[1.01] hover:-translate-y-1 active:scale-95 transition-all outline-none relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                        Apply Business goal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

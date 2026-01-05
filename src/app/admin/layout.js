"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { LogOut, X, AlertCircle, Calendar, Package, Layers, FileText, DollarSign, User as UserIcon, ShieldCheck } from "lucide-react";

function AdminLayoutContent({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [isLoadingLayout, setIsLoadingLayout] = useState(true);

    // Search State
    const [allData, setAllData] = useState({ packages: [], bookings: [], services: [], docs: [], finance: [] });
    const [searchResults, setSearchResults] = useState({ packages: [], bookings: [], services: [], docs: [], finance: [] });
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q')?.toString() || "");

    const loadLayoutData = async () => {
        try {
            // Force fetch without cache to get real-time permission updates
            const [sessionRes, settingsRes] = await Promise.all([
                fetch('/api/auth/session', { cache: 'no-store' }),
                fetch('/api/settings', { cache: 'no-store' })
            ]);
            const session = await sessionRes.json();
            const settings = await settingsRes.json();

            if (session.role) setUserRole(session.role);
            if (settings.rolePermissions) {
                try {
                    setPermissions(JSON.parse(settings.rolePermissions));
                } catch (e) {
                    setPermissions({});
                }
            }

            const [packages, bookings, services, docs, finance] = await Promise.all([
                fetch('/api/packages').then(r => r.json()),
                fetch('/api/bookings').then(r => r.json()),
                fetch('/api/services').then(r => r.json()),
                fetch('/api/documentation').then(r => r.json()),
                fetch('/api/finance').then(r => r.json())
            ]);
            setAllData({
                packages: Array.isArray(packages) ? packages : [],
                bookings: Array.isArray(bookings) ? bookings : [],
                services: Array.isArray(services) ? services : [],
                docs: Array.isArray(docs) ? docs : [],
                finance: Array.isArray(finance) ? finance : []
            });
        } catch (error) {
            console.error("Failed to load layout data", error);
        } finally {
            setIsLoadingLayout(false);
        }
    };

    useEffect(() => {
        // Always load layout data when entering the admin area or when settings update
        if (pathname !== "/admin/login") {
            loadLayoutData();
        }

        const handleSync = () => {
            setIsLoadingLayout(true);
            setTimeout(loadLayoutData, 100);
        };

        window.addEventListener('platform-settings-updated', handleSync);
        return () => window.removeEventListener('platform-settings-updated', handleSync);
    }, [pathname]); // Re-run when navigation occurs

    const handleSearch = (term) => {
        setSearchQuery(term);

        // URL Param Update (Existing)
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.replace(`${pathname}?${params.toString()}`);

        // Local Filter for Dropdown
        if (!term) {
            setSearchResults({ packages: [], bookings: [], services: [], docs: [], finance: [] });
            return;
        }

        const lowerQ = term.toLowerCase();
        setSearchResults({
            packages: allData.packages.filter(p => p.name?.toLowerCase().includes(lowerQ)).slice(0, 3),
            bookings: allData.bookings.filter(b => b.clientName?.toLowerCase().includes(lowerQ) || b.id?.toString().includes(lowerQ)).slice(0, 3),
            services: allData.services.filter(s => s.title?.toLowerCase().includes(lowerQ)).slice(0, 3),
            docs: allData.docs.filter(d => d.title?.toLowerCase().includes(lowerQ)).slice(0, 3),
            finance: allData.finance.filter(f => f.description?.toLowerCase().includes(lowerQ) || f.category?.toLowerCase().includes(lowerQ)).slice(0, 3)
        });
    };

    const handleLogout = async () => {
        try {
            setShowLogoutModal(false); // Immediate feedback
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Prevent rendering the dashboard layout on the login page and invoice pages
    if (pathname === "/admin/login" || pathname?.includes('/invoice')) {
        return <>{children}</>;
    }

    const allMenuItems = [
        { href: "/admin", icon: "fas fa-home", title: "Dashboard" },
        { href: "/admin/bookings", icon: "fas fa-calendar-alt", title: "Bookings" },
        { href: "/admin/items", icon: "fas fa-box", title: "Master Items" },
        { href: "/admin/packages", icon: "fas fa-tags", title: "Packages" },
        { href: "/admin/finance", icon: "fas fa-wallet", title: "Finance" },
        { href: "/admin/about", icon: "fas fa-info-circle", title: "About" },
    ];

    const normalizedRole = userRole?.toUpperCase() || "";
    const isMasterAdmin = normalizedRole.includes('ADMIN');

    const filteredMenuItems = allMenuItems.filter(item => {
        if (!userRole) return false;
        if (isMasterAdmin) return true;

        // Normalize permissions key to match DB role
        return (permissions[normalizedRole] || []).includes(item.href);
    });

    const canSeeSettings = isMasterAdmin || (permissions[normalizedRole] || []).includes('/admin/settings');

    // Route Protection
    const isPathAllowed = () => {
        if (isLoadingLayout) return true;
        if (isMasterAdmin) return true;
        if (pathname === "/admin/login") return true;

        // Check if current path is in permissions for this role
        const allowedPaths = permissions[normalizedRole] || [];

        // Dashboard is usually the root, check strictly
        if (pathname === "/admin") return allowedPaths.includes("/admin");

        // For sub-paths, check if the base path is allowed
        return allowedPaths.some(p => pathname.startsWith(p));
    };

    const hasAccess = isPathAllowed();

    const SidebarContent = ({ isMobile = false }) => (
        <>
            <div className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
                <div className="w-16 h-16 flex items-center justify-center transition-transform hover:scale-110">
                    <img src="/logo-jenggala.png" alt="Jenggala Logo" className="w-full h-full object-contain" />
                </div>
            </div>

            <nav className="flex-1 w-full flex flex-col items-center gap-8">
                {isLoadingLayout ? (
                    <div className="flex flex-col gap-8 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-12 h-12 rounded-2xl bg-stone-100" />
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredMenuItems.map((item) => (
                            <Link
                                href={item.href}
                                key={item.href}
                                className="relative group"
                                onClick={() => isMobile && setShowMobileSidebar(false)}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${pathname === item.href
                                    ? "bg-black text-white shadow-xl shadow-black/20 scale-110"
                                    : "text-gray-400 hover:bg-white hover:text-black hover:scale-110"
                                    }`}>
                                    <i className={item.icon}></i>
                                </div>

                                {!isMobile && (
                                    <div className="absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg opacity-0 invisible -translate-x-2 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none">
                                        {item.title}
                                        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </>
                )}

                <div className="mt-auto w-full flex flex-col items-center gap-8">
                    {canSeeSettings && (
                        <Link
                            href="/admin/settings"
                            className="relative group"
                            onClick={() => isMobile && setShowMobileSidebar(false)}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${pathname === "/admin/settings"
                                ? "bg-black text-white shadow-xl shadow-black/20 scale-110"
                                : "text-gray-400 hover:bg-white hover:text-black hover:scale-110"
                                }`}>
                                <i className="fas fa-cog"></i>
                            </div>
                            {!isMobile && (
                                <div className="absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg opacity-0 invisible -translate-x-2 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none">
                                    Settings
                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
                                </div>
                            )}
                        </Link>
                    )}

                    <button
                        onClick={() => {
                            setShowLogoutModal(true);
                            if (isMobile) setShowMobileSidebar(false);
                        }}
                        className="w-12 h-16 bg-white rounded-3xl border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden mb-4 cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all group/profile relative"
                        title="Sign Out"
                    >
                        {/* Hidden state (User Icon) */}
                        <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white group-hover/profile:opacity-0 group-hover/profile:scale-50 transition-all duration-300">
                            <UserIcon size={20} />
                        </div>

                        {/* Hover state (Logout Icon) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/profile:opacity-100 scale-50 group-hover/profile:scale-100 transition-all duration-300 text-red-500">
                            <LogOut size={22} strokeWidth={2.5} />
                        </div>
                    </button>
                </div>
            </nav>
        </>
    );

    return (
        <div className="flex h-[100svh] bg-[#F7F4EF] text-[#2D2D2D] font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-24 flex-col items-center py-8 bg-white/50 backdrop-blur-md border-r border-gray-200/50 relative z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] md:hidden animate-in fade-in duration-300"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 w-24 bg-white/90 backdrop-blur-xl z-[101] flex flex-col items-center py-8 border-r border-gray-200/50 transition-transform duration-500 md:hidden ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent isMobile />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-20 md:h-24 px-6 md:px-10 flex items-center justify-between bg-white/30 backdrop-blur-md md:bg-transparent">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="md:hidden w-10 h-10 flex items-center justify-center text-stone-800 bg-white rounded-xl shadow-sm border border-stone-100"
                        >
                            <i className="fas fa-bars text-lg"></i>
                        </button>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-stone-800 tracking-tight">Hi, {isMasterAdmin ? 'admin' : (userRole?.toLowerCase() || 'Admin')} 👋</h2>
                            <p className="hidden md:block text-stone-400 text-sm font-medium">Monitoring Jenggala Project analytics.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="relative group hidden sm:block">
                            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors"></i>
                            <input
                                type="text"
                                placeholder="Search everything..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                className="bg-white border border-stone-100 rounded-[20px] pl-14 pr-8 py-3 w-40 md:w-80 shadow-sm focus:shadow-xl focus:shadow-stone-200/50 focus:border-stone-200 outline-none text-sm transition-all font-medium"
                            />

                            {/* Search Dropdown Results */}
                            {isFocused && searchQuery && (
                                <div className="absolute top-[calc(100%+12px)] left-0 w-80 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white rounded-[24px] shadow-2xl shadow-stone-200/50 border border-stone-100 p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                    {(searchResults.packages.length > 0 || searchResults.bookings.length > 0 || searchResults.services.length > 0 || searchResults.docs.length > 0 || searchResults.finance.length > 0) ? (
                                        <div className="space-y-1">
                                            {searchResults.bookings.length > 0 && (
                                                <div className="p-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2">Bookings</p>
                                                    {searchResults.bookings.map(book => (
                                                        <Link
                                                            key={book.id}
                                                            href={`/admin/bookings?id=${book.id}`}
                                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-stone-900 group-hover:shadow-sm transition-all">
                                                                <Calendar size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-stone-800 truncate">{book.clientName}</p>
                                                                <p className="text-[10px] text-stone-400 truncate">{new Date(book.eventDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.packages.length > 0 && (
                                                <div className="p-2 border-t border-stone-50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-2">Packages</p>
                                                    {searchResults.packages.map(pkg => (
                                                        <Link
                                                            key={pkg.id}
                                                            href={`/admin/packages?id=${pkg.id}`}
                                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-stone-900 group-hover:shadow-sm transition-all">
                                                                <Package size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-stone-800 truncate">{pkg.name}</p>
                                                                <p className="text-[10px] text-stone-400 truncate">Rp {Number(pkg.price).toLocaleString()}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.services.length > 0 && (
                                                <div className="p-2 border-t border-stone-50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-2">Service Categories</p>
                                                    {searchResults.services.map(srv => (
                                                        <Link
                                                            key={srv.id}
                                                            href={`/admin/items`}
                                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-stone-900 group-hover:shadow-sm transition-all">
                                                                {srv.icon ? <i className={`${srv.icon} text-[14px]`}></i> : <Layers size={14} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-stone-800 truncate">{srv.title}</p>
                                                                <p className="text-[10px] text-stone-400 truncate">{srv.description || 'Service Category'}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.finance.length > 0 && (
                                                <div className="p-2 border-t border-stone-50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-2">Finance</p>
                                                    {searchResults.finance.map(fin => (
                                                        <Link
                                                            key={fin.id}
                                                            href={`/admin/finance`}
                                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-stone-900 group-hover:shadow-sm transition-all">
                                                                <DollarSign size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-stone-800 truncate">{fin.description}</p>
                                                                <p className="text-[10px] text-stone-400 truncate">
                                                                    <span className={fin.type === "INCOME" ? "text-green-500" : "text-red-500"}>{fin.type}</span> • Rp {Number(fin.amount).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.docs.length > 0 && (
                                                <div className="p-2 border-t border-stone-50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-2">Documentation</p>
                                                    {searchResults.docs.map(doc => (
                                                        <Link
                                                            key={doc.id}
                                                            href={`/admin/about?q=${doc.title}`}
                                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-stone-900 group-hover:shadow-sm transition-all">
                                                                <FileText size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-stone-800 truncate">{doc.title}</p>
                                                                <p className="text-[10px] text-stone-400 truncate">Portfolio Item</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-stone-400">
                                            <p className="text-xs font-bold">No results found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.push('/admin?action=set-goals')}
                            className="bg-stone-900 text-white px-5 md:px-8 py-3 rounded-2xl md:rounded-[20px] font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200 whitespace-nowrap"
                        >
                            <span className="md:inline">Create Insight</span>
                            <span className="md:hidden">+</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-10 pt-2 pb-32 overflow-y-auto no-scrollbar">
                    {hasAccess ? children : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[40px] flex items-center justify-center mb-8 border border-red-100 shadow-xl shadow-red-500/10">
                                <ShieldCheck size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-stone-800 mb-4 tracking-tight">Restricted Access</h2>
                            <p className="max-w-md text-stone-400 font-medium leading-relaxed mb-10">
                                Your account role (<span className="text-stone-900 font-bold">{userRole}</span>) does not have the necessary authority to view this section. Please contact your administrator for elevated permissions.
                            </p>
                            <Link
                                href="/admin"
                                className="bg-stone-900 text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-stone-200 hover:scale-105 active:scale-95 transition-all"
                            >
                                Return to Dashboard
                            </Link>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Logout Premium */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLogoutModal(false)}></div>
                    <div className="relative bg-white rounded-[56px] w-full max-w-sm p-12 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 text-center border border-white/50">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-lg shadow-red-500/10">
                            <AlertCircle size={40} />
                        </div>

                        <h2 className="text-3xl font-black text-stone-900 leading-tight mb-3">Sign Out?</h2>
                        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-10 text-center">Are you sure you want to end your session?</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 bg-stone-50 text-stone-400 py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-100 transition-all active:scale-95 border border-stone-100"
                            >
                                No, Stay
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 bg-red-500 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <LogOut size={16} /> Yes, Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#F7F4EF]">
            <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
        </div>}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}

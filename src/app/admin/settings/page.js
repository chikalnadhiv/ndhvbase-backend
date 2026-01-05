"use client";
import { useState, useEffect } from "react";
import { Save, User, Settings as SettingsIcon, Plus, Trash2, Key, ShieldCheck, Mail, Phone, MapPin, Globe, UserCircle, AlertCircle, X, Image as ImageIcon, CheckCircle2, ChevronDown, Send, Eye, MessageSquare, UploadCloud, RefreshCw, Star, Search } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general"); // general, users, clients
    const [settings, setSettings] = useState({
        siteTitle: "Jenggala Project",
        contactEmail: "hello@jenggala.com",
        contactPhone: "08123456789",
        address: "Bali, Indonesia",
    });
    const [socialLinks, setSocialLinks] = useState([]);
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [clientDocs, setClientDocs] = useState({});
    const [clientTestimonials, setClientTestimonials] = useState({});
    const [clientSearch, setClientSearch] = useState("");

    const [loading, setLoading] = useState(false);

    const [saved, setSaved] = useState(false);
    const [activeDropdownId, setActiveDropdownId] = useState(null);


    const [availableRoles, setAvailableRoles] = useState(['ADMINISTRATOR', 'STAFF / USER']);
    const [rolePermissions, setRolePermissions] = useState({});
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const availableIcons = [
        { icon: 'fa-brands fa-instagram', name: 'Instagram' },
        { icon: 'fa-brands fa-facebook-f', name: 'Facebook' },
        { icon: 'fa-brands fa-pinterest-p', name: 'Pinterest' },
        { icon: 'fa-brands fa-tiktok', name: 'TikTok' },
        { icon: 'fa-brands fa-whatsapp', name: 'WhatsApp' },
        { icon: 'fa-brands fa-x-twitter', name: 'Twitter / X' },
        { icon: 'fa-brands fa-youtube', name: 'YouTube' },
        { icon: 'fa-brands fa-linkedin-in', name: 'LinkedIn' },
        { icon: 'fa-solid fa-globe', name: 'Website' },
    ];

    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({ id: null, name: '', username: '', password: '', role: 'USER' });

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDestructive: false
    });

    useEffect(() => {
        fetchSettings();
        fetchUsers();
        fetchClients();


        const handleClickOutside = () => setActiveDropdownId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);



    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data && !data.error) {
                const { socialLinks: socialData, availableRoles: rolesData, rolePermissions: permissionsData, ...rest } = data;
                setSettings((prev) => ({ ...prev, ...rest }));
                if (socialData) {
                    try { setSocialLinks(JSON.parse(socialData)); } catch (e) { setSocialLinks([]); }
                }
                if (rolesData) {
                    try { setAvailableRoles(JSON.parse(rolesData)); } catch (e) { setAvailableRoles(['ADMINISTRATOR', 'STAFF / USER']); }
                }
                if (permissionsData) {
                    try { setRolePermissions(JSON.parse(permissionsData)); } catch (e) { setRolePermissions({}); }
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            const data = await res.json();
            if (Array.isArray(data)) {
                setClients(data);

                // Parallel fetch for associated data
                const [docsRes, testimonialsRes] = await Promise.all([
                    fetch("/api/documentation"),
                    fetch("/api/testimonials")
                ]);

                const docsData = await docsRes.json();
                const testimonialsData = await testimonialsRes.json();

                if (Array.isArray(docsData)) {
                    const counts = {};
                    docsData.forEach(doc => {
                        if (doc.clientId) counts[doc.clientId] = (counts[doc.clientId] || 0) + 1;
                    });
                    setClientDocs(counts);
                }

                if (Array.isArray(testimonialsData)) {
                    const clientMap = {};
                    testimonialsData.forEach(t => {
                        if (t.clientId) clientMap[t.clientId] = t;
                    });
                    setClientTestimonials(clientMap);
                }
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const toggleTestimonial = async (clientId) => {
        const testimonial = clientTestimonials[clientId];
        if (!testimonial) {
            showToast("This client hasn't submitted a review yet", "info");
            return;
        }

        try {
            const newStatus = !testimonial.isPublished;
            const res = await fetch(`/api/testimonials/${testimonial.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: newStatus })
            });

            if (res.ok) {
                showToast(`Review for ${testimonial.name} ${newStatus ? 'Published' : 'Unpublished'}`);
                fetchClients(); // Refresh data
            }
        } catch (error) {
            console.error("Error toggling testimonial:", error);
        }
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (activeDropdownId && !e.target.closest('.dropdown-container')) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [activeDropdownId]);

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...settings,
                socialLinks: JSON.stringify(socialLinks),
                availableRoles: JSON.stringify(availableRoles),
                rolePermissions: JSON.stringify(rolePermissions)
            };
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            showToast("Platform configuration updated successfully");
            // Trigger layout refresh without page reload
            window.dispatchEvent(new CustomEvent('platform-settings-updated'));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const addRole = () => {
        const role = newRoleName.trim().toUpperCase();
        if (!role) return;
        if (availableRoles.includes(role)) {
            showToast("Role already exists", "error");
            return;
        }
        setAvailableRoles([...availableRoles, role]);
        setNewRoleName("");
        setShowAddRoleModal(false);
        showToast(`Role "${role}" added. Remember to save changes.`);
    };

    const removeRole = (roleToRemove) => {
        if (roleToRemove === 'ADMINISTRATOR') {
            showToast("Cannot remove core administrative role", "error");
            return;
        }
        setAvailableRoles(availableRoles.filter(role => role !== roleToRemove));
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { id: Date.now(), icon: availableIcons[0].icon, label: availableIcons[0].name, url: '' }]);
    };

    const removeSocialLink = (id) => {
        setSocialLinks(socialLinks.filter(link => link.id !== id));
    };

    const updateSocialLink = (id, field, value) => {
        if (field === 'icon') {
            const selectedIcon = availableIcons.find(i => i.icon === value);
            setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, icon: value, label: selectedIcon?.name || link.label } : link));
        } else {
            setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, [field]: value } : link));
        }
    };



    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = userForm.id ? "PUT" : "POST";
            const url = userForm.id ? `/api/users/${userForm.id}` : "/api/users";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userForm),
            });

            if (res.ok) {
                fetchUsers();
                setShowUserModal(false);
                showToast(userForm.id ? "User profile modified" : "New user access provisioned");
                // Refresh layout in case the current user's role was changed
                window.dispatchEvent(new CustomEvent('platform-settings-updated'));
                setUserForm({ id: null, name: '', username: '', password: '', role: availableRoles[0] || 'USER' });
            }
        } catch (error) {
            console.error("Error saving user:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete User?",
            message: "Are you sure you want to remove this staff member? This action cannot be undone.",
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await fetch(`/api/users/${id}`, { method: "DELETE" });
                    fetchUsers();
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            }
        });
    };

    const deleteClient = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Client?",
            message: "This will permanently remove the client account. Associated bookings will remain in the records but will be detached from this profile.",
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await fetch(`/api/clients/${id}`, { method: "DELETE" });
                    fetchClients();
                } catch (error) {
                    console.error("Error deleting client:", error);
                }
            }
        });
    };

    const [selectedClient, setSelectedClient] = useState(null);

    const getSelectedIcon = (icon) => {
        return availableIcons.find(i => i.icon === icon) || availableIcons[0];
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-stone-800 tracking-tight">Settings</h1>
                    <p className="text-stone-400 text-sm font-medium">Manage your platform configuration and access control.</p>
                </div>
                {activeTab === "users" && (
                    <button
                        onClick={() => {
                            setUserForm({ id: null, name: '', username: '', password: '', role: 'USER' });
                            setShowUserModal(true);
                        }}
                        className="bg-stone-900 text-white px-8 py-3.5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-stone-200 flex items-center gap-3"
                    >
                        <Plus size={18} /> Add New User
                    </button>
                )}
            </div>

            {/* Premium Tabs */}
            <div className="flex gap-4 bg-stone-100 p-2 rounded-[28px] w-fit border border-stone-200/50">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "general" ? "bg-white text-stone-900 shadow-xl shadow-stone-200 ring-1 ring-stone-100" : "text-stone-400 hover:text-stone-600"}`}
                >
                    <SettingsIcon size={16} /> General
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "users" ? "bg-white text-stone-900 shadow-xl shadow-stone-200 ring-1 ring-stone-100" : "text-stone-400 hover:text-stone-600"}`}
                >
                    <User size={16} /> User Management
                </button>
                <button
                    onClick={() => setActiveTab("roles")}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "roles" ? "bg-white text-stone-900 shadow-xl shadow-stone-200 ring-1 ring-stone-100" : "text-stone-400 hover:text-stone-600"}`}
                >
                    <ShieldCheck size={16} /> Roles
                </button>
                <button
                    onClick={() => setActiveTab("clients")}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "clients" ? "bg-white text-stone-900 shadow-xl shadow-stone-200 ring-1 ring-stone-100" : "text-stone-400 hover:text-stone-600"}`}
                >
                    <UserCircle size={16} /> Client Database
                </button>
            </div>

            <div className="bg-white rounded-[48px] shadow-sm border border-stone-100/50 overflow-visible">
                {activeTab === "general" && (
                    <div className="p-12 pb-24">
                        <form onSubmit={handleSettingsSubmit} className="space-y-12">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">
                                        <Globe size={14} /> Website Identity
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[28px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                                        value={settings.siteTitle}
                                        onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                                        placeholder="Site Title"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">
                                        <Mail size={14} /> Official Support Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[28px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                                        value={settings.contactEmail}
                                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">
                                        <Phone size={14} /> Business WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[28px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                                        value={settings.contactPhone}
                                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">
                                        <MapPin size={14} /> Office Address
                                    </label>
                                    <textarea
                                        className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[28px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800 h-28 resize-none"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        placeholder="Complete Address"
                                    />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">
                                        <Globe size={14} /> Social Media Links
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addSocialLink}
                                        className="bg-stone-50 text-stone-800 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center gap-3 border border-stone-200"
                                    >
                                        <Plus size={14} /> Add Platform
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {socialLinks.map((link) => (
                                        <div key={link.id} className="grid grid-cols-12 gap-4 items-end animate-in slide-in-from-right-4 dropdown-container">
                                            <div className="col-span-3 space-y-2">
                                                <label className="text-[9px] font-black text-stone-300 uppercase tracking-widest ml-1">Platform Icon</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdownId(activeDropdownId === link.id ? null : link.id);
                                                        }}
                                                        className={`w-full border p-4 pl-12 pr-10 rounded-2xl outline-none transition-all font-bold text-sm text-left flex items-center justify-between ${activeDropdownId === link.id
                                                            ? 'bg-white border-stone-900 shadow-xl shadow-stone-200/50 scale-[1.02]'
                                                            : 'bg-stone-50 border-stone-100 hover:border-stone-200'}`}
                                                    >
                                                        <i className={`${link.icon} absolute left-4 top-1/2 -translate-y-1/2 ${activeDropdownId === link.id ? 'text-stone-900 scale-110' : 'text-stone-400'} transition-all`}></i>
                                                        <span className={activeDropdownId === link.id ? 'text-stone-900' : 'text-stone-600'}>
                                                            {getSelectedIcon(link.icon).name}
                                                        </span>
                                                        <ChevronDown className={`transition-transform duration-500 text-stone-300 ${activeDropdownId === link.id ? 'rotate-180 text-stone-900' : ''}`} size={16} />
                                                    </button>

                                                    {activeDropdownId === link.id && (
                                                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-stone-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] py-2 animate-in zoom-in-95 slide-in-from-top-2 duration-300 max-h-[280px] overflow-y-auto custom-scrollbar">
                                                            {availableIcons.map((icon) => {
                                                                const isSelected = link.icon === icon.icon;
                                                                return (
                                                                    <button
                                                                        key={icon.icon}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            updateSocialLink(link.id, 'icon', icon.icon);
                                                                            setActiveDropdownId(null);
                                                                        }}
                                                                        className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-stone-50 transition-all group ${isSelected ? 'bg-stone-50/50' : ''}`}
                                                                    >
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-400 group-hover:scale-110'}`}>
                                                                            <i className={icon.icon}></i>
                                                                        </div>
                                                                        <span className={`text-sm font-bold flex-1 text-left ${isSelected ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-700'}`}>
                                                                            {icon.name}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center">
                                                                                <CheckCircle2 size={12} className="text-white" />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-3 space-y-2">
                                                <label className="text-[9px] font-black text-stone-300 uppercase tracking-widest ml-1">Label</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-sm"
                                                    value={link.label}
                                                    onChange={(e) => updateSocialLink(link.id, 'label', e.target.value)}
                                                    placeholder="e.g. Instagram"
                                                />
                                            </div>
                                            <div className="col-span-5 space-y-2">
                                                <label className="text-[9px] font-black text-stone-300 uppercase tracking-widest ml-1">Profile URL</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-sm"
                                                    value={link.url}
                                                    onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeSocialLink(link.id)}
                                                    className="w-full aspect-square bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {socialLinks.length === 0 && (
                                        <div className="py-10 text-center border-2 border-dashed border-stone-100 rounded-[32px] text-stone-300 text-sm font-bold">
                                            No social media links added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex items-center gap-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-3 bg-stone-900 text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-stone-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {loading ? "Synchronizing..." : "Update Settings"}
                                </button>
                                {saved && (
                                    <div className="flex items-center gap-3 text-green-500 font-bold text-sm bg-green-50 px-6 py-4 rounded-[20px] animate-in slide-in-from-left-4">
                                        <ShieldCheck size={20} /> Configuration Saved
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "roles" && (
                    <div className="p-12">
                        <div className="max-w-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-stone-800 tracking-tight">Role Management</h2>
                                    <p className="text-stone-400 text-sm font-medium">Define security roles available across the system.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddRoleModal(true)}
                                    className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-stone-200 flex items-center gap-3"
                                >
                                    <Plus size={14} /> Add Role
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {availableRoles.map((role) => (
                                    <div key={role} className="space-y-4">
                                        <div className="flex items-center justify-between p-6 bg-stone-50 rounded-[32px] border border-stone-100 group transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-900 shadow-sm transition-transform">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <span className="font-black text-stone-800 tracking-wider text-sm">{role}</span>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Sidebar Permissions Configuration</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {role !== 'ADMINISTRATOR' && (
                                                    <button
                                                        onClick={() => removeRole(role)}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Permission Grid for this Role */}
                                        <div className="grid grid-cols-3 gap-3 px-2">
                                            {[
                                                { id: '/admin', title: 'Dashboard', icon: 'fa-home' },
                                                { id: '/admin/bookings', title: 'Bookings', icon: 'fa-calendar-alt' },
                                                { id: '/admin/items', title: 'Master Items', icon: 'fa-box' },
                                                { id: '/admin/packages', title: 'Packages', icon: 'fa-tags' },
                                                { id: '/admin/finance', title: 'Finance', icon: 'fa-wallet' },
                                                { id: '/admin/about', title: 'About/Portfolio', icon: 'fa-info-circle' },
                                                { id: '/admin/settings', title: 'Settings', icon: 'fa-cog' },
                                            ].map((menu) => {
                                                const isAllowed = role === 'ADMINISTRATOR' || (rolePermissions[role] || []).includes(menu.id);
                                                return (
                                                    <button
                                                        key={menu.id}
                                                        disabled={role === 'ADMINISTRATOR'}
                                                        onClick={() => {
                                                            const current = rolePermissions[role] || [];
                                                            const next = current.includes(menu.id)
                                                                ? current.filter(id => id !== menu.id)
                                                                : [...current, menu.id];
                                                            setRolePermissions({ ...rolePermissions, [role]: next });
                                                        }}
                                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isAllowed
                                                            ? 'bg-white border-stone-200 text-stone-900 shadow-sm'
                                                            : 'bg-stone-50/50 border-transparent text-stone-300'
                                                            } ${role !== 'ADMINISTRATOR' ? 'hover:scale-[1.02] active:scale-95' : 'opacity-80'}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAllowed ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-200'}`}>
                                                            <i className={`fas ${menu.icon} text-xs`}></i>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest">{menu.title}</p>
                                                            <p className="text-[9px] font-bold opacity-40">{isAllowed ? 'VISIBLE' : 'HIDDEN'}</p>
                                                        </div>
                                                        {isAllowed && <CheckCircle2 size={12} className="text-green-500" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 pt-10 border-t border-stone-100">
                                <button
                                    onClick={handleSettingsSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-3 bg-stone-900 text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-stone-200 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {loading ? "Saving Changes..." : "Save Role Configuration"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-stone-50 bg-stone-50/50">
                                    <th className="px-12 py-8 text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Full Name</th>
                                    <th className="px-12 py-8 text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Username Tag</th>
                                    <th className="px-12 py-8 text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Security Role</th>
                                    <th className="px-12 py-8 text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-stone-50/50 transition-colors">
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-[20px] bg-stone-900 text-white flex items-center justify-center font-black text-lg">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <h4 className="font-black text-stone-800 text-base">{user.name}</h4>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-2 font-bold text-stone-400">
                                                <span className="text-stone-300">@</span>{user.username}
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black border tracking-widest ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-stone-50 text-stone-600 border-stone-100'}`}>
                                                <ShieldCheck size={12} /> {user.role}
                                            </span>
                                        </td>
                                        <td className="px-12 py-8 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setUserForm({ ...user, password: '' });
                                                        setShowUserModal(true);
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-stone-50 text-stone-400 flex items-center justify-center hover:bg-stone-900 hover:text-white hover:scale-110 transition-all border border-stone-100 active:scale-95 shadow-sm"
                                                    title="Modify Access"
                                                >
                                                    <SettingsIcon size={16} />
                                                </button>
                                                {user.username !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all border border-red-100 active:scale-95 shadow-sm"
                                                        title="Revoke Access"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "clients" && (
                    <div className="space-y-12 pb-20">
                        {/* Enhanced Header Section - Added more margins and padding */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-10 mt-8">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-stone-900 tracking-tight">Client Repository</h3>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-[10px] font-black text-stone-500 uppercase tracking-wider">
                                        <User size={10} /> {clients.length} Registered Profiles
                                    </span>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-l border-stone-200 pl-4">Master Database Management</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {/* Stylized Search Bar */}
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-stone-900 transition-colors">
                                        <Search size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone, or email..."
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="w-[300px] h-12 pl-12 pr-6 rounded-2xl bg-stone-50 border border-stone-100 focus:bg-white focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all outline-none text-sm font-bold placeholder:text-stone-300 placeholder:font-medium"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={fetchClients}
                                        className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:rotate-180 transition-all duration-700 shadow-sm active:scale-90"
                                        title="Sync Database"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        onClick={() => showToast("Manual client entry coming soon", "info")}
                                        className="h-12 px-6 rounded-2xl bg-stone-900 text-white flex items-center gap-3 hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 active:scale-95 group"
                                    >
                                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Profile</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mx-10 overflow-hidden bg-white rounded-[48px] border border-stone-200/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-50 bg-stone-50/30">
                                            <th className="px-12 py-9 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-none">Client Details</th>
                                            <th className="px-12 py-9 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-none">Contact Information</th>
                                            <th className="px-12 py-9 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-none text-center">Internal Status</th>
                                            <th className="px-12 py-9 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-none">Venue / Address</th>
                                            <th className="px-12 py-9 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-none text-right">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50/80">
                                        {clients.filter(c =>
                                            c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                            c.phone?.includes(clientSearch) ||
                                            c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                                        ).length > 0 ? clients.filter(c =>
                                            c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                            c.phone?.includes(clientSearch) ||
                                            c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                                        ).map((client) => (
                                            <tr key={client.id} className="group hover:bg-stone-50/40 transition-all duration-300">
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-3xl bg-stone-50 text-stone-900 flex items-center justify-center font-black text-xl border-2 border-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-500">
                                                            {client.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-stone-800 text-base leading-tight">{client.name}</h4>
                                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">UID: #{client.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-3 font-bold text-stone-700 text-sm">
                                                            <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center">
                                                                <Phone size={12} className="text-stone-400" />
                                                            </div>
                                                            {client.phone}
                                                        </div>
                                                        {client.email && (
                                                            <div className="flex items-center gap-3 text-xs text-stone-400 font-bold">
                                                                <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center">
                                                                    <Mail size={12} className="text-stone-300" />
                                                                </div>
                                                                {client.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black border tracking-[0.1em] ${clientDocs[client.id] ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' : 'bg-stone-50 text-stone-300 border-stone-100'}`}>
                                                            <UploadCloud size={12} /> {clientDocs[client.id] || 0} Assets
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 max-w-[320px]">
                                                    <div className="flex items-start gap-3 text-stone-500 text-sm font-bold leading-snug">
                                                        <div className="mt-0.5 p-1 rounded-lg bg-stone-50">
                                                            <MapPin size={12} className="text-stone-300" />
                                                        </div>
                                                        {client.address}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex justify-end items-center gap-3">
                                                        {/* Action Buttons */}
                                                        <button
                                                            onClick={() => window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                                                            className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:scale-110 transition-all border border-emerald-100 active:scale-90 shadow-sm"
                                                            title="Connect via WhatsApp"
                                                        >
                                                            <i className="fa-brands fa-whatsapp text-lg"></i>
                                                        </button>



                                                        {clientTestimonials[client.id] ? (
                                                            <button
                                                                onClick={() => toggleTestimonial(client.id)}
                                                                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border active:scale-90 shadow-sm hover:scale-110 ${clientTestimonials[client.id].isPublished
                                                                    ? "bg-amber-50 text-amber-600 border-amber-100/50 hover:bg-amber-100"
                                                                    : "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
                                                                    }`}
                                                                title={clientTestimonials[client.id].isPublished ? "Visible on Frontend" : "Hidden from Frontend"}
                                                            >
                                                                <Star size={18} fill={clientTestimonials[client.id].isPublished ? "currentColor" : "none"} />
                                                            </button>
                                                        ) : (
                                                            <div className="w-11 h-11 rounded-2xl bg-stone-50 text-stone-200 flex items-center justify-center border border-stone-100/50 opacity-40 grayscale cursor-not-allowed" title="Pending Client Review">
                                                                <Star size={18} />
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => setSelectedClient(client)}
                                                            className="w-11 h-11 rounded-2xl bg-white text-stone-400 flex items-center justify-center hover:bg-stone-900 hover:text-white hover:scale-110 transition-all border border-stone-100 active:scale-90 shadow-sm"
                                                            title="Full Dossier"
                                                        >
                                                            <Eye size={18} />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteClient(client.id)}
                                                            className="w-11 h-11 rounded-2xl bg-red-50 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all border border-red-100 active:scale-90 shadow-sm"
                                                            title="Terminate Record"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-10 py-32 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-6 max-w-sm mx-auto">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-stone-100 rounded-full scale-[2.5] blur-3xl opacity-50 animate-pulse"></div>
                                                            <div className="relative w-24 h-24 rounded-full bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center">
                                                                <UserCircle size={48} className="text-stone-300" strokeWidth={1} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 relative">
                                                            <p className="font-black text-stone-900 text-xl tracking-tight">Empty Repository</p>
                                                            <p className="text-sm font-bold text-stone-400 leading-relaxed">
                                                                {clientSearch
                                                                    ? "No profiles match your current search parameters. Try a different query."
                                                                    : "No client authenticated profiles were found in the master database. Initiate your first entry to begin."}
                                                            </p>
                                                        </div>
                                                        {!clientSearch && (
                                                            <button
                                                                onClick={() => showToast("Manual entry coming soon", "info")}
                                                                className="px-8 py-3 rounded-2xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-stone-200 active:scale-95 transition-all"
                                                            >
                                                                Initiate Entry
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium User Modal */}
            {
                showUserModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowUserModal(false)}></div>
                        <div className="relative bg-white rounded-[56px] w-full max-w-xl p-12 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-stone-900 leading-tight">
                                        {userForm.id ? "Modify Access" : "Provision Access"}
                                    </h2>
                                    <p className="text-sm font-bold text-stone-400 mt-1 uppercase tracking-widest">User Management Control</p>
                                </div>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all border border-stone-100"
                                >
                                    <Globe size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUserSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">Full Identity</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[24px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                                            value={userForm.name}
                                            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                            placeholder="e.g. Amanda Rozia"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">Role Permissions</label>
                                        <div className="bg-stone-50 p-2 rounded-[32px] border border-stone-100">
                                            <div className="flex flex-col gap-1">
                                                {availableRoles.map((role) => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => setUserForm({ ...userForm, role })}
                                                        className={`flex items-center justify-between px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all duration-300 ${userForm.role === role
                                                            ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                                                            : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            {userForm.role === role && <CheckCircle2 size={14} />}
                                                            {role}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">Username Tag</label>
                                    <div className="relative group">
                                        <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full bg-stone-50 border-2 border-transparent p-5 pl-14 rounded-[24px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                                            value={userForm.username}
                                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                            placeholder="username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">
                                        {userForm.id ? "Reset Password (Optional)" : "Master Password"}
                                    </label>
                                    <div className="relative group">
                                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        <input
                                            type="password"
                                            required={!userForm.id}
                                            className="w-full bg-stone-50 border-2 border-transparent p-5 pl-14 rounded-[24px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                                            value={userForm.password}
                                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowUserModal(false)}
                                        className="flex-1 bg-stone-50 text-stone-400 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-100 transition-all active:scale-95"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-stone-900 text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-stone-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Processing..." : userForm.id ? "Commit Changes" : "Confirm User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Client Details Modal */}
            {
                selectedClient && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedClient(null)}></div>
                        <div className="relative bg-white rounded-[56px] w-full max-w-xl p-12 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-stone-900 leading-tight">Client Account</h2>
                                    <p className="text-sm font-bold text-stone-400 mt-1 uppercase tracking-widest">Comprehensive profile data</p>
                                </div>
                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all border border-stone-100"
                                >
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-10">
                                <div className="flex items-center gap-8 p-8 bg-stone-50 rounded-[40px] border border-stone-100">
                                    <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-stone-200 flex items-center justify-center font-black text-3xl text-stone-900 border border-stone-100">
                                        {selectedClient.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-stone-900">{selectedClient.name}</h4>
                                        <p className="text-xs font-black text-stone-300 uppercase tracking-[0.2em] mt-1">
                                            Active Client Profile
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-white rounded-[32px] border border-stone-100 shadow-sm">
                                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest block mb-1 ml-1">Username Tag</label>
                                        <div className="flex items-center gap-3 font-bold text-stone-800">
                                            <User size={14} className="text-stone-300" /> @{selectedClient.username || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white rounded-[32px] border border-stone-100 shadow-sm">
                                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest block mb-1 ml-1">Joined Jenggala</label>
                                        <div className="flex items-center gap-3 font-bold text-stone-800">
                                            <ShieldCheck size={14} className="text-stone-300" /> {new Date(selectedClient.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white rounded-[32px] border border-stone-100 shadow-sm">
                                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest block mb-1 ml-1">Verified Phone</label>
                                        <div className="flex items-center gap-3 font-bold text-stone-800">
                                            <Phone size={14} className="text-stone-300" /> {selectedClient.phone}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white rounded-[32px] border border-stone-100 shadow-sm">
                                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest block mb-1 ml-1">Contact Email</label>
                                        <div className="flex items-center gap-3 font-bold text-stone-800 truncate">
                                            <Mail size={14} className="text-stone-300" /> {selectedClient.email || 'No email provided'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-stone-900 text-white rounded-[40px] shadow-2xl shadow-stone-200">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3 ml-1">Service Delivery Address</label>
                                    <p className="text-sm font-medium leading-relaxed text-white/90">
                                        {selectedClient.address}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="w-full bg-stone-100 text-stone-900 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-200 transition-all active:scale-95"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Send Data / Project Details Modal */}


            {/* Premium Confirmation Modal */}
            {
                confirmModal.isOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
                        <div className="relative bg-white rounded-[48px] w-full max-w-sm p-10 shadow-2xl border border-white animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${confirmModal.isDestructive ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-500'}`}>
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-stone-900 mb-2">{confirmModal.title}</h3>
                                <p className="text-stone-400 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <button
                                        onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                        className="bg-stone-50 text-stone-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            confirmModal.onConfirm();
                                            setConfirmModal({ ...confirmModal, isOpen: false });
                                        }}
                                        className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 text-white ${confirmModal.isDestructive ? 'bg-red-500 shadow-red-200 hover:bg-red-600' : 'bg-stone-900 shadow-stone-200 hover:bg-stone-800'}`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="absolute top-6 right-6 text-stone-300 hover:text-stone-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Premium Add Role Modal */}
            {
                showAddRoleModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowAddRoleModal(false)}></div>
                        <div className="relative bg-white rounded-[48px] w-full max-w-sm p-10 shadow-2xl border border-white animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                            <div className="flex flex-col">
                                <h3 className="text-2xl font-black text-stone-900 mb-2">Create New Role</h3>
                                <p className="text-stone-400 text-sm font-medium mb-8">Define a new security authority for the platform.</p>

                                <div className="space-y-4 mb-8">
                                    <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest ml-1">Role Identifier</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[24px] focus:bg-white focus:border-stone-900 outline-none transition-all font-black text-stone-800"
                                        placeholder="e.g. SUPERVISOR"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addRole()}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            setShowAddRoleModal(false);
                                            setNewRoleName("");
                                        }}
                                        className="bg-stone-50 text-stone-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all active:scale-95"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={addRole}
                                        className="bg-stone-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-stone-200 hover:bg-stone-800 transition-all active:scale-95"
                                    >
                                        Create Role
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddRoleModal(false)}
                                className="absolute top-6 right-6 text-stone-300 hover:text-stone-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Premium Toast Notification */}
            {
                toast.show && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-bottom-10 fade-in duration-500">
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

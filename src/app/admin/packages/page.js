"use client";
import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Edit2, Check, X, ChevronDown, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PackagesContent() {
    const searchParams = useSearchParams();
    const queryGroupId = searchParams.get("groupId");

    const [packages, setPackages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        features: "",
        isPopular: false,
        groupId: "",
    });

    const [packageGroupFilter, setPackageGroupFilter] = useState("all");
    const [isGroupFilterDropdownOpen, setIsGroupFilterDropdownOpen] = useState(false);
    const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);

    // New state for service items
    const [allServiceItems, setAllServiceItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showItemsModal, setShowItemsModal] = useState(false);
    const [itemCategoryFilter, setItemCategoryFilter] = useState("All");
    const [allGroups, setAllGroups] = useState([]);
    const [itemGroupFilter, setItemGroupFilter] = useState("All");

    // Handle initial filter from query param
    useEffect(() => {
        if (queryGroupId) {
            setPackageGroupFilter(queryGroupId);
        }
    }, [queryGroupId]);

    // Custom Select Component
    const CustomSelect = ({ value, onChange, options, placeholder, isOpen, setIsOpen, label, allLabel = "All Groups" }) => {
        const selectedOption = options.find(opt => opt.id === parseInt(value)) || (value === "all" ? { name: allLabel } : null);

        return (
            <div className="relative w-full">
                {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{label}</label>}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-gray-100 focus:ring-2 focus:ring-black outline-none"
                >
                    <span className={`font-bold ${!selectedOption ? "text-gray-400" : "text-[#2D2D2D]"}`}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                    <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} size={20} />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[101] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-gray-50 flex items-center justify-between ${(parseInt(value) === opt.id || (value === "all" && opt.id === "all")) ? "text-black bg-gray-50" : "text-gray-500"
                                        }`}
                                >
                                    {opt.name}
                                    {(parseInt(value) === opt.id || (value === "all" && opt.id === "all")) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    useEffect(() => {
        fetchPackages();
        fetchAllServiceItems();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch("/api/packages");
            const data = await res.json();
            // Sanitize data to ensure all fields are safe to render
            const sanitizedData = Array.isArray(data) ? data.map(pkg => ({
                ...pkg,
                name: pkg.name || '',
                price: pkg.price || 0,
                features: pkg.features || '',
                isPopular: Boolean(pkg.isPopular),
                groupId: pkg.groupId || null,
                group: pkg.group || null
            })) : [];
            setPackages(sanitizedData);
        } catch (error) {
            console.error("Error fetching packages:", error);
            setPackages([]);
        }
    };

    const fetchAllServiceItems = async () => {
        try {
            const groupsRes = await fetch("/api/service-groups");
            const groups = await groupsRes.json();
            setAllGroups(Array.isArray(groups) ? groups : []);

            // Also keep flatItems for backward compatibility or easier searching if needed
            let flat = [];
            groups.forEach(group => {
                group.categories.forEach(category => {
                    category.items.forEach(item => {
                        flat.push({
                            ...item,
                            serviceName: category.title,
                            groupName: group.name
                        });
                    });
                });
            });
            setAllServiceItems(flat);
        } catch (error) {
            console.error("Error fetching service items:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingPackage
                ? `/api/packages/${editingPackage.id}`
                : "/api/packages";
            const method = editingPackage ? "PUT" : "POST";

            // Convert selected items to comma-separated string
            const featuresString = selectedItems.join(", ");

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    features: featuresString
                }),
            });

            if (res.ok) {
                fetchPackages();
                setIsModalOpen(false);
                setEditingPackage(null);
                setFormData({ name: "", price: "", features: "", isPopular: false, groupId: "" });
                setSelectedItems([]);
            }
        } catch (error) {
            console.error("Error saving package:", error);
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name || "",
            price: pkg.price || "",
            features: pkg.features || "",
            isPopular: pkg.isPopular || false,
            groupId: pkg.groupId || "",
        });
        // Parse existing features back to selected items
        const existingFeatures = pkg.features ? pkg.features.split(",").map(f => f.trim()).filter(Boolean) : [];
        setSelectedItems(existingFeatures);
        setIsModalOpen(true);
    };

    const toggleItem = (item) => {
        const itemIdentifier = `${item.serviceName}: ${item.name}`;
        setSelectedItems(prev => {
            if (prev.includes(itemIdentifier)) {
                return prev.filter(name => name !== itemIdentifier);
            } else {
                return [...prev, itemIdentifier];
            }
        });
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this package?")) {
            try {
                await fetch(`/api/packages/${id}`, { method: "DELETE" });
                fetchPackages();
            } catch (error) {
                console.error("Error deleting package:", error);
            }
        }
    };

    const openNewModal = () => {
        setEditingPackage(null);
        setFormData({
            name: "",
            price: "",
            features: "",
            isPopular: false,
            groupId: packageGroupFilter !== "all" ? packageGroupFilter : ""
        });
        setSelectedItems([]);
        setIsModalOpen(true);
    };

    const toggleCategory = (serviceName) => {
        setSelectedItems(prev => {
            if (prev.includes(serviceName)) {
                return prev.filter(name => name !== serviceName);
            } else {
                return [...prev, serviceName];
            }
        });
    };

    return (
        <div className="space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">Wedding Packages</h1>
                    <p className="text-gray-400 text-sm">Manage your exclusive wedding plans and pricing.</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 md:py-3 rounded-2xl md:rounded-full hover:scale-105 transition-transform font-bold shadow-lg shadow-black/10 w-full md:w-auto"
                >
                    <Plus size={20} />
                    Add New Package
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100/50">
                <div className="max-w-xs">
                    <CustomSelect
                        value={packageGroupFilter}
                        onChange={(val) => setPackageGroupFilter(val)}
                        options={[{ id: "all", name: "All Package Groups" }, ...(Array.isArray(allGroups) ? allGroups : [])]}
                        placeholder="Filter by Group"
                        isOpen={isGroupFilterDropdownOpen}
                        setIsOpen={setIsGroupFilterDropdownOpen}
                        allLabel="All Package Groups"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {packages
                    .filter(pkg => packageGroupFilter === "all" || pkg.groupId === parseInt(packageGroupFilter))
                    .map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 md:p-8 relative border border-gray-100/50 hover:shadow-xl hover:shadow-black/5 transition-all group overflow-hidden">
                            {pkg.isPopular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-[#FFDE6B] text-black text-[10px] font-black px-8 py-1 uppercase tracking-widest rotate-45 translate-x-6 translate-y-2 shadow-sm">
                                        Popular
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-black text-[#2D2D2D]">{String(pkg.name || '')}</h3>
                                    {pkg.group?.name && (
                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">
                                            {String(pkg.group.name)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-gray-400">Rp</span>
                                    <span className="text-4xl font-black text-black tracking-tighter">
                                        {Number(pkg.price || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 min-h-[160px]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">What's Included</p>
                                <ul className="space-y-3">
                                    {pkg.features && Array.from(new Set(
                                        pkg.features.split(",")
                                            .filter(Boolean)
                                            .map(f => f.includes(":") ? f.split(":")[0].trim() : f.trim())
                                    )).map((category, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-[#2D2D2D] font-bold">
                                            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-500 mt-0.5 flex-shrink-0 border border-green-100/50">
                                                <Check size={11} strokeWidth={4} />
                                            </div>
                                            {category}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleEdit(pkg)}
                                    className="flex-1 bg-gray-50 text-black py-3 rounded-2xl font-bold text-sm hover:bg-black hover:text-white transition-all duration-300"
                                >
                                    Edit Details
                                </button>
                                <button
                                    onClick={() => handleDelete(pkg.id)}
                                    className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-lg p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#2D2D2D]">
                                    {editingPackage ? "Edit Package" : "Create Package"}
                                </h2>
                                <p className="text-sm text-gray-400">Set up the details for your wedding plan.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-200/50">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Package Name</label>
                                <input
                                    type="text" required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    placeholder="e.g. Royal Jenggala"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (IDR)</label>
                                <input
                                    type="number" required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    placeholder="50000000"
                                    value={formData.price || ""}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value === "" ? "" : Number(e.target.value) })}
                                />
                            </div>
                            <CustomSelect
                                label="Group (Optional)"
                                value={formData.groupId}
                                onChange={(val) => setFormData({ ...formData, groupId: val })}
                                options={Array.isArray(allGroups) ? allGroups : []}
                                placeholder="Select a Group"
                                isOpen={isFormDropdownOpen}
                                setIsOpen={setIsFormDropdownOpen}
                            />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Package Items</label>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    {selectedItems.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic text-center py-4">No items selected yet</p>
                                    ) : (
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                            {Array.from(new Set(selectedItems.map(item => item.includes(":") ? item.split(":")[0].trim() : item))).map((categoryName, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-all shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-black/20"></div>
                                                        <span className="text-sm font-bold text-[#2D2D2D]">{categoryName}</span>
                                                        {selectedItems.filter(item => item.startsWith(categoryName + ":")).length > 0 && (
                                                            <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                                                                {selectedItems.filter(item => item.startsWith(categoryName + ":")).length} Details
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedItems(prev => prev.filter(item =>
                                                                item !== categoryName && !item.startsWith(categoryName + ":")
                                                            ));
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowItemsModal(true)}
                                    className="w-full bg-black text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    Manage Items
                                </button>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isPopular"
                                    checked={formData.isPopular}
                                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                    className="w-5 h-5 accent-black rounded-lg"
                                />
                                <label htmlFor="isPopular" className="text-sm font-bold text-gray-700 select-none">
                                    Display "Popular" Badge
                                </label>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                >
                                    {editingPackage ? "Save Changes" : "Create Now"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Items Selector Sidebar Modal */}
            {showItemsModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-end">
                    <div className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowItemsModal(false)}></div>
                    <div className="relative bg-white h-full w-full max-w-2xl shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-6 md:p-10 border-b border-gray-50 flex justify-between items-center bg-[#F7F4EF]/50">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-[#2D2D2D]">Select Package Items</h2>
                                <p className="text-sm text-gray-400 mt-1">Choose items to include in this package</p>
                            </div>
                            <button onClick={() => setShowItemsModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-black transition-colors shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6 md:p-10 pt-6">
                            {allServiceItems.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-gray-400 italic">No service items available.</p>
                                    <p className="text-sm text-gray-400 mt-2">Please add items in the Collaboration section first.</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {/* Group Tabs */}
                                    <div className="flex flex-wrap gap-2 sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 border-b border-gray-50">
                                        <button
                                            onClick={() => { setItemGroupFilter("All"); setItemCategoryFilter("All"); }}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${itemGroupFilter === "All"
                                                ? "bg-black text-white shadow-md scale-105"
                                                : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black"
                                                }`}
                                        >
                                            All Groups
                                        </button>
                                        {(Array.isArray(allGroups) ? allGroups : []).map(group => (
                                            <button
                                                key={group.id}
                                                onClick={() => { setItemGroupFilter(group.name); setItemCategoryFilter("All"); }}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${itemGroupFilter === group.name
                                                    ? "bg-black text-white shadow-md scale-105"
                                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black"
                                                    }`}
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Category Filter for selected Group */}
                                    {itemGroupFilter !== "All" && (
                                        <div className="flex flex-wrap gap-2 py-2">
                                            <button
                                                onClick={() => setItemCategoryFilter("All")}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${itemCategoryFilter === "All"
                                                    ? "bg-stone-100 border-black text-black"
                                                    : "border-gray-100 text-gray-400 hover:border-gray-200"
                                                    }`}
                                            >
                                                All {itemGroupFilter} Categories
                                            </button>
                                            {(Array.isArray(allGroups) ? allGroups : []).find(g => g.name === itemGroupFilter)?.categories?.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setItemCategoryFilter(cat.title)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${itemCategoryFilter === cat.title
                                                        ? "bg-stone-100 border-black text-black"
                                                        : "border-gray-100 text-gray-400 hover:border-gray-200"
                                                        }`}
                                                >
                                                    {cat.title}
                                                </button>
                                            )) || []}
                                        </div>
                                    )}

                                    {/* Render by Group -> Category */}
                                    {(Array.isArray(allGroups) ? allGroups : [])
                                        .filter(group => itemGroupFilter === "All" || itemGroupFilter === group.name)
                                        .map(group => (
                                            <div key={group.id} className="space-y-8 animate-in fade-in duration-500">
                                                <div className="flex items-center gap-4">
                                                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-[0.2em]">{group.name}</h2>
                                                    <div className="h-0.5 bg-stone-900/10 flex-1"></div>
                                                </div>

                                                <div className="space-y-10 pl-4">
                                                    {group.categories
                                                        .filter(category => itemCategoryFilter === "All" || itemCategoryFilter === category.title)
                                                        .map(category => {
                                                            const isCatIncluded = selectedItems.includes(category.title);
                                                            return (
                                                                <div key={category.id} className="space-y-6">
                                                                    <div className="flex items-center gap-4 py-2">
                                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isCatIncluded}
                                                                                onChange={() => toggleCategory(category.title)}
                                                                                className="w-5 h-5 accent-black rounded-lg cursor-pointer transition-all active:scale-95"
                                                                            />
                                                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest group-hover:text-black transition-colors">
                                                                                {category.title}
                                                                            </h3>
                                                                        </label>
                                                                        <div className="h-px bg-gray-100 flex-1"></div>
                                                                        <span className="text-[10px] font-bold text-gray-300 italic">
                                                                            {category.items.filter(item => selectedItems.includes(`${category.title}: ${item.name}`)).length} / {category.items.length}
                                                                        </span>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {category.items.map(item => (
                                                                            <label
                                                                                key={item.id}
                                                                                className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all group border-2 ${selectedItems.includes(`${category.title}: ${item.name}`)
                                                                                    ? "bg-white border-black shadow-lg shadow-black/5"
                                                                                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                                                                                    }`}
                                                                            >
                                                                                <div className="relative flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={selectedItems.includes(`${category.title}: ${item.name}`)}
                                                                                        onChange={() => toggleItem({ ...item, serviceName: category.title })}
                                                                                        className="w-6 h-6 accent-black rounded-lg cursor-pointer"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-black text-[#2D2D2D] transition-colors line-clamp-1">{item.name}</p>
                                                                                    {item.description && (
                                                                                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 leading-relaxed italic">{item.description}</p>
                                                                                    )}
                                                                                </div>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 md:p-10 border-t border-gray-100 bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">Selected Items</p>
                                    <p className="text-xs text-gray-400">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected</p>
                                </div>
                                {selectedItems.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedItems([])}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowItemsModal(false)}
                                className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PackagesPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading Packages...</div>}>
            <PackagesContent />
        </Suspense>
    );
}

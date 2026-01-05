"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Search, Grid3x3, List, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MasterItemsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("categories");
    const [groups, setGroups] = useState([]);
    const [services, setServices] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedService, setSelectedService] = useState("all");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [detailTemplates, setDetailTemplates] = useState([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateFormData, setTemplateFormData] = useState({
        name: "",
        content: ""
    });

    // View items modal
    const [viewingCategoryItems, setViewingCategoryItems] = useState(null);

    // Custom Dropdown State
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isGroupFilterDropdownOpen, setIsGroupFilterDropdownOpen] = useState(false);
    const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
    const [isGroupFormDropdownOpen, setIsGroupFormDropdownOpen] = useState(false);

    // Custom Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "Are you sure?",
        message: "This action cannot be undone.",
        onConfirm: () => { },
        confirmText: "Delete",
        confirmColor: "bg-red-500"
    });

    const showConfirm = (title, message, onConfirm, confirmText = "Delete", confirmColor = "bg-red-500") => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            confirmText,
            confirmColor
        });
    };

    // Custom Select Component
    const CustomSelect = ({ value, onChange, options, placeholder, isOpen, setIsOpen, label, allLabel = "All Categories" }) => {
        const selectedOption = options.find(opt => opt.id === parseInt(value)) || (value === "all" ? { title: allLabel } : null);

        return (
            <div className="relative w-full">
                {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{label}</label>}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-gray-100 focus:ring-2 focus:ring-black outline-none"
                >
                    <span className={`font-bold ${!selectedOption ? "text-gray-400" : "text-[#2D2D2D]"}`}>
                        {selectedOption ? selectedOption.title || selectedOption.name : placeholder}
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
                                    {opt.title || opt.name}
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

    // Category modal states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({
        title: "",
        description: "",
        details: "",
        icon: "fa-solid fa-star",
        groupId: "",
    });

    // Group modal states
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupFormData, setGroupFormData] = useState({
        name: "",
        description: "",
    });

    // Item modal states
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemFormData, setItemFormData] = useState({
        name: "",
        description: "",
        price: "",
        socialIcon: "fa-brands fa-instagram",
        socialLink: "",
        locationUrl: "",
        image: "",
        serviceId: "",
        detailTemplateIds: []
    });

    const categoryIcons = [
        { icon: "fa-solid fa-building", label: "Venue" },
        { icon: "fa-solid fa-utensils", label: "Catering" },
        { icon: "fa-solid fa-wand-magic-sparkles", label: "MUA" },
        { icon: "fa-solid fa-camera", label: "Photography" },
        { icon: "fa-solid fa-camera-retro", label: "Photography Alt" },
        { icon: "fa-solid fa-video", label: "Videography" },
        { icon: "fa-solid fa-microphone-lines", label: "MC" },
        { icon: "fa-solid fa-music", label: "Music" },
        { icon: "fa-solid fa-cake-candles", label: "Cake" },
        { icon: "fa-solid fa-gift", label: "Souvenir" },
        { icon: "fa-solid fa-users", label: "Crew" },
        { icon: "fa-solid fa-shirt", label: "Attire" },
        { icon: "fa-solid fa-ring", label: "Jewelry" },
        { icon: "fa-solid fa-envelope-open-text", label: "Invitation" },
        { icon: "fa-solid fa-car", label: "Transportation" },
        { icon: "fa-solid fa-martini-glass-citrus", label: "Drinks" },
        { icon: "fa-solid fa-heart", label: "Love" },
        { icon: "fa-solid fa-star", label: "Other" },
    ];

    const socialIcons = [
        { icon: "fa-brands fa-instagram", label: "Instagram" },
        { icon: "fa-brands fa-whatsapp", label: "WhatsApp" },
        { icon: "fa-brands fa-tiktok", label: "TikTok" },
        { icon: "fa-brands fa-facebook", label: "Facebook" },
        { icon: "fa-brands fa-x-twitter", label: "X" },
        { icon: "fa-brands fa-youtube", label: "YouTube" },
        { icon: "fa-solid fa-globe", label: "Website" },
        { icon: "fa-solid fa-link", label: "Link" },
    ];

    useEffect(() => {
        fetchGroups();
        fetchServices();
        fetchAllItems();
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/detail-templates");
            const data = await res.json();
            setDetailTemplates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/service-groups");
            const data = await res.json();
            setGroups(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    useEffect(() => {
        filterItems();
    }, [selectedService, selectedGroup, searchQuery, allItems]);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const fetchAllItems = async () => {
        try {
            const servicesRes = await fetch("/api/services");
            const servicesData = await servicesRes.json();

            const itemsPromises = servicesData.map(async (service) => {
                const itemsRes = await fetch(`/api/services/${service.id}/items`);
                const items = await itemsRes.json();
                return items.map((item) => ({
                    ...item,
                    serviceName: service.title,
                    serviceId: service.id,
                }));
            });

            const itemsArrays = await Promise.all(itemsPromises);
            const flatItems = itemsArrays.flat();
            setAllItems(flatItems);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const filterItems = () => {
        let filtered = allItems;

        if (selectedService !== "all") {
            filtered = filtered.filter((item) => item.serviceId === parseInt(selectedService));
        }

        if (selectedGroup !== "all") {
            // Find service IDs that belong to the selected group
            const groupServiceIds = services
                .filter(s => s.groupId === parseInt(selectedGroup))
                .map(s => s.id);
            filtered = filtered.filter((item) => groupServiceIds.includes(item.serviceId));
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        setFilteredItems(filtered);
    };

    // Category handlers
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCategory ? `/api/services/${editingCategory.id}` : "/api/services";
            const method = editingCategory ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: categoryFormData.title,
                    description: categoryFormData.description,
                    details: categoryFormData.details,
                    icon: categoryFormData.icon,
                    groupId: categoryFormData.groupId ? parseInt(categoryFormData.groupId) : null,
                }),
            });

            if (res.ok) {
                fetchServices();
                fetchAllItems();
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
                resetCategoryForm();
            }
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryFormData({
            title: category.title || "",
            description: category.description || "",
            details: category.details || "",
            icon: category.icon || "fa-solid fa-star",
            groupId: category.groupId || "",
        });
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (category) => {
        const itemCount = allItems.filter(item => item.serviceId === category.id).length;
        const message = itemCount > 0
            ? `Are you sure you want to delete "${category.title}"? This will also delete ${itemCount} item(s) in this category.`
            : `Are you sure you want to delete "${category.title}"?`;

        showConfirm(
            "Delete Category",
            message,
            async () => {
                try {
                    await fetch(`/api/services/${category.id}`, { method: "DELETE" });
                    fetchServices();
                    fetchAllItems();
                } catch (error) {
                    console.error("Error deleting category:", error);
                }
            },
            "Delete Category"
        );
    };

    const openNewCategoryModal = () => {
        setEditingCategory(null);
        resetCategoryForm(selectedGroup !== "all" ? selectedGroup : (groups.length > 0 ? groups[0].id : ""));
        setIsCategoryModalOpen(true);
    };

    const resetCategoryForm = (defaultGroupId = "") => {
        setCategoryFormData({
            title: "",
            description: "",
            details: "",
            icon: "fa-solid fa-star",
            groupId: defaultGroupId || (groups.length > 0 ? groups[0].id : ""),
        });
    };

    // Group handlers
    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingGroup ? `/api/service-groups/${editingGroup.id}` : "/api/service-groups";
            const method = editingGroup ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(groupFormData),
            });

            if (res.ok) {
                fetchGroups();
                setIsGroupModalOpen(false);
                setEditingGroup(null);
                resetGroupForm();
            }
        } catch (error) {
            console.error("Error saving group:", error);
        }
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setGroupFormData({
            name: group.name || "",
            description: group.description || "",
        });
        setIsGroupModalOpen(true);
    };

    const handleDeleteGroup = async (group) => {
        showConfirm(
            "Delete Group",
            `Are you sure you want to delete group "${group.name}"? This will also affect categories within this group.`,
            async () => {
                try {
                    await fetch(`/api/service-groups/${group.id}`, { method: "DELETE" });
                    fetchGroups();
                    fetchServices();
                } catch (error) {
                    console.error("Error deleting group:", error);
                }
            }
        );
    };

    const openNewGroupModal = () => {
        setEditingGroup(null);
        resetGroupForm();
        setIsGroupModalOpen(true);
    };

    const resetGroupForm = () => {
        setGroupFormData({
            name: "",
            description: "",
        });
    };

    // Item handlers
    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `/api/service-items/${editingItem.id}`
                : `/api/services/${itemFormData.serviceId}/items`;
            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemFormData),
            });

            if (res.ok) {
                fetchAllItems();
                setIsItemModalOpen(false);
                setEditingItem(null);
                resetItemForm();
            }
        } catch (error) {
            console.error("Error saving item:", error);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setItemFormData({
            name: item.name || "",
            description: item.description || "",
            price: item.price || "",
            socialIcon: item.socialIcon || "fa-brands fa-instagram",
            socialLink: item.socialLink || "",
            locationUrl: item.locationUrl || "",
            image: item.image || "",
            serviceId: item.serviceId || "",
            detailTemplateIds: item.detailTemplates?.map(t => t.id) || []
        });
        setIsItemModalOpen(true);
    };

    const handleDeleteItem = async (item) => {
        showConfirm(
            "Delete Item",
            `Are you sure you want to delete "${item.name}"? This action is permanent.`,
            async () => {
                try {
                    await fetch(`/api/service-items/${item.id}`, { method: "DELETE" });
                    fetchAllItems();
                } catch (error) {
                    console.error("Error deleting item:", error);
                }
            }
        );
    };

    const openNewItemModal = () => {
        setEditingItem(null);
        resetItemForm();
        setIsItemModalOpen(true);
    };

    const resetItemForm = () => {
        setItemFormData({
            name: "",
            description: "",
            price: "",
            socialIcon: "fa-brands fa-instagram",
            socialLink: "",
            locationUrl: "",
            image: "",
            serviceId: services.length > 0 ? services[0].id : "",
            detailTemplateIds: []
        });
    };

    // Template handlers
    const handleTemplateSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingTemplate ? `/api/detail-templates/${editingTemplate.id}` : "/api/detail-templates";
            const method = editingTemplate ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(templateFormData),
            });

            if (res.ok) {
                fetchTemplates();
                setIsTemplateModalOpen(false);
                setEditingTemplate(null);
                setTemplateFormData({ name: "", content: "" });
            }
        } catch (error) {
            console.error("Error saving template:", error);
        }
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setTemplateFormData({
            name: template.name || "",
            content: template.content || ""
        });
        setIsTemplateModalOpen(true);
    };

    const handleDeleteTemplate = async (template) => {
        showConfirm(
            "Delete Master Detail",
            `Are you sure you want to delete template "${template.name}"? It will be removed from all associated items.`,
            async () => {
                try {
                    await fetch(`/api/detail-templates/${template.id}`, { method: "DELETE" });
                    fetchTemplates();
                } catch (error) {
                    console.error("Error deleting template:", error);
                }
            }
        );
    };

    const openNewTemplateModal = () => {
        setEditingTemplate(null);
        setTemplateFormData({ name: "", content: "" });
        setIsTemplateModalOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">Master Items</h1>
                    <p className="text-gray-400 text-sm">Manage categories and service items</p>
                </div>
                <button
                    onClick={
                        activeTab === "groups" ? openNewGroupModal :
                            activeTab === "categories" ? openNewCategoryModal :
                                activeTab === "details" ? openNewTemplateModal :
                                    openNewItemModal
                    }
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 md:py-3 rounded-2xl md:rounded-full hover:scale-105 transition-transform font-bold shadow-lg shadow-black/10 w-full md:w-auto"
                >
                    <Plus size={20} />
                    {activeTab === "groups" ? "Add Group" :
                        activeTab === "categories" ? "Add Category" :
                            activeTab === "details" ? "Add Detail" :
                                "Add Item"}
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-1.5 md:p-2 shadow-sm border border-gray-100/50 flex gap-1 md:gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("groups")}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-[18px] md:rounded-[24px] font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === "groups"
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-400 hover:text-black"
                        }`}
                >
                    <Grid3x3 size={16} className="hidden sm:inline-block mr-2" />
                    Groups
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-[18px] md:rounded-[24px] font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === "categories"
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-400 hover:text-black"
                        }`}
                >
                    <Grid3x3 size={16} className="hidden sm:inline-block mr-2" />
                    Categories
                </button>
                <button
                    onClick={() => setActiveTab("items")}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-[18px] md:rounded-[24px] font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === "items"
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-400 hover:text-black"
                        }`}
                >
                    <List size={16} className="hidden sm:inline-block mr-2" />
                    Items
                </button>
                <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-[18px] md:rounded-[24px] font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === "details"
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-400 hover:text-black"
                        }`}
                >
                    <List size={16} className="hidden sm:inline-block mr-2" />
                    Details
                </button>
            </div>

            {/* Groups Tab Content */}
            {activeTab === "groups" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-400 italic">No groups yet. Create your first one!</p>
                        </div>
                    ) : (
                        groups.map((group) => {
                            const groupCategories = services.filter(s => s.groupId === group.id);
                            return (
                                <div
                                    key={group.id}
                                    className="bg-white rounded-[32px] shadow-sm p-8 relative border border-gray-100/50 hover:shadow-xl hover:shadow-black/5 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-xl font-black text-stone-900">
                                            {group.name.charAt(0)}
                                        </div>
                                        <span className="px-3 py-1 bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {groupCategories.length} {groupCategories.length === 1 ? 'category' : 'categories'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-[#2D2D2D] mb-2">{group.name}</h3>
                                    {group.description && (
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">{group.description}</p>
                                    )}
                                    <div className="flex flex-col gap-3 mt-auto">
                                        <button
                                            onClick={() => {
                                                router.push(`/admin/packages?groupId=${group.id}`);
                                            }}
                                            className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all duration-300 shadow-md shadow-black/5"
                                        >
                                            Manage Packages
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEditGroup(group)}
                                                className="flex-1 bg-gray-50 text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all duration-300"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group)}
                                                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Categories Tab Content */}
            {activeTab === "categories" && (
                <div className="space-y-6">
                    {/* Category Filter */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100/50">
                        <div className="w-full md:w-64">
                            <CustomSelect
                                value={selectedGroup}
                                onChange={(val) => setSelectedGroup(val)}
                                options={[{ id: "all", title: "All Groups" }, ...groups.map(g => ({ id: g.id, title: g.name }))]}
                                placeholder="Filter by Group"
                                isOpen={isGroupFilterDropdownOpen}
                                setIsOpen={setIsGroupFilterDropdownOpen}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(selectedGroup === "all" ? services : services.filter(s => s.groupId === parseInt(selectedGroup))).length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-400 italic">No categories found in this group.</p>
                            </div>
                        ) : (
                            services.filter(category => selectedGroup === "all" || category.groupId === parseInt(selectedGroup)).map((category) => {
                                const categoryItems = allItems.filter(item => item.serviceId === category.id);
                                const itemCount = categoryItems.length;
                                return (
                                    <div
                                        key={category.id}
                                        className="bg-white rounded-[32px] shadow-sm p-8 relative border border-gray-100/50 hover:shadow-xl hover:shadow-black/5 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex flex-col">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                                                    <i className={category.icon || "fa-solid fa-star"}></i>
                                                </div>
                                                {category.group && (
                                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-2 ml-1">
                                                        {category.group.name}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black rounded-full">
                                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-[#2D2D2D] mb-2">{category.title}</h3>
                                        {category.description && (
                                            <p className="text-sm text-gray-500 mb-6 line-clamp-2">{category.description}</p>
                                        )}

                                        <div className="space-y-3">
                                            {itemCount > 0 && (
                                                <button
                                                    onClick={() => setViewingCategoryItems({ category, items: categoryItems })}
                                                    className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <List size={16} />
                                                    View {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                                                </button>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="flex-1 bg-gray-50 text-black py-3 rounded-xl font-bold text-sm hover:bg-black hover:text-white transition-all duration-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Items Tab Content */}
            {activeTab === "items" && (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                                />
                            </div>
                            <CustomSelect
                                value={selectedGroup}
                                onChange={(val) => {
                                    setSelectedGroup(val);
                                    setSelectedService("all"); // Reset category filter when group changes
                                }}
                                options={[{ id: "all", name: "All Groups" }, ...groups]}
                                placeholder="All Groups"
                                isOpen={isGroupFilterDropdownOpen}
                                setIsOpen={setIsGroupFilterDropdownOpen}
                                allLabel="All Groups"
                            />
                            <CustomSelect
                                value={selectedService}
                                onChange={(val) => setSelectedService(val)}
                                options={[{ id: "all", title: "All Categories" }, ...(selectedGroup === "all" ? services : services.filter(s => s.groupId === parseInt(selectedGroup)))]}
                                placeholder="All Categories"
                                isOpen={isFilterDropdownOpen}
                                setIsOpen={setIsFilterDropdownOpen}
                                allLabel="All Categories"
                            />
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-400 italic">No items found</p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-[32px] shadow-sm p-6 relative border border-gray-100/50 hover:shadow-xl hover:shadow-black/5 transition-all group"
                                >
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {item.serviceName}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-[#2D2D2D] mb-1">{item.name}</h3>

                                    {item.price && (
                                        <div className="text-sm font-black text-black mb-2">
                                            Rp {Number(item.price).toLocaleString('id-ID')}
                                        </div>
                                    )}

                                    {item.description && (
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                                    )}

                                    {item.detailTemplates && item.detailTemplates.length > 0 && (
                                        <div className="mt-2 mb-4 space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Master Details</p>
                                            <div className="space-y-2">
                                                {item.detailTemplates.map((t) => (
                                                    <div key={t.id} className="text-[11px] text-gray-700 bg-[#FDFBF7] p-4 rounded-2xl border border-stone-200/60 shadow-sm relative overflow-hidden group/detail">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-stone-300 group-hover/detail:bg-black transition-colors"></div>
                                                        <span className="font-black text-[9px] uppercase tracking-[0.2em] text-stone-400 block mb-1.5">{t.name}</span>
                                                        <p className="leading-relaxed font-medium">{t.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {item.socialLink && (
                                        <a
                                            href={item.socialLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-4"
                                        >
                                            <i className={item.socialIcon || "fa-solid fa-link"}></i>
                                            Visit Profile
                                        </a>
                                    )}

                                    <div className="flex items-center gap-3 mt-6">
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="flex-1 bg-gray-50 text-black py-2.5 rounded-xl font-bold text-sm hover:bg-black hover:text-white transition-all duration-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item)}
                                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Details Tab Content (Master Detail Templates) */}
            {activeTab === "details" && (
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Content Preview</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Used In</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {detailTemplates.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-gray-400 italic">
                                            No master details created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    detailTemplates.map((template) => (
                                        <tr key={template.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-[#2D2D2D]">{template.name}</p>
                                            </td>
                                            <td className="px-8 py-5 max-w-md">
                                                <p className="text-xs text-gray-500 line-clamp-2 italic">
                                                    {template.content}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {template.items?.length || 0} items
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditTemplate(template)}
                                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTemplate(template)}
                                                        className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsCategoryModalOpen(false)}
                    ></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-lg p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#2D2D2D]">
                                    {editingCategory ? "Edit Category" : "Create Category"}
                                </h2>
                                <p className="text-sm text-gray-400">
                                    {editingCategory
                                        ? `Editing category in ${groups.find(g => g.id === categoryFormData.groupId)?.name || '...'}`
                                        : `Adding to ${groups.find(g => g.id == categoryFormData.groupId)?.name || '...'}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-200/50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    placeholder="e.g. Venue, MUA, Catering"
                                    value={categoryFormData.title}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium h-20 resize-none"
                                    placeholder="Brief description of this category..."
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Category Icon
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {categoryIcons.map((cat) => (
                                        <button
                                            key={cat.icon}
                                            type="button"
                                            onClick={() => setCategoryFormData({ ...categoryFormData, icon: cat.icon })}
                                            className={`p-4 rounded-xl border-2 transition-all ${categoryFormData.icon === cat.icon
                                                ? "border-black bg-black text-white"
                                                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                                                }`}
                                        >
                                            <i className={`${cat.icon} text-xl`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                >
                                    {editingCategory ? "Save Changes" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsGroupModalOpen(false)}
                    ></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-lg p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#2D2D2D]">
                                    {editingGroup ? "Edit Group" : "Create Group"}
                                </h2>
                                <p className="text-sm text-gray-400">Groups help organize your categories.</p>
                            </div>
                            <button
                                onClick={() => setIsGroupModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-200/50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleGroupSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    placeholder="e.g. Traditional, Modern, Premium"
                                    value={groupFormData.name}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium h-24 resize-none"
                                    placeholder="Brief description of this group..."
                                    value={groupFormData.description}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                >
                                    {editingGroup ? "Save Changes" : "Create Group"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {isItemModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsItemModalOpen(false)}
                    ></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-2xl p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#2D2D2D]">
                                    {editingItem ? "Edit Item" : "Create Item"}
                                </h2>
                                <p className="text-sm text-gray-400">Set up the details for this service item.</p>
                            </div>
                            <button
                                onClick={() => setIsItemModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-200/50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleItemSubmit} className="space-y-6">
                            <CustomSelect
                                label="Category"
                                value={itemFormData.serviceId}
                                onChange={(val) => setItemFormData({ ...itemFormData, serviceId: val })}
                                options={services}
                                placeholder="Select a category"
                                isOpen={isFormDropdownOpen}
                                setIsOpen={setIsFormDropdownOpen}
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                    placeholder="e.g. Grand Ballroom Venue"
                                    value={itemFormData.name}
                                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Short Description (Optional)
                                </label>
                                <textarea
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium h-20 resize-none"
                                    placeholder="Brief description of this item..."
                                    value={itemFormData.description}
                                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                                />
                            </div>



                            {detailTemplates.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Select Master Details
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {detailTemplates.map((template) => (
                                            <button
                                                key={template.id}
                                                type="button"
                                                onClick={() => {
                                                    const currentIds = [...(itemFormData.detailTemplateIds || [])];
                                                    const index = currentIds.indexOf(template.id);
                                                    if (index > -1) {
                                                        currentIds.splice(index, 1);
                                                    } else {
                                                        currentIds.push(template.id);
                                                    }
                                                    setItemFormData({ ...itemFormData, detailTemplateIds: currentIds });
                                                }}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${itemFormData.detailTemplateIds?.includes(template.id)
                                                    ? "border-black bg-gray-50"
                                                    : "border-gray-100 hover:border-gray-200"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${itemFormData.detailTemplateIds?.includes(template.id) ? "bg-black border-black" : "border-gray-300"}`}>
                                                        {itemFormData.detailTemplateIds?.includes(template.id) && <X size={12} className="text-white rotate-45" />}
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-black text-[13px] text-gray-700 leading-tight">{template.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium line-clamp-1 italic mt-0.5">{template.content}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}


                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Estimated Price (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-0 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                        placeholder="0"
                                        value={itemFormData.price || ""}
                                        onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value === "" ? "" : Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Social Media Icon
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {socialIcons.map((social) => (
                                        <button
                                            key={social.icon}
                                            type="button"
                                            onClick={() => setItemFormData({ ...itemFormData, socialIcon: social.icon })}
                                            className={`p-4 rounded-xl border-2 transition-all ${itemFormData.socialIcon === social.icon
                                                ? "border-black bg-black text-white"
                                                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                                                }`}
                                        >
                                            <i className={`${social.icon} text-xl`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Social Media Link
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                                    placeholder="https://instagram.com/username"
                                    value={itemFormData.socialLink}
                                    onChange={(e) => setItemFormData({ ...itemFormData, socialLink: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Google Maps Location URL
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                                    placeholder="https://maps.google.com/..."
                                    value={itemFormData.locationUrl}
                                    onChange={(e) => setItemFormData({ ...itemFormData, locationUrl: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsItemModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                >
                                    {editingItem ? "Save Changes" : "Create Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Category Items Modal */}
            {viewingCategoryItems && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setViewingCategoryItems(null)}
                    ></div>
                    <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-2xl p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#2D2D2D] flex items-center gap-3">
                                    <i className={viewingCategoryItems.category.icon || "fa-solid fa-star"}></i>
                                    {viewingCategoryItems.category.title}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {viewingCategoryItems.items.length} {viewingCategoryItems.items.length === 1 ? 'item' : 'items'} in this category
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingCategoryItems(null)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-200/50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {viewingCategoryItems.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-50 rounded-2xl p-5 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                {item.price && (
                                                    <span className="text-[10px] font-black bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                                                        Rp {Number(item.price).toLocaleString('id-ID')}
                                                    </span>
                                                )}
                                            </div>
                                            {(item.description || (item.detailTemplates && item.detailTemplates.length > 0)) && (
                                                <div className="space-y-3 mb-4">
                                                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                                                    {item.detailTemplates?.length > 0 && (
                                                        <div className="space-y-2">
                                                            {item.detailTemplates.map((t) => (
                                                                <div key={t.id} className="text-[11px] text-stone-500 bg-stone-50/50 p-3 rounded-2xl border border-stone-100 italic relative overflow-hidden group/iv-detail">
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-stone-100 group-hover/iv-detail:bg-jenggala-gold transition-colors"></div>
                                                                    <span className="font-black text-[9px] uppercase tracking-wider text-stone-300 block mb-1">{t.name}</span>
                                                                    <p className="leading-relaxed">{t.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {item.socialLink && (
                                                <a
                                                    href={item.socialLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                                                >
                                                    <i className={item.socialIcon || "fa-solid fa-link"}></i>
                                                    Visit Profile
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewingCategoryItems(null);
                                                    handleEditItem(item);
                                                }}
                                                className="w-9 h-9 flex items-center justify-center bg-white text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all border border-gray-200"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    showConfirm(
                                                        "Delete Item",
                                                        `Delete "${item.name}"?`,
                                                        async () => {
                                                            try {
                                                                await fetch(`/api/service-items/${item.id}`, { method: "DELETE" });
                                                                fetchAllItems();
                                                                // Update the modal data
                                                                const updatedItems = viewingCategoryItems.items.filter(i => i.id !== item.id);
                                                                if (updatedItems.length === 0) {
                                                                    setViewingCategoryItems(null);
                                                                } else {
                                                                    setViewingCategoryItems({
                                                                        ...viewingCategoryItems,
                                                                        items: updatedItems
                                                                    });
                                                                }
                                                            } catch (error) {
                                                                console.error("Error deleting item:", error);
                                                            }
                                                        }
                                                    )
                                                }
                                                className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => setViewingCategoryItems(null)}
                                className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            {
                isTemplateModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-stone-500/10 backdrop-blur-md animate-in fade-in duration-300"
                            onClick={() => setIsTemplateModalOpen(false)}
                        ></div>
                        <div className="relative bg-white rounded-[32px] md:rounded-[40px] w-full max-w-lg p-6 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-[#2D2D2D]">
                                        {editingTemplate ? "Edit Master Detail" : "Create Master Detail"}
                                    </h2>
                                    <p className="text-sm text-gray-400">These details can be reused across multiple items.</p>
                                </div>
                                <button
                                    onClick={() => setIsTemplateModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-200/50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleTemplateSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Detail Name (Internal)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                                        placeholder="e.g. Include Crew 4 Pax"
                                        value={templateFormData.name}
                                        onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Detail Content (Visible to Client)
                                    </label>
                                    <textarea
                                        className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium h-32 resize-none"
                                        placeholder="The actual text that will appear for the item..."
                                        value={templateFormData.content}
                                        onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsTemplateModalOpen(false)}
                                        className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                                    >
                                        {editingTemplate ? "Save Changes" : "Create Detail"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Premium Confirm Modal */}
            {
                confirmModal.isOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
                        <div className="relative bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-stone-100">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-stone-900 mb-2">{confirmModal.title}</h3>
                                <p className="text-sm text-stone-400 font-medium leading-relaxed mb-8">{confirmModal.message}</p>

                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={confirmModal.onConfirm}
                                        className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg transition-transform hover:scale-[1.02] ${confirmModal.confirmColor}`}
                                    >
                                        {confirmModal.confirmText}
                                    </button>
                                    <button
                                        onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                        className="w-full py-4 rounded-2xl bg-stone-50 text-stone-400 font-bold text-sm hover:bg-stone-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { Save, Info, Sparkles, Star, Check, ArrowRight, Loader2, Image as ImageIcon, Plus, X, UploadCloud, Trash2, ArrowUpRight, FolderHeart, ExternalLink, AlertTriangle, AlertCircle, Maximize2, Monitor } from "lucide-react";

function AboutManagementContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q')?.toLowerCase() || '';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);

    // Global Notice Modal State (Replacement for alert/confirm)
    const [notice, setNotice] = useState({
        isOpen: false,
        type: "info", // info, error, confirm
        title: "",
        message: "",
        onConfirm: null
    });

    const [aboutData, setAboutData] = useState({
        about_subtitle: "Who We Are",
        about_title: "Weaving Your Love Story into Reality",
        about_description_1: "At Jenggala Project, we believe that every wedding is a unique masterpiece, reflecting the individuality of the couple. Our name, derived from the Sanskrit word for \"jungle,\" symbolizes growth, natural beauty, and the serene wildness of love.",
        about_description_2: "With years of experience in orchestrating intimate gatherings and grand celebrations, we ensure your special day flows effortlessly, allowing you to cherish every moment.",
        about_stat_1_value: "150+",
        about_stat_1_label: "Weddings Planned",
        about_stat_2_value: "100%",
        about_stat_2_label: "Happy Couples",
        about_carousel_images: "", // Store as comma-separated URLs
        docs_subtitle: "Our Work",
        docs_title: "Event Documentation",
        docs_description: "Witness the magic we've created for our clients through these captured moments.",
    });

    const [images, setImages] = useState([]);
    const [documentations, setDocumentations] = useState([]);
    const [showDocModal, setShowDocModal] = useState(false);
    const [isEditingDoc, setIsEditingDoc] = useState(null); // stores ID if editing
    const [clients, setClients] = useState([]);

    // Updated docForm to include orientation
    const [docForm, setDocForm] = useState({
        title: "",
        coverImage: "",
        images: "",
        orientation: "portrait", // 'portrait' or 'landscape'
        clientId: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, docsRes, clientsRes] = await Promise.all([
                    fetch("/api/settings", { cache: "no-store" }),
                    fetch("/api/documentation", { cache: "no-store" }),
                    fetch("/api/clients", { cache: "no-store" })
                ]);

                const settings = await settingsRes.json();
                const docs = await docsRes.json();
                const clientsData = await clientsRes.json();

                const newData = { ...aboutData };
                let foundAny = false;
                Object.keys(aboutData).forEach(key => {
                    if (settings[key] !== undefined) {
                        newData[key] = settings[key];
                        foundAny = true;
                    }
                });

                if (foundAny) {
                    setAboutData(newData);
                    if (newData.about_carousel_images) {
                        setImages(newData.about_carousel_images.split(',').filter(img => img.trim() !== ''));
                    }
                }
                setDocumentations(docs);
                setClients(clientsData);

                // Handle pre-filled clientId from URL
                const preClientId = searchParams.get('clientId');
                if (preClientId) {
                    setDocForm(prev => ({ ...prev, clientId: preClientId }));
                    setShowDocModal(true);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showAlert = (title, message, type = "info") => {
        setNotice({ isOpen: true, type, title, message, onConfirm: null });
    };

    const showConfirm = (title, message, onConfirm) => {
        setNotice({ isOpen: true, type: "confirm", title, message, onConfirm });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAboutData(prev => ({ ...prev, [name]: value }));
    };

    const handleRemoveImage = (index) => {
        showConfirm(
            "Remove Photo",
            "Are you sure you want to remove this photo from the gallery carousel?",
            () => {
                const newImages = images.filter((_, i) => i !== index);
                setImages(newImages);
                setAboutData(prev => ({ ...prev, about_carousel_images: newImages.join(',') }));
                setNotice({ ...notice, isOpen: false });
            }
        );
    };

    const openWidget = (options, callback) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            showAlert(
                "Cloudinary Missing",
                "Configurations are missing! Please ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET are set in your .env file and RESTART your dev server.",
                "error"
            );
            return;
        }

        if (window.cloudinary) {
            window.cloudinary.openUploadWidget({
                cloudName,
                uploadPreset,
                ...options
            }, callback);
        } else {
            showAlert("Script Not Ready", "Cloudinary script is still loading. Please wait a moment or refresh the page.", "info");
        }
    };

    const handleAboutCarouselUpload = () => {
        openWidget({ sources: ["local", "url", "camera"], multiple: true }, (error, result) => {
            if (!error && result && result.event === "success") {
                const newUrl = result.info.secure_url;
                setImages(prev => {
                    const updated = [...prev, newUrl];
                    setAboutData(prevData => ({ ...prevData, about_carousel_images: updated.join(',') }));
                    return updated;
                });
            }
        });
    };

    const handleSettingsSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(aboutData)
            });
            if (!res.ok) throw new Error("Failed to save settings");
            setShowSuccessModal(true);
        } catch (err) {
            showAlert("Save Error", err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAddDoc = () => {
        setIsEditingDoc(null);
        setDocForm({ title: "", coverImage: "", images: "", orientation: "portrait", clientId: "" });
        setShowDocModal(true);
    };

    const handleEditDoc = (doc) => {
        setIsEditingDoc(doc.id);
        // Assuming orientation might not exist in old docs, fallback to portrait
        setDocForm({
            title: doc.title,
            coverImage: doc.coverImage,
            images: doc.images,
            orientation: doc.orientation || "portrait",
            clientId: doc.clientId || ""
        });
        setShowDocModal(true);
    };

    const handleDeleteDoc = async (id) => {
        showConfirm(
            "Delete Documentation",
            "Are you sure you want to delete this documentation? This action cannot be undone.",
            async () => {
                try {
                    const res = await fetch(`/api/documentation?id=${id}`, { method: "DELETE" });
                    if (res.ok) {
                        setDocumentations(prev => prev.filter(d => d.id !== id));
                        setNotice({ ...notice, isOpen: false });
                    }
                } catch (err) {
                    showAlert("Delete Error", "Failed to delete documentation. Please try again.", "error");
                }
            }
        );
    };

    const handleDocSubmit = async () => {
        if (!docForm.title || !docForm.coverImage) {
            showAlert("Form Incomplete", "Please provide both a Title and a Cover Image for the documentation.", "error");
            return;
        }

        try {
            const res = await fetch(isEditingDoc ? `/api/documentation/${isEditingDoc}` : "/api/documentation", {
                method: isEditingDoc ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(docForm)
            });
            const savedItem = await res.json();

            if (isEditingDoc) {
                setDocumentations(prev => prev.map(d => d.id === isEditingDoc ? savedItem : d));
            } else {
                setDocumentations(prev => [savedItem, ...prev]);
            }
            setShowDocModal(false);
        } catch (err) {
            showAlert("Save Error", "Failed to save documentation. Please check your data.", "error");
        }
    };

    const handleUploadCover = () => {
        // Aspect Ratio based on selection: Portrait (4:5 = 0.8), Landscape (3:2 = 1.5)
        const aspectRatio = docForm.orientation === "portrait" ? 0.8 : 1.5;

        openWidget({ sources: ["local"], multiple: false, cropping: true, croppingAspectRatio: aspectRatio }, (error, result) => {
            if (!error && result && result.event === "success") {
                setDocForm(prev => ({ ...prev, coverImage: result.info.secure_url }));
            }
        });
    };

    const handleUploadGallery = () => {
        openWidget({ sources: ["local"], multiple: true }, (error, result) => {
            if (!error && result && result.event === "success") {
                const newUrl = result.info.secure_url;
                setDocForm(prev => {
                    const current = prev.images ? prev.images.split(',').filter(u => u.trim() !== '') : [];
                    return { ...prev, images: [...current, newUrl].join(',') };
                });
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 md:px-0">
            <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="afterInteractive" />

            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-black text-stone-800 mb-2">About Settings</h1>
                    <p className="text-stone-400 font-medium">Manage the content and visuals of your "About" section.</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Header Content Section */}
                {(!q || q.includes('header') || q.includes('title')) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800">
                                <Sparkles size={24} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800">Header Content</h2>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium">
                                Set the subtitle and main headline that appears at the top of the About section.
                            </p>
                        </div>

                        <div className="md:w-2/3 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Subtitle</label>
                                <input
                                    name="about_subtitle"
                                    value={aboutData.about_subtitle}
                                    onChange={handleChange}
                                    placeholder="Who We Are"
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Main Headline</label>
                                <textarea
                                    name="about_title"
                                    value={aboutData.about_title}
                                    onChange={handleChange}
                                    placeholder="Weaving Your Love Story into Reality"
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-800 h-32 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Biography Section */}
                {(!q || q.includes('bio') || q.includes('graph')) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800">
                                <Info size={24} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800">Biography</h2>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium">
                                Craft the narrative that tells your story to potential clients.
                            </p>
                        </div>

                        <div className="md:w-2/3 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Paragraph One</label>
                                <textarea
                                    name="about_description_1"
                                    value={aboutData.about_description_1}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-medium text-stone-800 h-40 resize-none leading-relaxed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Paragraph Two</label>
                                <textarea
                                    name="about_description_2"
                                    value={aboutData.about_description_2}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-medium text-stone-800 h-32 resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Section */}
                {(!q || q.includes('stat') || q.includes('trust')) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800">
                                <Star size={24} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800">Trust Metrics</h2>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium">
                                Display key performance indicators to build credibility.
                            </p>
                        </div>

                        <div className="md:w-2/3 grid grid-cols-2 gap-8">
                            <div className="col-span-1 space-y-6 p-6 bg-stone-50 rounded-[32px]">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Stat 1 Value</label>
                                    <input
                                        name="about_stat_1_value"
                                        value={aboutData.about_stat_1_value}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-stone-100 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-black text-2xl text-stone-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Stat 1 Label</label>
                                    <input
                                        name="about_stat_1_label"
                                        value={aboutData.about_stat_1_label}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-stone-100 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-400"
                                    />
                                </div>
                            </div>

                            <div className="col-span-1 space-y-6 p-6 bg-stone-50 rounded-[32px]">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Stat 2 Value</label>
                                    <input
                                        name="about_stat_2_value"
                                        value={aboutData.about_stat_2_value}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-stone-100 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-black text-2xl text-stone-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Stat 2 Label</label>
                                    <input
                                        name="about_stat_2_label"
                                        value={aboutData.about_stat_2_label}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-stone-100 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Carousel Section */}
                {(!q || q.includes('image') || q.includes('carousel')) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800">
                                <ImageIcon size={24} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800">Gallery Carousel</h2>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium">
                                Upload and manage photos for the immersive carousel experience.
                            </p>
                        </div>

                        <div className="md:w-2/3 space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative aspect-[4/5] rounded-3xl overflow-hidden group border border-stone-100 shadow-sm">
                                        <img src={url} alt={`About ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleRemoveImage(idx)}
                                                className="w-10 h-10 bg-white text-red-500 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAboutCarouselUpload}
                                    className="aspect-[4/5] rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3 text-stone-300 hover:border-stone-900 hover:text-stone-900 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documentation Section */}
                {(!q || q.includes('doc') || q.includes('work')) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800">
                                <FolderHeart size={24} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800">Documentation</h2>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium">
                                Create clickable documentation cards for your portfolio.
                            </p>
                        </div>

                        <div className="md:w-2/3 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {Array.isArray(documentations) && documentations.map((doc, idx) => (
                                    <div key={doc.id || `doc-${idx}`} className={`relative rounded-3xl overflow-hidden group border border-stone-100 shadow-sm bg-stone-50 ${doc.orientation === 'landscape' ? 'aspect-video' : 'aspect-[4/5]'}`}>
                                        {doc.coverImage ? (
                                            <img src={doc.coverImage} className="w-full h-full object-cover" alt={doc.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-200">
                                                <ImageIcon size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                            <p className="text-white font-black text-center text-sm">{doc.title}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditDoc(doc)} className="p-2 bg-white rounded-lg text-stone-900 hover:scale-110 transition-transform"><Plus size={16} /></button>
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 bg-white rounded-lg text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4 py-2 px-3 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-stone-900 border border-white/50">
                                            {doc.title}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAddDoc} className="aspect-[4/5] rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3 text-stone-300 hover:border-stone-900 hover:text-stone-900 transition-all group">
                                    <Plus size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center">New Documentation</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documentation Section Header Settings */}
                {(!q || q.includes('doc') || q.includes('work') || q.includes('header')) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800">
                                <Sparkles size={24} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800">Gallery Header</h2>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium">
                                Set the subtitle, main title, and description for your Event Documentation section.
                            </p>
                        </div>

                        <div className="md:w-2/3 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Subtitle</label>
                                    <input
                                        name="docs_subtitle"
                                        value={aboutData.docs_subtitle || ""}
                                        onChange={handleChange}
                                        placeholder="Our Work"
                                        className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        name="docs_title"
                                        value={aboutData.docs_title || ""}
                                        onChange={handleChange}
                                        placeholder="Event Documentation"
                                        className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-800"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    name="docs_description"
                                    value={aboutData.docs_description || ""}
                                    onChange={handleChange}
                                    placeholder="Witness the magic we've created..."
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-medium text-stone-800 h-24 resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Action */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-8 py-5 rounded-[24px] bg-white border border-stone-100 text-stone-400 font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center gap-2"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleSettingsSubmit}
                        disabled={saving}
                        className="px-10 py-5 rounded-[24px] bg-stone-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all flex items-center gap-3 shadow-2xl shadow-stone-200 disabled:opacity-50 disabled:scale-100"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Update Frontend Detail
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Doc Modal */}
            {showDocModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowDocModal(false)}></div>
                    <div className="relative bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black text-stone-900 mb-8">{isEditingDoc ? "Edit Documentation" : "New Documentation"}</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    value={docForm.title}
                                    onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-800"
                                    placeholder="e.g. Wedding Documentation"
                                />
                            </div>

                            {/* Orientation Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Layout Orientation</label>
                                <div className="flex gap-4 p-1 bg-stone-50 rounded-2xl w-fit">
                                    <button
                                        onClick={() => setDocForm({ ...docForm, orientation: "portrait" })}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docForm.orientation === 'portrait' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        <Maximize2 size={14} className="rotate-90" />
                                        Portrait (4:5)
                                    </button>
                                    <button
                                        onClick={() => setDocForm({ ...docForm, orientation: "landscape" })}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docForm.orientation === 'landscape' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        <Maximize2 size={14} />
                                        Landscape (3:2)
                                    </button>
                                </div>
                            </div>

                            {/* Client Assignment */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Assign to Client (Optional)</label>
                                <select
                                    value={docForm.clientId}
                                    onChange={e => setDocForm({ ...docForm, clientId: e.target.value })}
                                    className="w-full bg-stone-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-bold text-stone-800 appearance-none"
                                >
                                    <option value="">Public Portfolio (Shared with everyone)</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>Private: {client.name} (@{client.username})</option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-stone-400 italic">Private documentation only appears on the client's dashboard.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Cover Image</label>
                                    <div className={`relative rounded-3xl bg-stone-50 overflow-hidden group border border-stone-100 transition-all duration-500 shadow-inner ${docForm.orientation === 'landscape' ? 'aspect-video' : 'aspect-[4/5]'}`}>
                                        {docForm.coverImage ? (
                                            <img src={docForm.coverImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                                                <ImageIcon size={32} />
                                                <span className="text-[8px] font-bold uppercase tracking-widest">No Cover Selected</span>
                                            </div>
                                        )}
                                        <button onClick={handleUploadCover} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                                            <Plus size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Select Cover</span>
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-stone-400 italic">Aspect ratio matches your orientation choice.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Gallery Preview</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {docForm.images.split(',').filter(u => u.trim() !== '').slice(0, 3).map((u, i) => (
                                            <img
                                                key={`preview-${i}`}
                                                src={u}
                                                className={`rounded-xl object-cover border border-stone-100 transition-all duration-500 ${docForm.orientation === 'landscape' ? 'aspect-video' : 'aspect-square'}`}
                                            />
                                        ))}
                                        <button
                                            onClick={handleUploadGallery}
                                            className={`rounded-xl bg-stone-50 border border-stone-100 border-dashed flex items-center justify-center text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all font-black text-lg ${docForm.orientation === 'landscape' ? 'aspect-video' : 'aspect-square'}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-stone-400 mt-2">Upload images for the documentation detail page.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                                <button
                                    onClick={() => setShowDocModal(false)}
                                    className="px-6 py-4 rounded-2xl bg-stone-100 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDocSubmit}
                                    className="px-8 py-4 rounded-2xl bg-stone-900 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-stone-200 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {isEditingDoc ? "Update Documentation" : "Save Documentation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Notice Modal (Replaces Native Alert/Confirm) */}
            {notice.isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setNotice({ ...notice, isOpen: false })}></div>
                    <div className="relative bg-white rounded-[48px] w-full max-w-sm p-10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 border border-white">
                        <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 ${notice.type === 'error' ? 'bg-red-50 text-red-500' :
                            notice.type === 'confirm' ? 'bg-amber-50 text-amber-500' :
                                'bg-stone-50 text-stone-600'
                            }`}>
                            {notice.type === 'error' ? <AlertTriangle size={32} strokeWidth={2.5} /> :
                                notice.type === 'confirm' ? <AlertCircle size={32} strokeWidth={2.5} /> :
                                    <Info size={32} strokeWidth={2.5} />}
                        </div>

                        <h3 className="text-2xl font-black text-stone-900 text-center mb-3 leading-tight uppercase tracking-tight">{notice.title}</h3>
                        <p className="text-stone-400 text-center text-sm font-medium leading-relaxed mb-10 px-2">{notice.message}</p>

                        <div className="flex gap-3">
                            {notice.type === 'confirm' && (
                                <button
                                    onClick={() => setNotice({ ...notice, isOpen: false })}
                                    className="flex-1 bg-stone-100 text-stone-500 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-stone-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={notice.onConfirm ? notice.onConfirm : () => setNotice({ ...notice, isOpen: false })}
                                className={`flex-1 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${notice.type === 'error' ? 'bg-red-500 text-white shadow-red-200' :
                                    notice.type === 'confirm' ? 'bg-stone-900 text-white shadow-stone-200' :
                                        'bg-stone-900 text-white shadow-stone-200'
                                    }`}
                            >
                                {notice.type === 'confirm' ? 'Confirm' : 'Understand'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowSuccessModal(false)}></div>
                    <div className="relative bg-white rounded-[56px] w-full max-w-sm p-12 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 text-center border border-white/50">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[36px] flex items-center justify-center mx-auto mb-8 border border-green-100 shadow-xl shadow-green-500/10">
                            <Check size={48} strokeWidth={3} />
                        </div>

                        <h2 className="text-3xl font-black text-stone-900 leading-tight mb-3">Update Success!</h2>
                        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-10 text-center leading-relaxed">Your About section has been updated and is now live on the frontend.</p>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-stone-900 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AboutManagement() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading About Management...</div>}>
            <AboutManagementContent />
        </Suspense>
    );
}

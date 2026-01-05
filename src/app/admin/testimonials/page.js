"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Quote } from "lucide-react";

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        content: "",
        image: "",
        rating: 5,
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch("/api/testimonials");
            const data = await res.json();
            setTestimonials(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `/api/testimonials/${editingItem.id}`
                : "/api/testimonials";
            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchTestimonials();
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({ name: "", role: "", content: "", image: "" });
            }
        } catch (error) {
            console.error("Error saving testimonial:", error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            role: item.role || "",
            content: item.content,
            image: item.image || "",
            rating: item.rating || 5,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this testimonial?")) {
            try {
                await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
                fetchTestimonials();
            } catch (error) {
                console.error("Error deleting testimonial:", error);
            }
        }
    };

    const openNewModal = () => {
        setEditingItem(null);
        setFormData({ name: "", role: "", content: "", image: "" });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Testimonials</h1>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Add Testimonial
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 relative">
                        <Quote className="absolute top-6 right-6 text-gray-100 fill-current" size={48} />
                        <p className="text-gray-600 mb-6 relative z-10 italic">"{item.content}"</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                                        {item.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <div className="flex gap-0.5 my-1 text-yellow-500">
                                    {[...Array(item.rating || 5)].map((_, i) => (
                                        <Star key={i} size={12} className="fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500">{item.role}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button onClick={() => handleEdit(item)} className="text-blue-600 text-sm hover:underline">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingItem ? "Edit Testimonial" : "New Testimonial"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X size={24} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                    placeholder="e.g. Bride"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.image}
                                    onChange={(e) =>
                                        setFormData({ ...formData, image: e.target.value })
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Showcase Review
                                </label>
                                <textarea
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    value={formData.content}
                                    onChange={(e) =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                    placeholder="What did they say?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating (1-5)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.rating || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, rating: e.target.value === "" ? "" : parseInt(e.target.value) })
                                    }
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                            >
                                Save Testimonial
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

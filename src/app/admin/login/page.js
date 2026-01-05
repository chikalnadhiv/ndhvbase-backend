"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
            <div className="w-full max-w-md bg-white rounded-[48px] p-12 shadow-2xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-stone-200 overflow-hidden">
                    <img src="/logo-jenggala.png" alt="Jenggala Logo" className="w-full h-full object-contain p-3" />
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-stone-800 tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Jenggala Admin Portal</p>
                </div>

                {error && (
                    <div className="w-full bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-xs font-black uppercase tracking-widest text-center border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">Username</label>
                        <input
                            type="text" required
                            className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[24px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} required
                                className="w-full bg-stone-50 border-2 border-transparent p-5 rounded-[24px] focus:bg-white focus:border-stone-900 outline-none transition-all font-bold text-stone-800 pr-14"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-stone-200 hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                    >
                        {loading ? "Authenticating..." : "Sign In to Admin"}
                    </button>
                </form>

                <p className="mt-12 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                    Secure Access Only • Jenggala Project 2025
                </p>
            </div>
        </div>
    );
}

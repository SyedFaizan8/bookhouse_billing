"use client";

import { useState } from "react";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";

export default function LoginPage() {
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!phone || !password) {
            toast.error("Phone number and password required");
            return;
        }

        if (phone.length !== 10) {
            toast.error("Enter valid 10 digit phone number");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                { phone, password },
                { withCredentials: true }
            );

            toast.success("Welcome back 👋");
            router.replace("/dashboard/year");
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Invalid phone or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">

            {/* soft background blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] bg-cyan-400/30 rounded-full blur-3xl" />

            {/* CARD */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="
                    relative
                    w-full max-w-sm
                    backdrop-blur-xl
                    bg-white/90
                    rounded-2xl
                    shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                    p-7
                    space-y-6
                "
            >
                {/* BRAND */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-extrabold text-indigo-700 tracking-wide">
                        Sri Vinayaka
                    </h1>
                    <p className="text-xs text-slate-500">
                        Book House Management
                    </p>
                </div>

                {/* PHONE */}
                <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">
                        Phone Number
                    </label>

                    <div className="relative">
                        <Phone
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
                        />

                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="10 digit mobile number"
                            className="
                                w-full
                                pl-10 pr-3 py-3
                                rounded-xl
                                border border-slate-200
                                text-sm
                                bg-white
                                outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                                transition
                            "
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">
                        Password
                    </label>

                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
                        />

                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="
                                w-full
                                pl-10 pr-10 py-3
                                rounded-xl
                                border border-slate-200
                                text-sm
                                bg-white
                                outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                                transition
                            "
                        />

                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* BUTTON */}
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={loading}
                    onClick={submit}
                    className="
                        w-full
                        bg-gradient-to-r
                        from-indigo-600
                        to-violet-600
                        hover:from-indigo-700
                        hover:to-violet-700
                        text-white
                        py-3
                        rounded-xl
                        text-sm
                        font-semibold
                        shadow-lg
                        transition
                        disabled:opacity-60
                    "
                >
                    {loading ? "Signing in..." : "Login"}
                </motion.button>

                {/* FOOTER */}
                <div className="text-center text-[11px] text-slate-400">
                    © {new Date().getFullYear()} VBH • Secure Login
                </div>
            </motion.div>
        </div>
    );
}

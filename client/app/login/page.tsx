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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-600 to-indigo-800 px-4"
        >
            {/* CARD */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-6"
            >
                {/* BRAND */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center space-y-1"
                >
                    <h1 className="text-xl font-bold text-indigo-700">
                        Sri Vinayaka Book House
                    </h1>
                    <p className="text-xs text-slate-500">
                        Login to continue
                    </p>
                </motion.div>

                {/* PHONE */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-1"
                >
                    <label className="text-xs text-slate-600">
                        Phone Number
                    </label>

                    <div className="relative">
                        <Phone
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                            className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </motion.div>

                {/* PASSWORD */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-1"
                >
                    <label className="text-xs text-slate-600">
                        Password
                    </label>

                    <div className="relative">
                        <Lock
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </motion.div>

                {/* BUTTON */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    onClick={submit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Login"}
                </motion.button>

                {/* FOOTER */}
                <div className="text-center text-[11px] text-slate-400">
                    © {new Date().getFullYear()} VBH
                </div>
            </motion.div>
        </motion.div>
    );
}

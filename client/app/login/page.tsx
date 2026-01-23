"use client";

import { useState } from "react";
import { Eye, EyeOff, Phone } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";

export default function LoginPage() {
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ================= SUBMIT ================= */

    const submit = async () => {
        if (!phone || !password) {
            toast.error("Phone number and password required");
            return;
        }

        if (phone.length < 10) {
            toast.error("Enter valid phone number");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                { phone, password },
                { withCredentials: true }
            );

            toast.success("Login successful");
            router.replace("/dashboard/year");
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Invalid phone or password"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

                {/* LOGO */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold text-indigo-700">
                        SRI VINAYAKA BOOK HOUSE
                    </h1>
                    <p className="text-sm text-slate-500">
                        Login to your account
                    </p>
                </div>

                {/* PHONE */}
                <div className="space-y-1">
                    <label className="text-sm text-slate-600">Phone Number</label>

                    <div className="relative">
                        <Phone
                            className="absolute left-3 top-3 text-slate-400"
                            size={18}
                        />

                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Enter phone number"
                            className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-1">
                    <label className="text-sm text-slate-600">Password</label>

                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full pr-10 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-3 top-3 text-slate-400"
                        >
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* BUTTON */}
                <button
                    disabled={loading}
                    onClick={submit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
                >
                    {loading ? "Signing in..." : "Login"}
                </button>

                {/* FOOTER */}
                <div className="text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} VBH
                </div>

            </div>
        </div>
    );
}

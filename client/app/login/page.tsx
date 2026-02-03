"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/queries/auth";
import { handleApiError } from "@/lib/utils/getApiError";
import Spinner from "@/components/Spinner";

export default function LoginPage() {
    const router = useRouter();
    const loginMutation = useLogin();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);

    const submit = () => {
        if (!phone || !password) return toast.error("Phone number and password required");

        if (phone.length !== 10) return toast.error("Enter valid 10 digit phone number");

        loginMutation.mutate(
            { phone, password },
            {
                onSuccess: () => router.replace("/dashboard/year"),
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );
    };

    return (
        <div className="
            min-h-screen
            flex items-center justify-center
            px-4
            bg-gradient-to-br
            from-indigo-700
            via-violet-700
            to-fuchsia-700
            relative
            overflow-hidden
            ">

            {/* soft glow circles (pure CSS, zero JS cost) */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 blur-3xl rounded-full" />
            <div className="absolute bottom-[-120px] right-[-100px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full" />

            {/* CARD */}
            <div
                className="
                    relative
                    w-full max-w-sm
                    rounded-3xl
                    bg-white/90
                    backdrop-blur-xl
                    shadow-[0_25px_70px_rgba(0,0,0,0.35)]
                    p-9
                    space-y-7
                    "
            >
                {/* BRAND */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-indigo-700">
                        Sri Vinayaka
                    </h1>
                    <p className="text-xs text-slate-500 tracking-wide">
                        Book House Management
                    </p>
                </div>

                {/* INPUTS */}
                <div className="space-y-4">

                    {/* Phone */}
                    <div className="group">
                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Phone number"
                            className="
                                w-full
                                px-4 py-3
                                rounded-xl
                                border border-slate-200
                                bg-white/80
                                text-sm
                                outline-none
                                transition
                                focus:ring-2 focus:ring-indigo-500
                                focus:shadow-md
                            "
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="
                                w-full
                                px-4 py-3 pr-14
                                rounded-xl
                                border border-slate-200
                                bg-white/80
                                text-sm
                                outline-none
                                transition
                                focus:ring-2 focus:ring-indigo-500
                                focus:shadow-md
                            "
                        />

                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="
                                absolute right-4 top-1/2 -translate-y-1/2
                                text-xs font-medium text-indigo-600
                                hover:text-indigo-800
                            "
                        >
                            {show ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {/* BUTTON */}
                <button
                    onClick={submit}
                    disabled={loginMutation.isPending}
                    className="
                        w-full
                        flex items-center justify-center gap-2
                        bg-gradient-to-r
                        from-indigo-600
                        to-violet-600
                        hover:from-indigo-700
                        hover:to-violet-700
                        text-white
                        py-3
                        rounded-xl
                        text-sm font-semibold
                        shadow-lg
                        active:scale-[0.98]
                        transition
                        disabled:opacity-60
                    "
                >
                    {loginMutation.isPending && <Spinner size={16} />}
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                </button>

                {/* FOOTER */}
                <p className="text-center text-[11px] text-slate-400">
                    Secure Login • © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
    School,
    LibraryBig,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    LucideIcon,
    BookOpen,
    Bookmark,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuthUser, useLogout } from "@/lib/queries/auth";

type NavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

const navItems: NavItem[] = [
    { title: "Academic Year", url: "/dashboard/year", icon: Calendar },
    { title: "Schools", url: "/dashboard/schools", icon: School },
    { title: "Companies", url: "/dashboard/companies", icon: LibraryBig },
    { title: "Inventory", url: "/dashboard/inventory", icon: BookOpen },
];

const protectedNavItems: NavItem[] = [
    { title: "Reports", url: "/dashboard/reports", icon: Bookmark },
    { title: "Users", url: "/dashboard/users", icon: Users },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const mainRef = useRef<HTMLDivElement>(null);
    const { data: user, isLoading } = useAuthUser();
    const logout = useLogout();

    /* 🔁 scroll reset */
    useEffect(() => {
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [pathname]);

    return (
        <div className="h-screen overflow-hidden bg-slate-50">

            {/* MOBILE OVERLAY */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* ROOT FLEX */}
            <div className="flex h-full md:pl-72">

                {/* SIDEBAR */}
                <aside
                    className={`
            fixed inset-y-0 left-0 z-50 w-72
            bg-white border-r
            transition-transform duration-200 ease-out
            ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
                >
                    {/* LOGO */}
                    <div className="h-14 flex items-center justify-between px-4 border-b">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="logo" width={36} height={36} />
                            <span className="font-semibold text-lg text-slate-800">
                                Vinayaka Book House
                            </span>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="md:hidden text-slate-500"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* NAV */}
                    <nav className="px-3 py-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const active = pathname.startsWith(item.url);
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    onClick={() => setOpen(false)}
                                    className={`
                    flex items-center gap-4 rounded-md px-3 py-2 text-sm
                    transition-colors
                    ${active
                                            ? "bg-indigo-50 text-indigo-700 font-medium"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                                        }
                  `}
                                >
                                    <item.icon size={20} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ADMIN NAV */}
                    {user?.role === "ADMIN" && (
                        <nav className="px-3 py-3 space-y-1 border-t overflow-y-auto">
                            {protectedNavItems.map((item) => {
                                const active = pathname.startsWith(item.url);
                                return (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        onClick={() => setOpen(false)}
                                        className={`
                                            flex items-center gap-4 rounded-md px-3 py-2 text-sm
                                            transition-colors
                                            ${active
                                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                                            }
                                        `}
                                    >
                                        <item.icon size={20} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* LOGOUT */}
                    <div className="border-t px-3 py-3">
                        <button
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN COLUMN */}
                <div className="flex flex-1 flex-col min-w-0">

                    {/* HEADER */}
                    <header className="h-14 shrink-0 flex items-center px-4 bg-white border-b">
                        <button
                            onClick={() => setOpen(true)}
                            className="md:hidden text-slate-600"
                        >
                            <Menu size={20} />
                        </button>

                        {!isLoading && user && (
                            <div className="ml-auto flex items-center gap-2 text-sm text-slate-700">
                                {user.name}
                                <span
                                    className={`rounded-md px-2 py-0.5 text-xs font-medium
                                        ${user.role === "STAFF"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-indigo-100 text-indigo-700"
                                        }
                                    `}
                                >
                                    {user.role}
                                </span>
                            </div>
                        )}
                    </header>

                    {/* CONTENT */}
                    <main
                        ref={mainRef}
                        className="flex-1 overflow-y-auto scroll-smooth overscroll-contain"
                    >
                        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
                            {children}
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}

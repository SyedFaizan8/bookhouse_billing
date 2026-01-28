"use client"

import SideBar from "@/components/SideBar"
import { useAuthUser } from "@/lib/queries/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const { data: user, isLoading } = useAuthUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) return null;
    if (!user) return null;

    return <SideBar>{children}</SideBar>
}
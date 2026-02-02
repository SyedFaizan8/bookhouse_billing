"use client";

import LayoutLoader from "@/components/loaders/LayoutLoader";
import SideBar from "@/components/SideBar";
import { useAuthUser } from "@/lib/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const {
        data: user,
        isLoading,
        isFetched,
    } = useAuthUser();

    useEffect(() => {
        if (!isFetched || isLoading) return;

        if (!user) {
            router.replace("/login");
        }
    }, [isFetched, user, router, isLoading]);

    if (!isFetched || isLoading || !user) return <LayoutLoader />;

    return <SideBar>{children}</SideBar>;
}

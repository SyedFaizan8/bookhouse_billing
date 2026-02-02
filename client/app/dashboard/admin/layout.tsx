"use client";

import LayoutLoader from "@/components/loaders/LayoutLoader";
import { useAuthUser } from "@/lib/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children, }: { children: React.ReactNode; }) {
    const router = useRouter();

    const { data: user, isLoading, isFetched, } = useAuthUser();

    useEffect(() => {
        if (!isFetched || isLoading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [isFetched, user, router, isLoading]);

    if (!isFetched || isLoading || !user || user.role !== "ADMIN") return <LayoutLoader />;

    return <>{children}</>;
}

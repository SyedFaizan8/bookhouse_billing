"use client";

import { useAuthUser } from "@/lib/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { data: user, isLoading } = useAuthUser();

    useEffect(() => {
        if (!isLoading && user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);

    if (isLoading) return null;
    if (!user || user.role !== "ADMIN") return null;

    return <>{children}</>;
}

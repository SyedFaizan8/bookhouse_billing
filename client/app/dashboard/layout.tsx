"use client"

import SideBar from "@/components/SideBar"
import { useAuthUser } from "@/lib/queries/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }: {
    children: React.ReactNode
}) {

    const router = useRouter()
    const { data, isLoading } = useAuthUser()

    useEffect(() => {
        if (!data && !isLoading) router.push('/login')
    }, [data, isLoading])

    return <SideBar>{children}</SideBar>
}
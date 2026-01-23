"use client"

import { useAuthUser } from "@/lib/queries/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
    const router = useRouter()
    const { data } = useAuthUser()


    useEffect(() => {
        if (!data) router.replace('/login')
        else router.replace('/dashboard/year')
    }, [])

    return
}

export default Page

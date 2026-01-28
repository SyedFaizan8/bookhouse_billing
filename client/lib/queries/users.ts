import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { User } from "@/lib/types/user"
import api from "../utils/axios"

export type UserPayload = {
    name: string
    phone: string
    email?: string
    role: "ADMIN" | "STAFF"
    password?: string
}

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get<User[]>('/users')
            return res.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useUserEdit(id: string) {
    return useQuery({
        queryKey: ["user-edit", id],
        queryFn: async () => {
            const res = await api.get(`/users/${id}/edit`)
            return res.data
        },
        enabled: !!id,
    })
}

export function useUpdateUser(id: string) {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: UserPayload) => (await api.put(`/users/${id}`, data)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["users"] })
            qc.invalidateQueries({ queryKey: ["user-edit", id] })
        },
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UserPayload) => (await api.post('/users', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}

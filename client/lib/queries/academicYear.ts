import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/utils/axios"

export const useAcademicYears = () =>
    useQuery({
        queryKey: ["academic-years"],
        queryFn: async () => (await api.get(`/academic-year`)).data,
    })

export const useCreateAcademicYear = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (data: { startDate: string; endDate: string }) => await api.post(`/academic-year`, data),
        onSuccess: () => qc.invalidateQueries(),
    })
}

export const useCloseAcademicYear = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => await api.post(`/academic-year/${id}/close`),
        onSuccess: () => qc.invalidateQueries(),
    })
}

export const useOpenAcademicYear = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => await api.post(`/academic-year/${id}/open`),
        onSuccess: () => qc.invalidateQueries(),
    })
}

export const useAcademicYear = (id: string) =>
    useQuery({
        queryKey: ["academic-years", id],
        queryFn: async () => (await api.get(`/academic-year/single/${id}`)).data,
    })

export const useUpdateAcademicYear = (id: string) => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: {
            startDate: string,
            endDate: string
        }) => await api.patch(`/academic-year/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["academic-years"] })
    })
}


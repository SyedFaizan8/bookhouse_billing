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
        mutationFn: (data: { startDate: string; endDate: string }) => api.post(`/academic-year`, data),
        onSuccess: () => qc.invalidateQueries(),
    })
}

export const useCloseAcademicYear = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => api.post(`/academic-year/${id}/close`),
        onSuccess: () => qc.invalidateQueries(),
    })
}

export const useOpenAcademicYear = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => api.post(`/academic-year/${id}/open`),
        onSuccess: () => qc.invalidateQueries(),
    })
}

import { DashboardResponse, DocumentType, PartyType } from "../types/dashboard"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import api from "../utils/axios";

export type DashboardFilters = {
    party: PartyType
    type: DocumentType
    month?: string
    from?: string
    to?: string
}

export const useDashboardOverview = () =>
    useQuery({
        queryKey: ["dashboard-overview"],
        queryFn: async () => (await api.get("/dashboard")).data,
    });

export function useDashboardDocuments(filters: DashboardFilters) {
    return useInfiniteQuery<DashboardResponse>({
        queryKey: ["dashboard-documents", filters],
        initialPageParam: null as string | null,


        queryFn: async ({ pageParam }) => {
            const res = await api.get<DashboardResponse>(
                "/dashboard/documents",
                { params: { ...filters, cursor: pageParam, limit: 20 } }
            )
            return res.data
        },


        getNextPageParam: (last) => last.nextCursor,
    })
}



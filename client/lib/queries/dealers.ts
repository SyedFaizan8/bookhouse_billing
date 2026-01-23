import { InfiniteData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Company, DealerProfile } from "@/lib/types/dealer"
import { createDealer, createDealerPayment, createDealerReturn, createDealerSupply, DealerPaymentPayload, DealerReturnPayload, DealerSupplyPayload, fetchDealerEditById, fetchDealersPaginated, updateDealer } from "@/lib/api/dealers"
import { useCursorPagination, Page } from "@/lib/hooks/useCursorPagination"
import { toast } from "sonner"

export function useDealersInfinite(
    sortBy: "name" | "addedOn" | "amountDue",
    order: "asc" | "desc"
) {
    return useCursorPagination<Company, typeof sortBy>({
        queryKey: ["dealers"],
        fetchFn: fetchDealersPaginated,
        sortBy,
        order,
        limit: 500,
    }) as {
        data?: InfiniteData<Page<Company>>
        isLoading: boolean
        fetchNextPage: () => void
        hasNextPage?: boolean
        isFetchingNextPage: boolean
    }
}

export const useDealerEdit = (id?: string) =>
    useQuery({
        queryKey: ["dealer", id],
        queryFn: () => fetchDealerEditById(id!),
        enabled: !!id,
    })

export const useCreateDealer = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: createDealer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["dealers"] })
        },
    })
}

export const useUpdateDealer = (id: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: any) => updateDealer(id, data),
        onSuccess: () => {
            // refresh customer list & profile
            queryClient.invalidateQueries({ queryKey: ["dealers"] })
            queryClient.invalidateQueries({ queryKey: ["dealer", id] })
        },
    })
}


// dealer 2
import axios from "axios"
import { API_BASE_URL } from "../constants"
import api from "../utils/axios"

export const useDealerProfile = (id: string) =>
    useQuery({
        queryKey: ["dealer", id, "profile"],
        queryFn: async () =>
            (await api.get<DealerProfile>(`/dealer2/${id}/profile`)).data,
    })

export function useCreateDealerSupply(dealerId: string) {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (payload: DealerSupplyPayload) =>
            createDealerSupply(dealerId, payload),

        onSuccess: () => {
            toast.success("Dealer supply recorded")

            // future-proof invalidations
            qc.invalidateQueries({ queryKey: ["dealer", dealerId] })
            qc.invalidateQueries({ queryKey: ["dealer-supplies", dealerId] })
            qc.invalidateQueries({ queryKey: ["stock"] })
        },

        onError: (err: any) => {
            toast.error(err.message ?? "Failed to save supply")
        },
    })
}

// dealer returns

export function useCreateDealerReturn(dealerId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: DealerReturnPayload) => createDealerReturn(dealerId, payload),
        onSuccess: () => {
            toast.success("Returned to dealer");
            qc.invalidateQueries({ queryKey: ["stock"] });
            qc.invalidateQueries({ queryKey: ["dealer", dealerId] });
        },
        onError: (e: any) => toast.error(e.message),
    });
}

// dealers payment

export function useCreateDealerPayment(dealerId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            date: string;
            amount: number;
            mode: "CASH" | "UPI" | "BANK";
            note?: string;
        }) => {
            const res = await api.post(`/dealer2/${dealerId}/payments`, payload)
            return res.data
        },

        onSuccess: () => {
            toast.success("Payment recorded");
            qc.invalidateQueries({ queryKey: ["dealer", dealerId] });
            qc.invalidateQueries({ queryKey: ["dealer-payments", dealerId] });
        },

        onError: (e: any) => toast.error(e.message),
    });
}
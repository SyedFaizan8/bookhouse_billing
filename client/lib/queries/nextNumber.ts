import { useQuery } from "@tanstack/react-query";
import api from "../utils/axios";

export function useNextEstimationNumber() {
    return useQuery({
        queryKey: ["next-number", "estimation"],
        queryFn: async () => (await api.get<{ nextNumber: string }>('/next-number/estimation')).data,
        staleTime: 0, // stale immediately
        gcTime: 0,    // 🚫 cache removed instantly when unused
    })
}

export function useNextInvoiceNumber() {
    return useQuery({
        queryKey: ["next-number", "invoice"],
        queryFn: async () => (await api.get<{ nextNumber: string }>('/next-number/invoice')).data,
        staleTime: 0,
        gcTime: 0,
    })
}

export function useNextCreditNumber() {
    return useQuery({
        queryKey: ["next-number", "creditNote"],
        queryFn: async () => (await api.get<{ nextNumber: string }>('/next-number/credit')).data,
        staleTime: 0,
        gcTime: 0,
    })
}

export function useNextPaymentNumber() {
    return useQuery({
        queryKey: ["next-number", "payment"],
        queryFn: async () => (await api.get<{ nextNumber: string }>('/next-number/payment')).data,
        staleTime: 0,
        gcTime: 0,
    })
}
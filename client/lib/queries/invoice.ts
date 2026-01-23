import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceNumber, InvoicePdfData } from "../types/invoice";
import api from "../utils/axios";
import { CustomerPayloadInvoice } from "../validators/invoice.schema";

export function useCreateProvisionalInvoice() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CustomerPayloadInvoice) => (await api.post<CustomerPayloadInvoice>('/invoices/provisional', payload)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["customer-invoices"] })
        }
    });
}

export function useInvoicePdf(id: string) {
    return useQuery({
        queryKey: ["invoice-pdf", id],
        queryFn: async () => (await api.get<InvoicePdfData>(`/invoices/${id}`)).data,
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}


export function useInvoiceNumber() {
    return useQuery({
        queryKey: ["invoice-number"],
        queryFn: async () => (await api.get<InvoiceNumber>('/invoices/next-number')).data
    })
}

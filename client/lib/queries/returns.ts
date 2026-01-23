import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateSalesReturnInput, SalesReturnInvoice } from "../types/returns";
import api from "../utils/axios";

export const useReturnInvoices = (customerId: string) =>
    useQuery<SalesReturnInvoice[]>({
        queryKey: ["return-invoices", customerId],
        queryFn: async () => (await api.get(`/customer2/${customerId}/returns/invoices`)).data
    });

export const useCreateSalesReturn = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateSalesReturnInput) => (await api.post(`/sales-returns`, payload)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["return-invoices"] }),
    });
}


import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../constants";
import api from "../utils/axios";
import { PaymentRow, ReceiptNo } from "../types/payments";
import { PaymentFormValues } from "../validators/payments.schema";

export function useCustomerPayments(customerId: string) {
    return useQuery({
        queryKey: ["payments", customerId],
        queryFn: async () =>
            (await api.get<PaymentRow[]>(`/customer2/${customerId}/payments`)).data
    });
}

export function useCreatePayment(customerId: string) {
    const q = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => (await api.post(`/customer2/${customerId}/payments`, data)).data,
        onSuccess: () => {
            q.invalidateQueries({ queryKey: ["customers"] })
            q.invalidateQueries({ queryKey: ["payments", customerId] })
        }
    });
}

export function useReceiptPdf(id: string) {
    return useQuery({
        queryKey: ["receipt-pdf", id],
        queryFn: async () => (await api.get(`/payments/${id}/receipt`)).data
    });
}

export function useNextPaymentReceiptNumber() {
    return useQuery({
        queryKey: ["payment-receipt-number"],
        queryFn: async () => (await api.get<ReceiptNo>('/payments/next-receipt-number')).data
    });
}
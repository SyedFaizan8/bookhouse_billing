import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/utils/axios";
import { Company, CompanyProfile, CompanyStatement, CreateCompanyInvoicePayload } from "../types/company";
import { CompanyFormValues } from "../validators/dealer.schema";
import { InvoiceRow } from "../types/customer";
import { CompanyInvoicePdfData } from "../types/invoice";
import { CreateCompanyPayload } from "../types/estimation";
import { PaymentRow } from "../types/payments";

// GET LIST OF COMPANIES
export function useCompanyInfinite(
    sortBy: "name" | "addedOn",
    order: "asc" | "desc",
    search: string
) {
    return useInfiniteQuery({
        queryKey: ["companies", sortBy, order, search],
        initialPageParam: null as string | null,

        queryFn: async ({ pageParam }) => {
            const res = await api.get("/company", {
                params: {
                    cursor: pageParam,
                    limit: 10,
                    sort: sortBy,
                    order,
                    search,
                },
            });

            return res.data as {
                items: Company[];
                nextCursor: string | null;
            };
        },

        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
}

// CREATE COMPANY
export const useCreateCompany = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: CompanyFormValues) => (await api.post('/company/new', data)).data,
        onSuccess: (e) => {
            console.log(e)
            qc.invalidateQueries({ queryKey: ["companies"] })
        },
    })
}

// COMPANY PROFILE
export const useCompanyProfile = (id: string) =>
    useQuery({
        queryKey: ["company", id, "profile"],
        queryFn: async () =>
            (await api.get<CompanyProfile>(`/company/profile/${id}`)).data,
    })


// ALL INVOICES
export const useCompanyInvoices = (id: string) =>
    useQuery({
        queryKey: ["company-invoices", id],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/invoice/company/${id}`)).data,
    });

// CREATE INVOICE
export function useCreateCompanyInvoice() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateCompanyInvoicePayload) =>
            (await api.post(
                "/invoice/company/new",
                payload
            )).data,

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["company-invoices"] });
        },
    });
}

// INDIVIDUAL INVOICE
export function useCompanyInvoicePdf(id: string) {
    return useQuery({
        queryKey: ["company-invoice-pdf", id],
        queryFn: async () => (await api.get<CompanyInvoicePdfData>(`/invoice/company/single/${id}`)).data,
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}


// CREDIT NOTE
export const useCompanyCreditNote = (id: string) =>
    useQuery({
        queryKey: ["company-creditNote", id],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/credit/company/${id}`)).data,
    });


export function useCreateCompanyCreditNote() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateCompanyPayload) =>
            (await api.post(
                "/credit/company/new",
                payload
            )).data,

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["company-creditNote"] });
        },
    });
}

// PAYMENTS
export function useCreateCompanyPayment(id: string) {
    const q = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => (await api.post(`/payment/company/${id}`, data)).data,
        onSuccess: () => {
            q.invalidateQueries({ queryKey: ["payments", id] })
            q.invalidateQueries({ queryKey: ["receipt-pdf", id] })
        }
    });
}

export function useCompanyPayments(id: string) {
    return useQuery({
        queryKey: ["payments", id],
        queryFn: async () =>
            (await api.get<PaymentRow[]>(`/payment/company/${id}`)).data
    });
}

export function useCustomerReceiptPdf(id: string) {
    return useQuery({
        queryKey: ["receipt-pdf", id],
        queryFn: async () => (await api.get(`/payment/company/receipt/${id}`)).data
    });
}

// UPDATE COMPANY
export const useUpdateCompany = (id: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CompanyFormValues) => (await api.put(`/company/${id}`, data)).data,
        onSuccess: () => {
            // refresh customer list & profile
            queryClient.invalidateQueries({ queryKey: ["companies"] })
            queryClient.invalidateQueries({ queryKey: ["company", id] })
        },
    })
}

// STATEMENTS
export const useCompanyStatement = (id: string) =>
    useQuery<CompanyStatement>({
        queryKey: ["statement", id],
        queryFn: async () => (await api.get(`/statement/company/${id}`)).data
    });

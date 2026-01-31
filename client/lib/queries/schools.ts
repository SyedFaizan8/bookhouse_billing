import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/axios";
import { InvoiceRow, School, SchoolEditResponse, SchoolProfile } from "../types/customer";
import { CreatePayload } from "../types/estimation";
import { InvoicePdfData } from "../types/invoice";
import { PaymentRow } from "../types/payments";
import { SchoolStatement } from "../types/school";
import { CustomerFormValues } from "../validators/customer.schema";
import { toast } from "sonner";


// GET LIST OF SCHOOLS
export function useSchoolsInfinite(
    sortBy: "name" | "addedOn",
    order: "asc" | "desc",
    search: string
) {
    return useInfiniteQuery({
        queryKey: ["schools", sortBy, order, search],
        initialPageParam: null as string | null,

        queryFn: async ({ pageParam }) => {
            const res = await api.get("/schools", {
                params: {
                    cursor: pageParam,
                    limit: 10,
                    sort: sortBy,
                    order,
                    search,
                },
            });

            return res.data as {
                items: School[];
                nextCursor: string | null;
            };
        },

        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
}

// CREATE SCHOOL
export const useCreateSchool = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: CustomerFormValues) => (await api.post('/schools/new', data)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["schools"] })
            toast.success("School created successfully")
        },
        onError: (e) => toast.error(e.message)

    })
}

// UPDATE SCHOOL
export const useUpdateSchool = (id: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CustomerFormValues) => (await api.put(`/schools/${id}`, data)).data,
        onSuccess: () => {
            // refresh customer list & profile
            queryClient.invalidateQueries({ queryKey: ["schools"] })
            queryClient.invalidateQueries({ queryKey: ["school", id] })
        }
    })
}

// EDIT SCHOOL
export const useSchoolEdit = (id?: string) =>
    useQuery({
        queryKey: ["school", id],
        queryFn: async () => (await api.get<SchoolEditResponse>(`/schools/${id}/edit`)).data,
        enabled: !!id,
    })

// SCHOOL PROFILE
export const useSchoolProfile = (id: string) =>
    useQuery({
        queryKey: ["school", id, "profile"],
        queryFn: async () =>
            (await api.get<SchoolProfile>(`/schools/${id}/profile`)).data,
    })

// INVOICE
export function useInvoicePdf(id: string) {
    return useQuery({
        queryKey: ["invoice-pdf", id],
        queryFn: async () => (await api.get<InvoicePdfData>(`/invoice/school/single/${id}`)).data,
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
// INVOICES
export const useSchoolInvoices = (schoolId: string) =>
    useQuery({
        queryKey: ["school-invoices", schoolId],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/invoice/school/${schoolId}`)).data,
    });

export function useCreateInvoice() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePayload) =>
            (await api.post(
                "/invoice/school/new",
                payload
            )).data,

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["school-invoices"] });
            qc.invalidateQueries({ queryKey: ["statement"] })
            qc.invalidateQueries({ queryKey: ["documents-export"] });
        },
    });
}


// ESTIMATION
export const useSchoolEstimations = (schoolId: string) =>
    useQuery({
        queryKey: ["school-estimations", schoolId],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/estimation/${schoolId}`)).data,
    });


export function useCreateEstimation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePayload) =>
            (await api.post("/estimation/new", payload)).data,

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["school-estimations"] });
        },
    });
}

export const useUpdateEstimation = (id: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => (await api.patch(`/estimation/${id}`, data)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["school-estimations", id] });
        },
    });
};

// PACKAGE NOTE
export const useSchoolPackage = (schoolId: string) =>
    useQuery({
        queryKey: ["school-estimations", schoolId],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/package/${schoolId}`)).data,
    });

// CREDIT NOTE
export const useSchoolCreditNote = (schoolId: string) =>
    useQuery({
        queryKey: ["school-creditNote", schoolId],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/credit/school/${schoolId}`)).data,
    });


export function useCreateCreditNote() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePayload) => (await api.post("/credit/school/new", payload)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["school-creditNote"] });
            qc.invalidateQueries({ queryKey: ["statement"] })
            qc.invalidateQueries({ queryKey: ["documents-export"] });
        },
    });
}


// PAYMENTS
export function useSchoolPayments(schoolId: string) {
    return useQuery({
        queryKey: ["payments", schoolId],
        queryFn: async () =>
            (await api.get<PaymentRow[]>(`/payment/school/${schoolId}`)).data
    });
}

export function useCreateSchoolPayment(schoolId: string) {
    const q = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => (await api.post(`/payment/school/${schoolId}`, data)).data,
        onSuccess: () => {
            q.invalidateQueries({ queryKey: ["payments", schoolId] })
            q.invalidateQueries({ queryKey: ["statement"] })
            q.invalidateQueries({ queryKey: ["dashboard"] })
            q.invalidateQueries({ queryKey: ["documents-export"] });
        }
    });
}

export function useSchoolReceiptPdf(schoolId: string) {
    return useQuery({
        queryKey: ["receipt-pdf", schoolId],
        queryFn: async () => (await api.get(`/payment/school/receipt/${schoolId}`)).data
    });
}

// STATEMENTS
export const useSchoolStatement = (id: string) =>
    useQuery<SchoolStatement>({
        queryKey: ["statement", id],
        queryFn: async () => (await api.get(`/statement/school/${id}`)).data
    });

// VOID INVOICE / CREDIT NOTE
export const voidInvoice = () => {
    const q = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => (await api.post(`/invoice/void/${id}`)).data,
        onSuccess: () => {
            q.invalidateQueries({ queryKey: ["statement"] })
            q.invalidateQueries({ queryKey: ["school-invoices"] })
            q.invalidateQueries({ queryKey: ["company-invoices"] })
            q.invalidateQueries({ queryKey: ["school-creditNote"] })
            q.invalidateQueries({ queryKey: ["company-creditNote"] })
            q.invalidateQueries({ queryKey: ["documents-export"] });
        }
    });
}

// VOID PAYMENT
export const reversePayment = () => {
    const q = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => (await api.post(`/payment/reverse/${id}`)).data,
        onSuccess: () => {
            q.invalidateQueries({ queryKey: ["statement"] })
            q.invalidateQueries({ queryKey: ["payments"] })
            q.invalidateQueries({ queryKey: ["receipt-pdf"] })
            q.invalidateQueries({ queryKey: ["documents-export"] });
        }
    });
}

// DELETE ESTIMATION
export const deleteEstimation = () => {
    const q = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => (await api.post(`/estimation/delete/${id}`)).data,
        onSuccess: () => {
            q.invalidateQueries({ queryKey: ["school-estimations"] })
        }
    });
}
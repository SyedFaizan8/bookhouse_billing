import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Customer, CustomerEditResponse, CustomerProfile, InvoiceRow } from "@/lib/types/customer"

import api from "@/lib/utils/axios"
import { CustomerFormValues } from "@/lib/validators/customer.schema"

export const useCustomerProfile = (id: string) =>
    useQuery({
        queryKey: ["customer", id, "profile"],
        queryFn: async () =>
            (await api.get<CustomerProfile>(`/customer2/${id}/profile`)).data,
    })

export const useCustomerInvoices = (customerId: string) =>
    useQuery({
        queryKey: ["customer-invoices", customerId],
        queryFn: async () =>
            (await api.get<InvoiceRow[]>(`/customer2/${customerId}/invoices`)).data,
    });


export function useCustomersInfinite(
    sortBy: "name" | "addedOn" | "amountDue",
    order: "asc" | "desc",
    search: string
) {
    return useInfiniteQuery({
        queryKey: ["customers", sortBy, order, search],
        initialPageParam: null as string | null,

        queryFn: async ({ pageParam }) => {
            const res = await api.get("/customer2", {
                params: {
                    cursor: pageParam,
                    limit: 10,
                    sort: sortBy,
                    order,
                    search,
                },
            });

            return res.data as {
                items: Customer[];
                nextCursor: string | null;
            };
        },

        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
}

export const useCreateCustomer = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: CustomerFormValues) => (await api.post('/customer2/new', data)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["customers"] })
            toast.success("Customer created successfully")
        },
        onError: (e) => toast.error(e.message)

    })
}

export const useCustomerEdit = (id?: string) =>
    useQuery({
        queryKey: ["customer", id],
        queryFn: async () => (await api.get<CustomerEditResponse>(`/customer2/${id}/edit`)).data,
        enabled: !!id,
    })


export const useUpdateCustomer = (id: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CustomerFormValues) => (await api.put(`/customer2/${id}`, data)).data,
        onSuccess: () => {
            // refresh customer list & profile
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            queryClient.invalidateQueries({ queryKey: ["customer", id] })
            toast.success("Customer updated successfully")
        },
        onError: (e) => {
            toast.error(e.message ? e.message : "Failed to update the customer")
        }
    })
}
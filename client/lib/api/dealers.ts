import { Company, DealerEditResponse } from "@/lib/types/dealer"
import { DealerFormValues } from "../validators/dealer.schema"
import { API_BASE_URL } from "../constants"
import api from "../utils/axios"

export type DealersPage = {
    items: Company[]
    nextCursor: string | null
}

export async function fetchDealersPaginated(params: {
    cursor?: string | null
    limit: number
    sortBy: "name" | "addedOn" | "amountDue"
    order: "asc" | "desc"
}): Promise<DealersPage> {
    const search = new URLSearchParams()

    if (params.cursor != null) {
        search.set("cursor", params.cursor)
    }

    search.set("limit", String(params.limit))
    search.set("sort", params.sortBy)
    search.set("order", params.order)

    const res = await fetch(`${API_BASE_URL}/api/dealers?${search.toString()}`, {
        credentials: "include",
        cache: "no-store", // ✅ critical
    })

    if (!res.ok) {
        throw new Error("Failed to fetch dealers")
    }

    const data = await res.json()

    if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid dealers response")
    }

    return data
}

export async function fetchDealerEditById(id: string): Promise<DealerEditResponse> {
    const res = await fetch(`${API_BASE_URL}/api/dealers/${id}/edit`, {
        cache: "no-store",
        credentials: "include",
    })

    if (!res.ok) {
        throw new Error("Failed to fetch dealer")
    }

    return res.json()
}


export async function createDealer(data: DealerFormValues) {

    const res = await api.post('/dealers', data)
    return res
}

export async function updateDealer(
    id: string,
    data: DealerFormValues
) {
    const res = await api.put(`/dealers/${id}`, data)
    return res.data
}

// dealer 2

// Dealer supply

export interface DealerSupplyItem {
    textbookId?: string
    title: string
    class: string
    mrp: number
    qty: number
}

export interface DealerSupplyPayload {
    dealerInvoiceNo: string
    invoiceDate: string
    notes?: string
    items: DealerSupplyItem[]
    recordedByUserId: string
}

export async function createDealerSupply(
    dealerId: string,
    payload: DealerSupplyPayload
) {
    const res = await api.post(`/dealer2/${dealerId}/supplies`, payload)
    return res.data
}

// dealer return

export interface DealerReturnItem {
    textbookId: string;
    qty: number;
}

export interface DealerReturnPayload {
    date: string;
    notes?: string;
    items: DealerReturnItem[];
    recordedByUserId: string
}

export async function createDealerReturn(
    dealerId: string,
    payload: DealerReturnPayload
) {
    const res = await api.post(`/dealer2/${dealerId}/returns`, payload)
    return res.data;
}

// dealers payment

export interface DealerPaymentPayload {
    date: string;
    amount: number;
    mode: "CASH" | "UPI" | "BANK";
    note?: string;
}

export async function createDealerPayment(
    dealerId: string,
    payload: DealerPaymentPayload
) {
    const res = await fetch(`${API_BASE_URL}/api/dealer2/${dealerId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Payment failed");
    }

    return res.json();
}

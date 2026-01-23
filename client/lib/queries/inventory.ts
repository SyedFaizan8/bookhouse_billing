import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InventoryRow } from "../types/inventory";
import api from "../utils/axios";

export const useInventory = () =>
    useQuery<InventoryRow[]>({
        queryKey: ["inventory"],
        queryFn: async () => (await api.get('/inventory')).data
    });

export const useTextbook = (id: string) =>
    useQuery({
        queryKey: ["textbook", id],
        queryFn: async () => (await api.get(`/inventory/textbooks/${id}`)).data
    });

export const useUpdateTextbook = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: any) => (await api.put(`/inventory/textbooks/${id}`, data)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["inventory"] });
            qc.invalidateQueries({ queryKey: ["textbook"] });
        },
    });
};
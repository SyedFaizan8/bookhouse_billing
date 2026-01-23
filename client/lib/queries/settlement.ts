import { useQuery } from "@tanstack/react-query";
import { CustomerStatement } from "../types/customer";
import api from "../utils/axios";

export const useCustomerStatement = (id: string) =>
    useQuery<CustomerStatement>({
        queryKey: ["statement", id],
        queryFn: async () => (await api.get(`/customer2/${id}/statement`)).data
    });
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/utils/axios";
import { CompanyInfoForm } from "../validators/companyInfo.schema";

export type CompanyInfoResponse = CompanyInfoForm & {
    createdAt?: Date
    modifiedAt?: Date
}

export const useCompanyInfo = () =>
    useQuery({
        queryKey: ["company-info"],
        queryFn: async () => (await api.get<CompanyInfoResponse>('/company-info')).data,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

export function useUpdateCompanyInfo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            await api.put("/company-info", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["company-info"],
            });
        },
    });
}
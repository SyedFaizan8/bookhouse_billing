import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsInfoForm } from "../validators/companyInfo.schema";
import api from "../utils/axios";

export type SettingsInfoResponse = SettingsInfoForm & {
    createdAt?: Date
    modifiedAt?: Date
}

export const useSettingsInfo = () =>
    useQuery({
        queryKey: ["settings"],
        queryFn: async () => (await api.get<SettingsInfoResponse>('/settings')).data,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

export function useUpdateSettingsInfo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            await api.put("/settings", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["settings"],
            });
        },
    });
}

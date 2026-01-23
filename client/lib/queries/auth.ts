import { AuthUser } from "@/lib/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/utils/axios";
import { useRouter } from "next/navigation";

export function useAuthUser() {
    return useQuery<AuthUser>({
        queryKey: ["auth-user"],
        queryFn: async () => (await api.get(`/auth/me`)).data,
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: false,
    })
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await api.post(`/auth/logout`);
        },

        onSuccess: () => {
            queryClient.removeQueries();
            router.replace("/login");
        },
    });
}
import { useQuery } from "@tanstack/react-query";
import api from "../utils/axios";

export const useDashboardOverview = () =>
    useQuery({
        queryKey: ["dashboard-overview"],
        queryFn: async () => (await api.get("/dashboard")).data,
    });
export type User = {
    id: string
    name: string
    phone: string
    email: string
    role: "SUPERADMIN" | "ADMIN" | "STAFF"
    createdAt: string
}

export type AuthUser = {
    id: string;
    name: string;
    phone: string;
    role: "ADMIN" | "STAFF";
};

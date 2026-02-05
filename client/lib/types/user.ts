export type User = {
    id: string
    name: string
    phone: string
    email: string
    role: "ADMIN" | "STAFF"
    active: boolean
    createdAt: string
}

export type AuthUser = {
    id: string;
    name: string;
    phone: string;
    role: "ADMIN" | "STAFF";
};

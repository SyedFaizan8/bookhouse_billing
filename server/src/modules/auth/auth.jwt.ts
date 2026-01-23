import jwt from "jsonwebtoken";
import { env } from "../../env.js";

export function signToken(user: {
    id: string;
    role: string;
}) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}
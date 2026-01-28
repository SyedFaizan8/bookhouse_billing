import { AxiosError } from "axios";
import { FieldValues, UseFormSetError } from "react-hook-form";

type ApiErrorResponse = {
    success: false;
    message: string;
    errors?: Record<string, string>;
};

type HandleApiErrorOptions<T extends FieldValues> = {
    setError?: UseFormSetError<T>;
};

export function handleApiError<T extends FieldValues>(
    error: unknown,
    options?: HandleApiErrorOptions<T>
) {
    const setError = options?.setError;

    let message = "Something went wrong";
    let status: number | undefined;

    if (error instanceof AxiosError) {
        status = error.response?.status;

        const data = error.response?.data as ApiErrorResponse | undefined;

        // ✅ FORM ERRORS
        if (data?.errors && setError) {
            Object.entries(data.errors).forEach(([field, msg]) => {
                setError(field as any, {
                    type: "server",
                    message: msg,
                });
            });

            return {
                handled: true,
                status,
            };
        }

        message = data?.message || error.message;
    }

    return {
        handled: false,
        message,
        status,
    };
}

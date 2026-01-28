"use client";

import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppButton() {
    return (
        <button
            onClick={() => toast.warning("WhatsApp will be implemented in the next update.")}
            className="
                fixed bottom-6 right-6
                h-14 w-14
                rounded-full
                bg-[#25D366]
                hover:bg-[#20bd5a]
                shadow-lg
                flex items-center justify-center
                transition
                active:scale-95
            "
            aria-label="Send via WhatsApp"
        >
            <MessageCircle
                size={28}
                className="text-white"
                strokeWidth={2.2}
            />
        </button>
    );
}

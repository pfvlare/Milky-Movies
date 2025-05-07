import { z } from "zod";

export const SubscriptionSchema = z.object({
    cardNumber: z
        .string()
        .min(16, "O número do cartão deve ter 16 dígitos")
        .max(16, "O número do cartão deve ter 16 dígitos"),
    cvv: z
        .string()
        .min(3, "O CVV deve ter exatamente 3 dígitos")
        .max(3, "O CVV deve ter exatamente 3 dígitos"),
    expiry: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Formato inválido (MM/AA)"),
});

export type SubscriptionType = z.infer<typeof SubscriptionSchema>;

import { z } from "zod";

export const SubscriptionSchema = z.object({
    cardNumber: z
        .string()
        .min(16, "Número do cartão deve ter 16 dígitos")
        .max(16, "Número do cartão deve ter 16 dígitos")
        .regex(/^\d{16}$/, "Número do cartão deve conter apenas números"),

    cvv: z
        .string()
        .min(3, "CVV deve ter 3 dígitos")
        .max(3, "CVV deve ter 3 dígitos")
        .regex(/^\d{3}$/, "CVV deve conter apenas números"),

    expiry: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato deve ser MM/AA")
        .refine((value) => {
            const [month, year] = value.split("/");
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(`20${year}`, 10);
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            // Verificar se não é no passado
            if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
                return false;
            }

            return true;
        }, "Cartão não pode estar vencido"),
});

export type SubscriptionType = z.infer<typeof SubscriptionSchema>;
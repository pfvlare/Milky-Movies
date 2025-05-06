import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z
        .string()
        .regex(/^\d{6}$/, "A senha deve ter exatamente 6 números"),
});

export type LoginType = z.infer<typeof LoginSchema>;
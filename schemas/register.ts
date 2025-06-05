import { z } from "zod";

export const RegisterSchema = z.object({
    firstname: z.string().min(1, "Nome é obrigatório"),
    lastname: z.string().min(1, "Sobrenome é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    address: z.string().min(1, "Endereço é obrigatório"),
    password: z.string().min(6, "Senha deve ter 6 dígitos"),
    // ✅ CORREÇÃO: Aceitar tanto maiúsculo quanto minúsculo
    subscription: z.object({
        plan: z.enum(["basic", "intermediary", "complete", "BASIC", "INTERMEDIARY", "COMPLETE"], {
            errorMap: () => ({ message: "Plano deve ser básico, padrão ou premium" })
        }),
        value: z.number().positive("Valor deve ser positivo"),
    }),
});

export type RegisterType = z.infer<typeof RegisterSchema>;
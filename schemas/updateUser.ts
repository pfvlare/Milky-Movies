import { z } from "zod";

export const UpdateUserSchema = z.object({
    firstname: z.string().optional().refine(val => !val || val.trim().length > 0, {
        message: "Nome não pode estar vazio"
    }),
    lastname: z.string().optional().refine(val => !val || val.trim().length > 0, {
        message: "Sobrenome não pode estar vazio"
    }),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional().refine(val => !val || val.trim().length > 0, {
        message: "Telefone não pode estar vazio"
    }),
    address: z.string().optional().refine(val => !val || val.trim().length > 0, {
        message: "Endereço não pode estar vazio"
    }),
});

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
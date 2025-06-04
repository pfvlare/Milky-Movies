import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    subscription: z.object({
        plan: z.enum(["basic", "intermediary", "complete"]),
        value: z.number(),
    }),
});

export type RegisterType = z.infer<typeof RegisterSchema>;

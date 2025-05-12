import { z } from 'zod';
import { SubscriptionSchema } from './subscription';

export const RegisterSchema = z.object({
    firstname: z.string().min(1, 'Nome é obrigatório'),
    lastname: z.string().min(1, 'Sobrenome é obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().regex(/^\d{6}$/, 'A senha deve ter exatamente 6 números'),
    phone: z.string().regex(/^\d{11}$/, 'Digite 11 números'),
    address: z.string().min(1, 'Endereço é obrigatório'),
    Subscription: SubscriptionSchema
});

export type RegisterType = z.infer<typeof RegisterSchema>;
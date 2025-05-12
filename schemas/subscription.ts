import { z } from 'zod';

export const SubscriptionSchema = z.object({
    plan: z.string(),
    value: z.number(),
});

export type SubscriptionType = z.infer<typeof SubscriptionSchema>;
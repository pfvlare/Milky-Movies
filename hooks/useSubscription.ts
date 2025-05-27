import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../utils/axios';

export function useCreateSubscription(userId: string) {
    return useMutation({
        mutationFn: (data: any) => api.post(`/subscriptions/user/${userId}`, data),
    });
}

export function useSubscriptions() {
    return useQuery({
        queryKey: ['subscriptions'],
        queryFn: () => api.get('/subscriptions').then(res => res.data),
    });
}

export function useSubscriptionByUserId(userId: string) {
    return useQuery({
        queryKey: ['subscription', userId],
        queryFn: () => api.get(`/subscriptions/user/${userId}`).then(res => res.data),
        enabled: !!userId,
    });
}

export function useUpdateSubscription(userId: string) {
    return useMutation({
        mutationFn: (data: any) => api.put(`/subscriptions/user/${userId}`, data),
    });
}

export function useRemoveSubscription(userId: string) {
    return useMutation({
        mutationFn: () => api.delete(`/subscriptions/user/${userId}`),
    });
}

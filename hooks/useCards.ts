import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../utils/axios';

export function useCreateCard() {
    return useMutation({
        mutationFn: (data: any) => api.post('/cards', data),
    });
}

export function useEditCard(cardId: string) {
    return useMutation({
        mutationFn: (data: any) => api.put(`/cards/${cardId}`, data),
    });
}

export function useCards() {
    return useQuery({
        queryKey: ['cards'],
        queryFn: () => api.get('/cards').then(res => res.data),
    });
}

export function useCardsByUser(userId: string) {
    return useQuery({
        queryKey: ['cards', userId],
        queryFn: () => api.get(`/cards/user/${userId}`).then(res => res.data),
        enabled: !!userId,
    });
}

export function useDeleteCard(cardId: string) {
    return useMutation({
        mutationFn: () => api.delete(`/cards/${cardId}`),
    });
}

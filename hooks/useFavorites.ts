import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../utils/axios';

export function useCreateFavorites(userId: string) {
    return useMutation({
        mutationFn: () => api.post(`/favorites/${userId}`),
    });
}

export function useAllFavorites() {
    return useQuery({
        queryKey: ['favorites'],
        queryFn: () => api.get('/favorites').then(res => res.data),
    });
}

export function useFavoritesByUser(userId: string) {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => api.get(`/favorites/user/${userId}`).then(res => res.data),
        enabled: !!userId,
    });
}

export function useAddFavorite(userId: string, movieId: string) {
    return useMutation({
        mutationFn: () => api.post(`/favorites/add/${userId}/${movieId}`),
    });
}

export function useRemoveFavorite(userId: string, movieId: string) {
    return useMutation({
        mutationFn: () => api.delete(`/favorites/remove/${userId}/${movieId}`),
    });
}

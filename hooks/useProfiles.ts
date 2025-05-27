import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';

export function useCreateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.post('/profiles', data).then(res => res.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
    });
}

export function useEditProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.put(`/profiles/${id}`, data).then(res => res.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
    });
}

export function useDeleteProfile(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/profiles/${id}`).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
    });
}

export function useProfiles(userId: string) {
    return useQuery({
        queryKey: ['profiles', userId],
        queryFn: () => api.get(`/profiles/user/${userId}`).then(res => res.data),
        enabled: !!userId,
    });
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

export function useUpdateSubscription(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => {
            console.log('🔄 Atualizando assinatura:', { userId, data });
            return api.put(`/subscriptions/user/${userId}`, data);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Assinatura atualizada com sucesso:', data);
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao atualizar assinatura:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useCancelSubscription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            console.log('🚫 Cancelando assinatura para usuário:', userId);
            const response = await api.delete(`/subscriptions/user/${userId}`);
            return response.data;
        },
        onSuccess: (data, userId) => {
            console.log('✅ Assinatura cancelada com sucesso:', data);
            // Invalidar cache das assinaturas
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao cancelar assinatura:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useRemoveSubscription(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => {
            console.log('🗑️ Removendo assinatura para usuário:', userId);
            return api.delete(`/subscriptions/user/${userId}`);
        },
        onSuccess: () => {
            console.log('✅ Assinatura removida com sucesso');
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao remover assinatura:', error?.response?.data || error);
            throw error;
        }
    });
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';
import { useEnforceProfileLimits } from './useProfiles';
import Toast from 'react-native-toast-message';

export function useCreateSubscription(userId: string) {
    const queryClient = useQueryClient();
    const enforceProfileLimits = useEnforceProfileLimits();

    return useMutation({
        mutationFn: (data: any) => {
            console.log('🔄 Criando assinatura:', { userId, data });
            return api.post(`/subscriptions/user/${userId}`, data);
        },
        onSuccess: async (data, variables) => {
            console.log('✅ Assinatura criada com sucesso:', data);

            // Invalidar queries de assinatura
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

            // Aplicar limites de perfil
            try {
                await enforceProfileLimits.mutateAsync(userId);
            } catch (error) {
                console.warn('⚠️ Erro ao aplicar limites de perfil:', error);
            }
        },
        onError: (error: any) => {
            console.error('❌ Erro ao criar assinatura:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useUpdateSubscription(userId: string) {
    const queryClient = useQueryClient();
    const enforceProfileLimits = useEnforceProfileLimits();

    return useMutation({
        mutationFn: (data: any) => {
            console.log('🔄 Atualizando assinatura:', { userId, data });
            return api.put(`/subscriptions/user/${userId}`, data);
        },
        onSuccess: async (data, variables) => {
            console.log('✅ Assinatura atualizada com sucesso:', data);

            // Invalidar queries de assinatura
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

            // Aplicar limites de perfil após mudança de plano
            try {
                await enforceProfileLimits.mutateAsync(userId);
            } catch (error) {
                console.warn('⚠️ Erro ao aplicar limites de perfil:', error);
            }
        },
        onError: (error: any) => {
            console.error('❌ Erro ao atualizar assinatura:', error?.response?.data || error);
            throw error;
        }
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
        queryFn: () => {
            console.log('🔍 Buscando assinatura para userId:', userId);
            return api.get(`/subscriptions/user/${userId}`).then(res => {
                console.log('✅ Assinatura encontrada:', res.data);
                return res.data;
            });
        },
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

export function useCancelSubscription() {
    const queryClient = useQueryClient();
    const enforceProfileLimits = useEnforceProfileLimits();

    return useMutation({
        mutationFn: async (userId: string) => {
            console.log('🚫 Cancelando assinatura para usuário:', userId);
            const response = await api.delete(`/subscriptions/user/${userId}`);
            return response.data;
        },
        onSuccess: async (data, userId) => {
            console.log('✅ Assinatura cancelada com sucesso:', data);

            // Invalidar cache das assinaturas
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

            // Aplicar limites básicos (1 perfil)
            try {
                await enforceProfileLimits.mutateAsync(userId);
                Toast.show({
                    type: "info",
                    text1: "Assinatura cancelada",
                    text2: "Você foi movido para o plano básico (1 perfil)"
                });
            } catch (error) {
                console.warn('⚠️ Erro ao aplicar limites após cancelamento:', error);
            }
        },
        onError: (error: any) => {
            console.error('❌ Erro ao cancelar assinatura:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useRemoveSubscription(userId: string) {
    const queryClient = useQueryClient();
    const enforceProfileLimits = useEnforceProfileLimits();

    return useMutation({
        mutationFn: () => {
            console.log('🗑️ Removendo assinatura para usuário:', userId);
            return api.delete(`/subscriptions/user/${userId}`);
        },
        onSuccess: async () => {
            console.log('✅ Assinatura removida com sucesso');

            // Invalidar queries
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

            // Aplicar limites básicos
            try {
                await enforceProfileLimits.mutateAsync(userId);
            } catch (error) {
                console.warn('⚠️ Erro ao aplicar limites após remoção:', error);
            }
        },
        onError: (error: any) => {
            console.error('❌ Erro ao remover assinatura:', error?.response?.data || error);
            throw error;
        }
    });
}
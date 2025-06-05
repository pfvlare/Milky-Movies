import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';
import { RegisterType } from '../schemas/register';

export interface Subscription {
    id: string;
    plan: string;
    value: number;
    registeredAt: string;
    expiresAt: string;
    userId: string;
}

export interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    address: string;
    password?: string;
    Subscription?: Subscription;
    Profile?: any[];
    currentProfileId?: string;
}

export interface UpdateUserData {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export function useRegister() {
    return useMutation({
        mutationFn: async (data: RegisterType) => {
            // DEBUG: Verificar dados antes de enviar
            console.log('🔍 Dados sendo enviados para o backend:', {
                ...data,
                password: '[HIDDEN]'
            });

            // Verificação final - subscription deve existir
            if (!data.subscription) {
                console.error('❌ Subscription está vazio:', data.subscription);
                throw new Error('Dados de assinatura são obrigatórios');
            }

            // ✅ CORREÇÃO: Aceitar apenas minúsculo (como o backend espera)
            const validPlans = ['basic', 'intermediary', 'complete'];
            if (!data.subscription.plan || !validPlans.includes(data.subscription.plan.toLowerCase())) {
                console.error('❌ Plano inválido:', data.subscription.plan);
                throw new Error(`Plano inválido: ${data.subscription.plan}. Deve ser: ${validPlans.join(', ')}`);
            }

            if (!data.subscription.value || data.subscription.value <= 0) {
                console.error('❌ Valor inválido:', data.subscription.value);
                throw new Error(`Valor inválido: ${data.subscription.value}`);
            }

            const response = await api.post('/user/register', data);
            return response.data;
        }
    });
}

export function useLogin() {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/user/login', data);
            return response.data;
        }
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
            console.log('🔄 Atualizando usuário:', { id, data });
            const response = await api.put(`/user/update/${id}`, data);
            return response.data;
        },
        onSuccess: (updatedUser, variables) => {
            console.log('✅ Usuário atualizado com sucesso:', updatedUser);

            // Atualizar cache do React Query
            queryClient.setQueryData(['user', variables.id], updatedUser);
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao atualizar usuário:', error);
            throw error;
        }
    });
}

export function useFindById(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            if (!id) {
                throw new Error('ID do usuário é obrigatório');
            }
            console.log('🔍 Buscando usuário por ID:', id);
            const response = await api.get(`/user/find/${id}`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false; // Não retry para erros de cliente
            }
            return failureCount < 2;
        },
    });
}
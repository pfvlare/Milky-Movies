import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';

interface CreateProfileData {
    name: string;
    color: string;
    userId: string;
}

interface UpdateProfileData {
    id: string;
    name?: string;
    color?: string;
}

interface ProfileLimits {
    currentProfiles: number;
    maxProfiles: number;
    canCreateMore: boolean;
    plan: string;
}

export function useCreateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProfileData) =>
            api.post('/profiles', data).then(res => res.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
            queryClient.invalidateQueries({ queryKey: ['profile-limits'] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao criar perfil:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useEditProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: UpdateProfileData) =>
            api.put(`/profiles/${id}`, data).then(res => res.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
            queryClient.invalidateQueries({ queryKey: ['profile-limits'] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao editar perfil:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useDeleteProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profileId: string) =>
            api.delete(`/profiles/${profileId}`).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
            queryClient.invalidateQueries({ queryKey: ['profile-limits'] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao excluir perfil:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useProfiles(userId: string) {
    return useQuery({
        queryKey: ['profiles', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('UserId é obrigatório');
            }

            try {
                const response = await api.get(`/profiles/user/${userId}`);
                return response.data;
            } catch (error: any) {
                console.error('❌ Erro ao buscar perfis:', {
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
                    data: error?.response?.data,
                    message: error?.message,
                    userId
                });
                throw error;
            }
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: (failureCount, error: any) => {
            // Só tenta novamente se for erro de rede, não erro 404 ou 400
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false; // Não retry para erros de cliente
            }
            return failureCount < 2; // Máximo 3 tentativas
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export function useProfileLimits(userId: string) {
    return useQuery<ProfileLimits>({
        queryKey: ['profile-limits', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('UserId é obrigatório');
            }

            try {
                const response = await api.get(`/profiles/user/${userId}/limits`);
                return response.data;
            } catch (error: any) {
                console.error('❌ Erro ao buscar limites:', {
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
                    data: error?.response?.data,
                    message: error?.message,
                    userId
                });
                throw error;
            }
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

export function useProfile(profileId: string) {
    return useQuery({
        queryKey: ['profile', profileId],
        queryFn: async () => {
            if (!profileId) {
                throw new Error('ProfileId é obrigatório');
            }

            try {
                const response = await api.get(`/profiles/${profileId}`);
                return response.data;
            } catch (error: any) {
                console.error('❌ Erro ao buscar perfil específico:', error?.response?.data || error);
                throw error;
            }
        },
        enabled: !!profileId,
    });
}
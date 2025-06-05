import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';
import Toast from 'react-native-toast-message';

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
        mutationFn: (data: CreateProfileData) => {
            console.log('🔄 Criando perfil:', data);
            return api.post('/profiles', data).then(res => res.data);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Perfil criado com sucesso:', data);
            // Invalidar queries específicas
            queryClient.invalidateQueries({ queryKey: ['profiles', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['profile-limits', variables.userId] });
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
        mutationFn: ({ id, ...data }: UpdateProfileData) => {
            console.log('✏️ Editando perfil:', { id, data });
            return api.put(`/profiles/${id}`, data).then(res => res.data);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Perfil editado com sucesso:', data);
            // Invalidar todas as queries de perfis
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === 'profiles' ||
                    query.queryKey[0] === 'profile-limits'
            });
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
        mutationFn: (profileId: string) => {
            console.log('🗑️ Excluindo perfil:', profileId);
            return api.delete(`/profiles/${profileId}`).then(res => res.data);
        },
        onSuccess: (data) => {
            console.log('✅ Perfil excluído com sucesso:', data);
            // Invalidar todas as queries de perfis
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === 'profiles' ||
                    query.queryKey[0] === 'profile-limits'
            });
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

            console.log('🔍 Buscando perfis para userId:', userId);
            try {
                const response = await api.get(`/profiles/user/${userId}`);
                console.log('✅ Perfis recebidos:', response.data);
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
        staleTime: 1000 * 60 * 2, // 2 minutos
        retry: (failureCount, error: any) => {
            // Só tenta novamente se for erro de rede, não erro 404 ou 400
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false; // Não retry para erros de cliente
            }
            return failureCount < 2; // Máximo 3 tentativas
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
}

export function useProfileLimits(userId: string) {
    return useQuery<ProfileLimits>({
        queryKey: ['profile-limits', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('UserId é obrigatório');
            }

            console.log('🔍 Buscando limites para userId:', userId);
            try {
                const response = await api.get(`/profiles/user/${userId}/limits`);
                console.log('✅ Limites recebidos:', response.data);
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
        staleTime: 1000 * 60 * 2, // 2 minutos
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

            console.log('🔍 Buscando perfil específico:', profileId);
            try {
                const response = await api.get(`/profiles/${profileId}`);
                console.log('✅ Perfil encontrado:', response.data);
                return response.data;
            } catch (error: any) {
                console.error('❌ Erro ao buscar perfil específico:', error?.response?.data || error);
                throw error;
            }
        },
        enabled: !!profileId,
    });
}

// Hook para aplicar limites quando o plano muda
export function useEnforceProfileLimits() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            console.log('🔧 Aplicando limites de perfil para usuário:', userId);
            const response = await api.post(`/profiles/user/${userId}/enforce-limits`);
            return response.data;
        },
        onSuccess: (data, userId) => {
            console.log('✅ Limites aplicados:', data);

            // Invalidar cache dos perfis
            queryClient.invalidateQueries({ queryKey: ['profiles', userId] });
            queryClient.invalidateQueries({ queryKey: ['profile-limits', userId] });

            // Mostrar notificação se perfis foram removidos
            if (data.removedProfiles && data.removedProfiles.length > 0) {
                const removedNames = data.removedProfiles.map(p => p.name).join(', ');
                Toast.show({
                    type: "info",
                    text1: "Perfis removidos",
                    text2: `${data.removedProfiles.length} perfil(s) foram removidos: ${removedNames}`
                });
            }
        },
        onError: (error: any) => {
            console.error('❌ Erro ao aplicar limites:', error);
            Toast.show({
                type: "error",
                text1: "Erro ao aplicar limites",
                text2: error?.response?.data?.message || "Tente novamente"
            });
        }
    });
}
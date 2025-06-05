import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';

export interface Card {
    id: string;
    nameCard: string;
    cardNumber: string;
    expiresDate: string;
    securityCode: string;
    userId: string;
}

export function useCreateCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => {
            console.log('🔄 Criando cartão:', data);

            // Debug detalhado
            console.log('📋 Dados detalhados:', {
                nameCard: data.nameCard,
                cardNumber: data.cardNumber,
                securityCode: data.securityCode,
                expiresDate: data.expiresDate,
                userId: data.userId,
                expiresDateType: typeof data.expiresDate,
                isValidDate: !isNaN(Date.parse(data.expiresDate)),
            });

            return api.post('/cards', data);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Cartão criado com sucesso:', data);
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['cards', variables.userId] });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao criar cartão:', error?.response?.data || error);
            console.error('📋 Headers da requisição:', error?.config?.headers);
            console.error('📋 Dados enviados:', error?.config?.data);
            throw error;
        }
    });
}

export function useEditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string;[key: string]: any }) => {
            console.log('✏️ Editando cartão:', { id, data });
            return api.put(`/cards/${id}`, data);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Cartão editado com sucesso:', data);
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            // Invalidar cartões do usuário específico se houver userId
            if (variables.userId) {
                queryClient.invalidateQueries({ queryKey: ['cards', variables.userId] });
            }
        },
        onError: (error: any) => {
            console.error('❌ Erro ao editar cartão:', error?.response?.data || error);
            throw error;
        }
    });
}

export function useCards() {
    return useQuery({
        queryKey: ['cards'],
        queryFn: () => api.get('/cards').then(res => res.data),
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

export function useCardsByUser(userId: string) {
    return useQuery<Card[]>({
        queryKey: ['cards', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('UserId é obrigatório');
            }

            console.log('🔍 Buscando cartões do usuário:', userId);
            const response = await api.get(`/cards/user/${userId}`);
            console.log('✅ Cartões encontrados:', response.data);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export function useDeleteCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cardId: string) => {
            console.log("🗑️ Deletando cartão ID:", cardId);
            return api.delete(`/cards/${cardId}`);
        },
        onSuccess: (data, cardId) => {
            console.log('✅ Cartão deletado com sucesso:', cardId);
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            // Invalidar todos os cartões de usuários
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === 'cards' && query.queryKey.length === 2
            });
        },
        onError: (error: any) => {
            console.error('❌ Erro ao deletar cartão:', error?.response?.data || error);
            throw error;
        }
    });
}

// Hook customizado para gerenciar ordem dos cartões
export function useCardOrder(userId: string) {
    const { data: cards, ...rest } = useCardsByUser(userId);

    const reorderCards = (primaryCardId: string) => {
        if (!cards) return cards;

        const primaryCard = cards.find(card => card.id === primaryCardId);
        const otherCards = cards.filter(card => card.id !== primaryCardId);

        return primaryCard ? [primaryCard, ...otherCards] : cards;
    };

    return {
        cards,
        reorderCards,
        ...rest
    };
}

// Hook para obter cartão específico
export function useCard(cardId: string) {
    return useQuery({
        queryKey: ['card', cardId],
        queryFn: async () => {
            if (!cardId) {
                throw new Error('CardId é obrigatório');
            }

            const response = await api.get(`/cards/${cardId}`);
            return response.data;
        },
        enabled: !!cardId,
    });
}
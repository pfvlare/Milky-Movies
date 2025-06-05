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

// Hook corrigido para delete - não precisa do cardId na inicialização
export function useDeleteCard() {
    return useMutation({
        mutationFn: (cardId: string) => {
            console.log("🚀 ~ useDeleteCard ~ Deletando cartão ID:", cardId);
            return api.delete(`/cards/${cardId}`);
        },
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
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useUserStore } from '../store/userStore';
import { getCardByUserId } from '../api/services/card/get';
import { formatExpiresCard } from '../utils/formatDate';
import { UserType, CardType, SubscriptionInfoType, PLAN_INFO, PlanType } from '../types';

interface UseInfoState {
    isLoading: boolean;
    error: string | null;
    hasError: boolean;
    userInfo: UserType | null;
    cards: CardType[];
}

interface UseInfoReturn extends UseInfoState {
    fetchUserInfo: () => Promise<void>;
    clearError: () => void;
    refetch: () => Promise<void>;
}

export const useInfo = (): UseInfoReturn => {
    const [state, setState] = useState<UseInfoState>({
        isLoading: false,
        error: null,
        hasError: false,
        userInfo: null,
        cards: [],
    });

    const setUser = useUserStore((state) => state.setUser);
    const setSubscription = useUserStore((state) => state.setSubscription);

    const clearError = () => {
        setState(prev => ({ ...prev, error: null, hasError: false }));
    };

    const validateUserData = (userData: any): UserType | null => {
        try {
            // Validação básica dos dados do usuário
            if (!userData?.id || !userData?.email) {
                throw new Error('Dados do usuário incompletos');
            }

            return {
                id: userData.id,
                email: userData.email,
                firstname: userData.firstname || '',
                lastname: userData.lastname || '',
                phone: userData.phone || '',
                address: userData.address || '',
                currentProfileId: userData.currentProfileId,
                profiles: userData.profiles || [],
                subscription: userData.subscription,
            };
        } catch (error) {
            console.error('❌ Erro na validação dos dados do usuário:', error);
            return null;
        }
    };

    const validateCardData = (cardData: any[]): CardType[] => {
        if (!Array.isArray(cardData)) {
            console.warn('⚠️ Dados do cartão não são um array:', cardData);
            return [];
        }

        return cardData.filter(card => {
            return card?.id && card?.cardNumber && card?.userId;
        }).map(card => ({
            id: card.id,
            nameCard: card.nameCard || '',
            cardNumber: card.cardNumber,
            expiresDate: card.expiresDate,
            securityCode: card.securityCode || '',
            userId: card.userId,
        }));
    };

    const createSubscriptionInfo = (cards: CardType[], pendingPlan?: any): SubscriptionInfoType => {
        let subscriptionInfo: SubscriptionInfoType = {
            cardNumber: '',
            expiry: '',
            planName: "Padrão",
            planPrice: "R$ --",
            isActive: false,
        };

        // Se há cartões, usar o primeiro
        if (cards.length > 0) {
            const firstCard = cards[0];
            subscriptionInfo = {
                cardNumber: firstCard.cardNumber,
                expiry: formatExpiresCard(firstCard),
                planName: PLAN_INFO[PlanType.BASIC].name, // Padrão
                planPrice: PLAN_INFO[PlanType.BASIC].price,
                isActive: true,
            };
        }

        // Se há plano pendente, sobrescrever
        if (pendingPlan?.newPlan) {
            subscriptionInfo.planName = pendingPlan.newPlan.name;
            subscriptionInfo.planPrice = pendingPlan.newPlan.price;
        }

        return subscriptionInfo;
    };

    const fetchUserInfo = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null, hasError: false }));

        try {
            console.log('🔍 Iniciando carregamento das informações do usuário...');

            // 1. Buscar usuário do AsyncStorage
            const storedUser = await AsyncStorage.getItem("@user");
            if (!storedUser) {
                throw new Error('Usuário não encontrado no storage');
            }

            const parsedUser = JSON.parse(storedUser);
            const validatedUser = validateUserData(parsedUser);

            if (!validatedUser) {
                throw new Error('Dados do usuário são inválidos');
            }

            console.log('✅ Usuário validado:', {
                id: validatedUser.id,
                email: validatedUser.email,
                hasProfiles: validatedUser.profiles?.length || 0
            });

            setUser(validatedUser);

            // 2. Buscar cartões do usuário
            let userCards: CardType[] = [];
            try {
                console.log('🔍 Buscando cartões do usuário...');
                const cardsResponse = await getCardByUserId(validatedUser.id);

                userCards = validateCardData(cardsResponse);
                console.log('✅ Cartões validados:', userCards.length);

            } catch (cardError) {
                console.error('❌ Erro ao buscar cartões:', cardError);
                // Continua sem falhar - cartão é opcional
            }

            // 3. Verificar mudanças pendentes
            let pendingChange = null;
            try {
                console.log('🔍 Verificando mudanças pendentes...');
                const pending = await AsyncStorage.getItem("@pendingChange");
                if (pending) {
                    const parsed = JSON.parse(pending);
                    if (parsed?.userId === validatedUser.id && parsed?.newPlan) {
                        pendingChange = parsed;
                        console.log('✅ Mudança pendente encontrada:', parsed.newPlan);
                        await AsyncStorage.removeItem("@pendingChange");
                    }
                }
            } catch (pendingError) {
                console.error('❌ Erro ao verificar mudanças pendentes:', pendingError);
            }

            // 4. Criar informações da assinatura
            const subscriptionInfo = createSubscriptionInfo(userCards, pendingChange);
            setSubscription(subscriptionInfo);

            // 5. Mostrar alerta se houver mudança de plano
            if (pendingChange?.newPlan) {
                Alert.alert(
                    "Plano Atualizado",
                    `Você agora está no plano ${pendingChange.newPlan.name}`
                );
            }

            // 6. Atualizar estado final
            setState(prev => ({
                ...prev,
                isLoading: false,
                userInfo: validatedUser,
                cards: userCards,
            }));

            console.log('✅ Carregamento das informações concluído com sucesso');

        } catch (error) {
            console.error('❌ Erro geral ao buscar informações:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar informações';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
                hasError: true,
                userInfo: null,
                cards: [],
            }));
        }
    };

    const refetch = async () => {
        await fetchUserInfo();
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return {
        ...state,
        fetchUserInfo,
        clearError,
        refetch,
    };
};
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "../store/userStore";
import { theme } from "../theme";
import { useSubscriptionByUserId, useUpdateSubscription } from "../hooks/useSubscription";
import { useQueryClient } from '@tanstack/react-query';

const plans = [
    {
        id: "basic",
        name: "Básico",
        price: 18.90,
        code: "basic", // Corresponde ao enum do backend
        details: ["1 dispositivo por vez", "Qualidade SD (480p)", "Com anúncios"],
    },
    {
        id: "intermediary",
        name: "Padrão",
        price: 39.90,
        code: "intermediary", // Corresponde ao enum do backend
        details: ["2 dispositivos ao mesmo tempo", "Qualidade HD (720p)", "Sem anúncios"],
    },
    {
        id: "complete",
        name: "Premium",
        price: 55.90,
        code: "complete", // Corresponde ao enum do backend
        details: ["4 dispositivos ao mesmo tempo", "Qualidade Ultra HD (4K)", "Sem anúncios"],
    },
];

export default function ChangePlanScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const user = useUserStore((state) => state.user);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    // Hooks para buscar e atualizar subscription
    const { data: subscription, error: subscriptionError } = useSubscriptionByUserId(user?.id);
    const updateSubscriptionMutation = useUpdateSubscription(user?.id);

    // Função para mapear o plano da API para o plano local
    const mapApiPlanToLocal = (apiPlan: string) => {
        // O backend retorna exatamente os valores do enum
        const planMap = {
            'basic': 'basic',
            'intermediary': 'intermediary',
            'complete': 'complete'
        };
        return planMap[apiPlan] || 'basic';
    };

    useEffect(() => {
        if (subscription) {
            // Mapear o plano atual da subscription para selecionar o correto
            const currentPlanCode = mapApiPlanToLocal(subscription.plan);
            const found = plans.find((p) => p.code === currentPlanCode);
            if (found) {
                setSelectedPlan(found);
            }
        }
    }, [subscription]);

    const handleContinue = async () => {
        if (!selectedPlan || !user?.id || !subscription) {
            Alert.alert("Erro", "Dados insuficientes para alterar o plano.");
            return;
        }

        // Verificar se é o mesmo plano atual
        const currentPlanCode = mapApiPlanToLocal(subscription.plan);
        if (selectedPlan.code === currentPlanCode) {
            Alert.alert("Aviso", "Este já é o seu plano atual.");
            return;
        }

        try {
            setIsLoading(true);

            // Preparar dados para atualização - usando os valores exatos do enum
            const updateData = {
                plan: selectedPlan.code, // basic | intermediary | complete
                value: selectedPlan.price,
            };

            const response = await updateSubscriptionMutation.mutateAsync(updateData);

            await queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
            await queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

            Alert.alert(
                "Sucesso!",
                `Plano alterado para ${selectedPlan.name} com sucesso!`,
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );

        } catch (error) {
            console.error("🚀 ~ Erro completo:", error);
            console.error("🚀 ~ Erro response:", error.response);
            console.error("🚀 ~ Erro response data:", error.response?.data);
            console.error("🚀 ~ Erro response status:", error.response?.status);

            let errorMessage = "Não foi possível alterar o plano. Tente novamente.";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.status === 500) {
                errorMessage = "Erro interno do servidor. Verifique os dados e tente novamente.";
            }

            Alert.alert("Erro", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentPlanCode = () => {
        if (!subscription) return null;
        return mapApiPlanToLocal(subscription.plan);
    };

    const isSamePlan = selectedPlan?.code === getCurrentPlanCode();

    if (subscriptionError) {
        console.error("🚀 ~ Erro ao buscar subscription:", subscriptionError);
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#EC4899" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.innerWrapper}>
                    <View style={styles.header}>
                        <Text style={styles.mainTitle}>
                            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
                            <Text style={{ color: theme.text }}>M</Text>ovies
                        </Text>
                        <Text style={styles.subtitle}>Escolha Um Novo Plano</Text>
                        {subscription && (
                            <Text style={styles.currentPlan}>
                                Plano atual: {plans.find(p => p.code === getCurrentPlanCode())?.name || 'Não identificado'}
                            </Text>
                        )}
                    </View>


                    {plans.map((plan) => {
                        const isCurrentPlan = plan.code === getCurrentPlanCode();
                        const isSelected = selectedPlan?.id === plan.id;

                        return (
                            <TouchableOpacity
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    isSelected ? styles.selected : styles.unselected,
                                    isCurrentPlan && styles.currentPlanCard,
                                ]}
                                onPress={() => setSelectedPlan(plan)}
                            >
                                <View style={styles.planHeader}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    {isCurrentPlan && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>ATUAL</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.planPrice}>
                                    R$ {plan.price.toFixed(2).replace('.', ',')}/mês
                                </Text>
                                {plan.details.map((detail, index) => (
                                    <Text key={index} style={styles.detailItem}>• {detail}</Text>
                                ))}
                            </TouchableOpacity>
                        );
                    })}

                    <LinearGradient
                        colors={["#EC4899", "#D946EF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.continueButton,
                            (!selectedPlan || isSamePlan || isLoading) && { opacity: 0.5 },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={handleContinue}
                            disabled={!selectedPlan || isSamePlan || isLoading}
                            style={styles.buttonTouchable}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading
                                    ? "Alterando..."
                                    : isSamePlan
                                        ? "Plano Atual Selecionado"
                                        : "Alterar Plano"
                                }
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    {selectedPlan && !isSamePlan && (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Resumo da Alteração</Text>
                            <Text style={styles.summaryText}>
                                Plano atual: {plans.find(p => p.code === getCurrentPlanCode())?.name}
                            </Text>
                            <Text style={styles.summaryText}>
                                Novo plano: {selectedPlan.name}
                            </Text>
                            <Text style={styles.summaryPrice}>
                                Novo valor: R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/mês
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 16,
        zIndex: 10,
    },
    innerWrapper: {
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 24,
    },
    mainTitle: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 4,
    },
    subtitle: {
        color: "#6B7280",
        fontSize: 18,
        marginBottom: 8,
    },
    currentPlan: {
        color: "#EC4899",
        fontSize: 16,
        fontWeight: "500",
    },
    debugInfo: {
        backgroundColor: "#374151",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    debugText: {
        color: "#F3F4F6",
        fontSize: 12,
        fontFamily: "monospace",
    },
    planCard: {
        backgroundColor: "#1F2937",
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 2,
    },
    selected: {
        borderColor: theme.text,
    },
    unselected: {
        borderColor: "#374151",
    },
    currentPlanCard: {
        backgroundColor: "#1E293B",
    },
    planHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    planName: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    currentBadge: {
        backgroundColor: "#EC4899",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    currentBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    planPrice: {
        color: "#9CA3AF",
        fontSize: 16,
        marginTop: 4,
        marginBottom: 8,
    },
    detailItem: {
        color: "#9CA3AF",
        fontSize: 14,
        marginBottom: 2,
    },
    continueButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    buttonTouchable: {
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
    summaryCard: {
        backgroundColor: "#1F2937",
        padding: 16,
        borderRadius: 12,
        marginBottom: 40,
        borderLeftWidth: 4,
        borderLeftColor: "#EC4899",
    },
    summaryTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    summaryText: {
        color: "#9CA3AF",
        fontSize: 14,
        marginBottom: 4,
    },
    summaryPrice: {
        color: "#EC4899",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
});
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { theme } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ChoosePlan">;

interface RouteParams {
    userId?: string;
    fromCancellation?: boolean;
}

const plans = [
    {
        id: "basic",
        name: "Plano Básico",
        price: "18.90",
        code: "basic",
        details: ["1 dispositivo por vez", "Qualidade SD (480p)", "Com anúncios"],
        maxProfiles: 1,
    },
    {
        id: "intermediary",
        name: "Plano Padrão",
        price: "39.90",
        code: "intermediary",
        details: ["2 dispositivos ao mesmo tempo", "Qualidade HD (720p)", "Sem anúncios"],
        maxProfiles: 2,
    },
    {
        id: "complete",
        name: "Plano Premium",
        price: "55.90",
        code: "complete",
        details: ["4 dispositivos ao mesmo tempo", "Qualidade Ultra HD (4K)", "Sem anúncios"],
        maxProfiles: 4,
    },
];

export default function ChoosePlanScreen({ route }: { route: { params?: RouteParams } }) {
    const navigation = useNavigation<NavigationProp>();
    const { userId, fromCancellation } = route?.params || {};

    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

    console.log('🔍 ChoosePlanScreen params:', { userId, fromCancellation });

    const handleContinue = async () => {
        if (!selectedPlan) {
            Toast.show({
                type: "error",
                text1: "Selecione um plano",
                text2: "Escolha um dos planos disponíveis"
            });
            return;
        }

        // Se há userId, significa que é para atualizar uma assinatura existente
        if (userId) {
            console.log('🔄 Navegando para Subscription com userId:', userId);
            navigation.navigate("Subscription", {
                selectedPlan,
                userId,
                isUpdate: true
            });
            return;
        }

        // Se não há userId, é um novo registro
        console.log('🆕 Navegando para Register com plano:', selectedPlan);
        navigation.navigate("Register", {
            selectedPlan: {
                name: selectedPlan.name,
                code: selectedPlan.code,
                price: selectedPlan.price,
            },
        });
    };

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else if (userId) {
            // Se tem userId, provavelmente veio do perfil
            navigation.navigate("Profile");
        } else {
            // Se não tem userId, ir para splash
            navigation.navigate("Splash");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Ionicons name="arrow-back" size={24} color="#EC4899" />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <Text style={styles.mainTitle}>
                            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
                            <Text style={{ color: theme.text }}>M</Text>ovies
                        </Text>
                        <Text style={styles.subtitle}>
                            {userId ? "Escolha seu Novo Plano" : "Escolha Seu Plano"}
                        </Text>
                        {fromCancellation && (
                            <Text style={styles.cancelationMessage}>
                                Sua assinatura anterior foi cancelada.{'\n'}
                                Selecione um novo plano para continuar assistindo.
                            </Text>
                        )}
                    </View>

                    {plans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                selectedPlan?.id === plan.id ? styles.selected : styles.unselected,
                            ]}
                            onPress={() => setSelectedPlan(plan)}
                        >
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>{plan.name}</Text>
                                {selectedPlan?.id === plan.id && (
                                    <View style={styles.selectedBadge}>
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>

                            <Text style={styles.planPrice}>R$ {plan.price}/mês</Text>

                            <View style={styles.featuresContainer}>
                                {plan.details.map((detail, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                        <Text style={styles.detailItem}>{detail}</Text>
                                    </View>
                                ))}
                                <View style={styles.featureItem}>
                                    <Ionicons name="person-circle" size={16} color="#10B981" />
                                    <Text style={styles.detailItem}>
                                        {plan.maxProfiles} perfil{plan.maxProfiles > 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!selectedPlan}
                        style={[styles.continueButtonContainer, !selectedPlan && { opacity: 0.5 }]}
                    >
                        <LinearGradient
                            colors={selectedPlan ? ["#EC4899", "#D946EF"] : ["#6B7280", "#6B7280"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.continueButton}
                        >
                            <Text style={styles.buttonText}>
                                {userId ? "Atualizar Assinatura" : "Continuar"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
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
        top: Platform.OS === "ios" ? 50 : 20,
        left: 16,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        padding: 8,
    },
    scroll: {
        paddingTop: 80,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    mainTitle: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        color: "#F3F4F6",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    cancelationMessage: {
        color: "#F59E0B",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.3)",
    },
    planCard: {
        backgroundColor: "#1F2937",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
    },
    selected: {
        borderColor: theme.text,
        backgroundColor: "#1F2937",
        transform: [{ scale: 1.02 }],
    },
    unselected: {
        borderColor: "#374151",
    },
    planHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    planName: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    selectedBadge: {
        backgroundColor: theme.text,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    planPrice: {
        color: "#EC4899",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    featuresContainer: {
        gap: 8,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailItem: {
        color: "#D1D5DB",
        fontSize: 14,
        flex: 1,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === "ios" ? 30 : 20,
        backgroundColor: theme.background,
    },
    continueButtonContainer: {
        borderRadius: 12,
    },
    continueButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
});
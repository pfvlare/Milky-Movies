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
import * as themeConfig from "../theme";
import { Plan, RootStackParamList } from "../Navigation/Navigation";

const theme = themeConfig.theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ChoosePlan">;

const plans: (Plan & { details: string[] })[] = [
    {
        id: "basic",
        name: "Plano Básico",
        price: "18,90",
        details: [
            "1 dispositivo por vez",
            "Qualidade SD (480p)",
            "Com anúncios",
        ],
    },
    {
        id: "standard",
        name: "Plano Padrão",
        price: "39,90",
        details: [
            "2 dispositivos ao mesmo tempo",
            "Qualidade HD (720p)",
            "Sem anúncios",
        ],
    },
    {
        id: "premium",
        name: "Plano Premium",
        price: "55,90",
        details: [
            "4 dispositivos ao mesmo tempo",
            "Qualidade Ultra HD (4K)",
            "Sem anúncios",
        ],
    },
];

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
    planName: {
        color: "white",
        fontSize: 20,
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
        backgroundColor: theme.text,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
        opacity: 1,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
});

export default function ChoosePlanScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handleContinue = () => {
        if (!selectedPlan) return;
        navigation.navigate("Register", { selectedPlan });
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        navigation.navigate("Splash");
                    }
                }}
            >
                <Ionicons name="arrow-back" size={24} color="#EC4899" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.innerWrapper}>
                    <View style={styles.header}>
                        <Text style={styles.mainTitle}>
                            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
                            <Text style={{ color: theme.text }}>M</Text>ovies
                        </Text>
                        <Text style={styles.subtitle}>Escolha seu plano</Text>
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
                            <Text style={styles.planName}>{plan.name}</Text>
                            <Text style={styles.planPrice}>{`R$ ${plan.price}/mês`}</Text>
                            {plan.details.map((detail, idx) => (
                                <Text key={idx} style={styles.detailItem}>
                                    • {detail}
                                </Text>
                            ))}
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            !selectedPlan && styles.disabledButton,
                        ]}
                        onPress={handleContinue}
                        disabled={!selectedPlan}
                    >
                        <Text style={styles.buttonText}>Continuar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

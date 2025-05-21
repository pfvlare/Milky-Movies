import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "../store/userStore";
import { theme } from "../theme";

const plans = [
    {
        id: "basic",
        name: "Plano Básico",
        price: "18.90",
        code: "basic",
        details: ["1 dispositivo por vez", "Qualidade SD (480p)", "Com anúncios"],
    },
    {
        id: "intermediary",
        name: "Plano Padrão",
        price: "39.90",
        code: "intermediary",
        details: ["2 dispositivos ao mesmo tempo", "Qualidade HD (720p)", "Sem anúncios"],
    },
    {
        id: "complete",
        name: "Plano Premium",
        price: "55.90",
        code: "complete",
        details: ["4 dispositivos ao mesmo tempo", "Qualidade Ultra HD (4K)", "Sem anúncios"],
    },
];

export default function ChangePlanScreen() {
    const navigation = useNavigation();
    const user = useUserStore((state) => state.user);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const currentName = user?.subscription?.planName;
        const found = plans.find((p) => p.name === currentName);
        if (found) setSelectedPlan(found);
    }, [user]);

    const handleContinue = async () => {
        if (!selectedPlan || !user?.id) return;

        const newPlan = {
            name: selectedPlan.name,
            price: `R$ ${selectedPlan.price}`,
            code: selectedPlan.code,
        };

        await AsyncStorage.setItem(
            "@pendingChange",
            JSON.stringify({ userId: user.id, newPlan })
        );

        navigation.goBack();
    };

    const isSamePlan = selectedPlan?.name === user?.subscription?.planName;

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
                            <Text style={styles.planPrice}>R$ {plan.price}/mês</Text>
                            {plan.details.map((detail, index) => (
                                <Text key={index} style={styles.detailItem}>• {detail}</Text>
                            ))}
                        </TouchableOpacity>
                    ))}

                    <LinearGradient
                        colors={["#EC4899", "#D946EF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.continueButton,
                            (!selectedPlan || isSamePlan) && { opacity: 0.5 },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={handleContinue}
                            disabled={!selectedPlan || isSamePlan}
                        >
                            <Text style={styles.buttonText}>
                                {isSamePlan ? "Plano Atual Selecionado" : "Continuar"}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
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
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
});

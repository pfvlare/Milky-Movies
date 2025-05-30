import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    Platform,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as themeConfig from "../theme";

const theme = themeConfig.theme;

export default function ConfirmCardScreen() {
    const navigation = useNavigation();

    const handleUseCurrentCard = async () => {
        try {
            const userData = await AsyncStorage.getItem("@user");
            const user = userData ? JSON.parse(userData) : null;
            const newPlanData = await AsyncStorage.getItem("@newPlan");
            const newPlan = newPlanData ? JSON.parse(newPlanData) : null;

            if (!user?.id || !newPlan?.id) {
                Alert.alert("Erro", "Dados de usuário ou plano ausentes.");
                return;
            }

            await AsyncStorage.setItem(
                "@pendingChange",
                JSON.stringify({ userId: user.id, newPlan })
            );

            navigation.navigate("Profile");
        } catch (err) {
            console.error("Erro ao confirmar troca de plano:", err);
            Alert.alert("Erro", "Não foi possível aplicar a troca de plano.");
        }
    };

    const handleRegisterNewCard = async () => {
        try {
            const userData = await AsyncStorage.getItem("@user");
            const user = userData ? JSON.parse(userData) : null;

            if (!user?.id) {
                Alert.alert("Erro", "Usuário não identificado.");
                return;
            }

            navigation.navigate("Subscription", { userId: user.id });
        } catch (err) {
            console.error("Erro ao redirecionar para cadastro de cartão:", err);
            Alert.alert("Erro", "Ocorreu um problema ao continuar.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.mainTitle}>
                Deseja continuar com o mesmo cartão?
            </Text>

            <LinearGradient
                colors={["#EC4899", "#D946EF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
            >
                <TouchableOpacity onPress={handleUseCurrentCard}>
                    <Text style={styles.buttonText}>Sim, manter cartão atual</Text>
                </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
                colors={["#EC4899", "#D946EF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
            >
                <TouchableOpacity onPress={handleRegisterNewCard}>
                    <Text style={styles.buttonText}>Não, cadastrar novo cartão</Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingHorizontal: 24,
        justifyContent: "center",
    },
    mainTitle: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
        textAlign: "center",
    },
    gradientButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 16,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
});

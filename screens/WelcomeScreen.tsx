import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../Navigation/Navigation";
import { theme } from "../theme";
import { useUserStore } from "../store/userStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export default function WelcomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const setUser = useUserStore((state) => state.setUser);
    const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);

    useEffect(() => {
        const checkSession = async () => {
            const stored = await AsyncStorage.getItem("@user");

            if (!stored) return; // Usuário não logado → permanece na tela Welcome

            const parsedUser = JSON.parse(stored);
            if (!parsedUser?.id) return;

            setUser(parsedUser);
            if (parsedUser.currentProfileId) {
                setCurrentProfile(parsedUser.currentProfileId);
            }

            // Redireciona direto para escolha de perfil
            navigation.reset({ index: 0, routes: [{ name: "ChooseProfile" }] });
        };

        checkSession();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require("../assets/images/MovieTime.png")}
                    style={styles.logo}
                />

                <Text style={styles.title}>
                    Bem-vindo ao <Text style={{ color: theme.text }}>M</Text>ilky{" "}
                    <Text style={{ color: theme.text }}>M</Text>ovies
                </Text>

                <Text style={styles.subtitle}>
                    Descubra os melhores filmes, sem anúncios e com acesso em
                    múltiplos dispositivos.
                </Text>

                <LinearGradient
                    colors={["#EC4899", "#D946EF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                >
                    <TouchableOpacity onPress={() => navigation.navigate("ChoosePlan")}>
                        <Text style={styles.buttonText}>Quero me cadastrar</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.secondaryText}>
                        Já tem conta? <Text style={styles.link}>Entrar</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingHorizontal: 24,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 20,
    },
    title: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    gradientButton: {
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 32,
        alignItems: "center",
        marginBottom: 16,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonSecondary: {
        marginTop: 10,
    },
    secondaryText: {
        color: "#9CA3AF",
        fontSize: 16,
    },
    link: {
        color: theme.text,
        fontWeight: "bold",
    },
});

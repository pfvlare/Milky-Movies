import React from "react";
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
import { RootStackParamList } from "../Navigation/Navigation";
import { theme } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export default function WelcomeScreen() {
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require("../assets/images/MovieTime.png")}
                    style={styles.logo}
                />

                <Text style={styles.title}>
                    Bem-vindo ao{" "}
                    <Text style={styles.highlight}>Milky Movies</Text>
                </Text>

                <Text style={styles.subtitle}>
                    Descubra os melhores filmes e séries, sem anúncios e com acesso em
                    múltiplos dispositivos.
                </Text>

                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => navigation.navigate("ChoosePlan")}
                >
                    <Text style={styles.buttonText}>Quero me cadastrar</Text>
                </TouchableOpacity>

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
    highlight: {
        color: theme.text,
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    buttonPrimary: {
        backgroundColor: theme.text,
        paddingVertical: 14,
        borderRadius: 10,
        paddingHorizontal: 32,
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

import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StyleSheet,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/Navigation";
import * as themeConfig from "../theme";

const theme = themeConfig.theme;

type NavigationProp = StackNavigationProp<RootStackParamList, "Welcome">;

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
                    <Text style={styles.pink}>M</Text>ilky{" "}
                    <Text style={styles.pink}>M</Text>ovies
                </Text>

                <Text style={styles.subtitle}>
                    Filmes, séries e muito mais. Sem limites.
                </Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate("ChoosePlan")}
                >
                    <Text style={styles.buttonText}>Criar Conta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.secondaryButtonText}>Já tenho uma conta</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    logo: {
        width: 140,
        height: 140,
        resizeMode: "contain",
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    pink: {
        color: theme.text,
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 32,
    },
    primaryButton: {
        backgroundColor: theme.text,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginBottom: 16,
    },
    secondaryButton: {
        paddingVertical: 14,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    secondaryButtonText: {
        color: "#9CA3AF",
        fontSize: 16,
    },
});

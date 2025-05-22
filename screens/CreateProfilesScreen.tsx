import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
    Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { useUserStore } from "../store/userStore";

const profileColors = [
    "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"
];

type RouteProps = RouteProp<RootStackParamList, "CreateProfiles">;

export default function CreateProfilesScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProps>();
    const { maxProfiles } = route.params;

    const [profileNames, setProfileNames] = useState<string[]>(Array(maxProfiles).fill(""));
    const setUser = useUserStore((state) => state.setUser);
    const user = useUserStore((state) => state.user);

    const handleProfileChange = (text: string, index: number) => {
        const updated = [...profileNames];
        updated[index] = text;
        setProfileNames(updated);
    };

    const handleContinue = () => {
        const usedColors: string[] = [];
        const validProfiles = profileNames
            .map((name, index) => {
                if (!name.trim()) return null;

                // Escolher uma cor aleatória não usada ainda
                const availableColors = profileColors.filter((c) => !usedColors.includes(c));
                const color = availableColors.length > 0
                    ? availableColors[Math.floor(Math.random() * availableColors.length)]
                    : profileColors[Math.floor(Math.random() * profileColors.length)];

                usedColors.push(color);

                return {
                    id: `${user?.id || "u"}-p${Date.now()}-${index}`,
                    name: name.trim(),
                    color,
                };
            })
            .filter(Boolean);

        if (validProfiles.length === 0) {
            Alert.alert("Erro", "Crie pelo menos um perfil.");
            return;
        }

        const updatedUser = {
            ...user,
            profiles: validProfiles,
            currentProfileId: validProfiles[0].id,
        };

        setUser(updatedUser);
        navigation.reset({ index: 0, routes: [{ name: "ChooseProfile" }] });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Quem Vai Assistir?</Text>
                <Text style={styles.subtitle}>Crie até {maxProfiles} perfis para sua conta</Text>

                {profileNames.map((name, index) => (
                    <TextInput
                        key={index}
                        placeholder={`Nome do perfil ${index + 1}`}
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        value={name}
                        onChangeText={(text) => handleProfileChange(text, index)}
                    />
                ))}

                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>Continuar</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 32,
        textAlign: "center",
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 32,
    },
    input: {
        backgroundColor: "#1F2937",
        borderRadius: 10,
        padding: 16,
        color: "#fff",
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#EC4899",
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

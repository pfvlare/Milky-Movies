import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as themeConfig from "../theme";
import { useUserStore } from "../store/userStore";
import { getCardByUserId } from "../api/services/card/get";
import { RootStackParamList } from "../Navigation/Navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatExpiresCard } from "../utils/formatDate";

const theme = themeConfig.theme;

type NavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  innerWrapper: {
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
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
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoText: {
    color: "#D1D5DB",
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusActive: {
    color: "#10B981",
    fontWeight: "bold",
  },
  statusInactive: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.text,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: "#4B5563",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  loadingText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const setSubscription = useUserStore((state) => state.setSubscription);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id) {
            setUser(parsedUser);

            const card = await getCardByUserId(parsedUser.id);

            setSubscription({
              cardNumber: card.cardNumber,
              expiry: formatExpiresCard(card),
              planName: card.planName || "Padrão",
              planPrice: card.planPrice || "R$ --",
              isActive: card.isActive ?? true,
            });

            const pending = await AsyncStorage.getItem("@pendingChange");

            if (pending) {
              const parsed = JSON.parse(pending);

              if (parsed?.userId === parsedUser.id && parsed?.newPlan) {
                setSubscription((prev) => ({
                  ...prev,
                  planName: parsed.newPlan.name,
                  planPrice: parsed.newPlan.price,
                }));

                await AsyncStorage.removeItem("@pendingChange");

                Alert.alert("Plano Atualizado", `Você agora está no plano ${parsed.newPlan.name}`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    fetchInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@isLoggedIn");
    clearUser();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const handleCancelSubscription = () => {
    Alert.alert("Assinatura", "Assinatura cancelada com sucesso (modo demonstração).");
  };

  const handleUpdateCard = () => {
    if (user?.id) {
      navigation.navigate("Subscription", { userId: user.id });
    }
  };

  const maskCard = (number?: string) =>
    number ? `**** **** **** ${number.slice(-4)}` : "Não informado";

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate("Home")
        }
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
            <Text style={styles.subtitle}>Perfil</Text>
          </View>

          {user?.id ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nome:</Text>
                  <Text style={styles.infoText}>
                    {user.firstname || "Não informado"} {user.lastname || ""}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoText}>{user.email || "Não informado"}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Endereço:</Text>
                  <Text style={styles.infoText}>{user.address || "Não informado"}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Telefone:</Text>
                  <Text style={styles.infoText}>{user.phone || "Não informado"}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cartão de Pagamento</Text>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Número:</Text>
                  <Text style={styles.infoText}>
                    {maskCard(user.subscription?.cardNumber)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Validade:</Text>
                  <Text style={styles.infoText}>
                    {user.subscription?.expiry || "Não informado"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleUpdateCard}>
                  <Text style={styles.buttonText}>Alterar forma de pagamento</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assinatura</Text>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Plano:</Text>
                  <Text style={styles.infoText}>
                    {user.subscription?.planName || "Não informado"} -{" "}
                    {user.subscription?.planPrice || "R$ --"}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text
                    style={
                      user.subscription?.isActive
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    {user.subscription?.isActive ? "Ativa" : "Inativa"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("ChangePlan")}
                >
                  <Text style={styles.buttonText}>Trocar Plano de Assinatura</Text>
                </TouchableOpacity>
                {user.subscription?.isActive ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelSubscription}
                  >
                    <Text style={styles.buttonText}>Cancelar Assinatura</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.button} onPress={handleUpdateCard}>
                    <Text style={styles.buttonText}>Renovar Plano</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ padding: 24 }}>
              <Text style={styles.loadingText}>Nenhum usuário logado.</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Voltar ao início</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

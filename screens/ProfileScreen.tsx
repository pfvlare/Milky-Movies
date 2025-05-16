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
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

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
    backgroundColor: "#111827",
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
  avatar: {
    backgroundColor: "#EC4899",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  mainTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  subtitle: {
    color: "#EC4899",
    fontSize: 18,
    marginTop: 4,
  },
  section: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 2,
  },
  infoText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "500",
  },
  gradientButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#B91C1C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: "#374151",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    color: "#F3F4F6",
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
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Alert.alert("Assinatura", "Assinatura cancelada com sucesso (modo demonstração).");
  };

  const handleUpdateCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (user?.id) {
      navigation.navigate("Subscription", { userId: user.id });
    }
  };

  const getInitials = () => {
    if (!user?.firstname) return "U";
    return (
      user.firstname.charAt(0).toUpperCase() +
      (user.lastname ? user.lastname.charAt(0).toUpperCase() : "")
    );
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
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={styles.mainTitle}>
              <Text style={{ color: theme.text }}>M</Text>ilky{" "}
              <Text style={{ color: theme.text }}>M</Text>ovies
            </Text>
            <Text style={styles.subtitle}>Perfil</Text>
          </View>

          {user?.id ? (
            <>
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                  <TouchableOpacity
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      navigation.navigate("Register", { userToEdit: user });
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#EC4899" />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nome</Text>
                  <Text style={styles.infoText}>
                    {user.firstname || "Não informado"} {user.lastname || ""}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoText}>{user.email || "Não informado"}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Endereço</Text>
                  <Text style={styles.infoText}>{user.address || "Não informado"}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoText}>{user.phone || "Não informado"}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cartão de Pagamento</Text>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Número</Text>
                  <Text style={styles.infoText}>
                    {maskCard(user.subscription?.cardNumber)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Validade</Text>
                  <Text style={styles.infoText}>
                    {user.subscription?.expiry || "Não informado"}
                  </Text>
                </View>

                <TouchableOpacity onPress={handleUpdateCard}>
                  <LinearGradient
                    colors={["#EC4899", "#D946EF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Alterar forma de pagamento</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assinatura</Text>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Plano</Text>
                  <Text style={styles.infoText}>
                    {user.subscription?.planName || "Não informado"} -{" "}
                    {user.subscription?.planPrice || "R$ --"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text
                    style={{
                      color: user.subscription?.isActive ? "#10B981" : "#EF4444",
                      fontWeight: "bold",
                    }}
                  >
                    {user.subscription?.isActive ? "Ativa" : "Inativa"}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate("ChangePlan")}>
                  <LinearGradient
                    colors={["#EC4899", "#D946EF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Trocar Plano de Assinatura</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {user.subscription?.isActive ? (
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
                    <Text style={styles.buttonText}>Cancelar Assinatura</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleUpdateCard}>
                    <LinearGradient
                      colors={["#EC4899", "#D946EF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Renovar Plano</Text>
                    </LinearGradient>
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
                style={[styles.gradientButton, { marginTop: 20 }]}
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

import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as themeConfig from "../theme";
const theme = themeConfig.theme;

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
    marginTop: 40,
  },
});

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("@user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };

    const unsubscribe = navigation.addListener("focus", loadUser);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@isLoggedIn");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Assinatura",
      "Assinatura cancelada com sucesso (modo demonstração)."
    );
  };

  const handleUpdateCard = () => {
    navigation.navigate("Subscription");
  };

  const maskCard = (number) =>
    number ? `**** **** **** ${number.slice(-4)}` : "Não informado";

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
            <Text style={styles.subtitle}>Perfil</Text>
          </View>

          {user ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nome:</Text>
                  <Text style={styles.infoText}>
                    {user.firstName} {user.lastName}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoText}>{user.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Endereço:</Text>
                  <Text style={styles.infoText}>{user.address}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Telefone:</Text>
                  <Text style={styles.infoText}>{user.phone}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cartão de Pagamento</Text>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Número:</Text>
                  <Text style={styles.infoText}>
                    {maskCard(user?.subscription?.cardNumber)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Validade:</Text>
                  <Text style={styles.infoText}>
                    {user?.subscription?.expiry || "Não informado"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleUpdateCard}>
                  <Text style={styles.buttonText}>Alterar forma de pagamento</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assinatura</Text>
                <Text style={styles.subtitle}>Status: Ativa</Text>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelSubscription}
                >
                  <Text style={styles.buttonText}>Cancelar Assinatura</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

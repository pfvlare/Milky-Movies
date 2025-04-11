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
  header: {
    alignItems: "center",
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
  userInfoContainer: {
    marginBottom: 24,
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
  subscriptionContainer: {
    marginBottom: 24,
  },
  subscriptionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subscriptionStatus: {
    color: "#6B7280",
    fontSize: 16,
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
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 16 : 8,
    left: 16,
    zIndex: 10,
    padding: 8,
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
  const [showMenu, setShowMenu] = useState(false);

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

  const handleMenu = () => {
    // Aqui você pode abrir o menu lateral ou um modal futuro
    console.log("Menu pressionado");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={28} color="white" />
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
            <View style={styles.userInfoContainer}>
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
          ) : (
            <Text style={styles.loadingText}>
              Carregando dados do usuário...
            </Text>
          )}

          {user && (
            <View style={styles.subscriptionContainer}>
              <Text style={styles.subscriptionTitle}>Assinatura</Text>
              <Text style={styles.subscriptionStatus}>Status: Ativa</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.buttonText}>Cancelar Assinatura</Text>
              </TouchableOpacity>
            </View>
          )}

          {user && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Sair</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
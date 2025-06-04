import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import AppLayout from "../components/AppLayout";
import { useLogin } from "../hooks/useAuth";
import { LoginType, LoginSchema } from "../schemas/login";
import { useUserStore } from "../store/userStore";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { theme } from "../theme";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({ resolver: zodResolver(LoginSchema) });

  const [showPassword, setShowPassword] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const login = useLogin();

  const onSubmit = async (data: LoginType) => {
    try {
      const response = await login.mutateAsync(data);
      console.log("🚀 ~ onSubmit ~ response:", response);

      const { token, user } = response;

      if (user?.id && token) {
        setUser(user);
        await AsyncStorage.setItem("@token", token);

        if (user.isSubscribed) {
          navigation.replace("Home");
        } else {
          navigation.replace("ChoosePlan", { userId: user.id } as any);
        }
      }

    } catch (err: any) {
      Toast.show({ type: "error", text1: err?.message || "Falha no login" });
      console.error("❌ Erro ao logar:", err);
    }
  };

  return (
    <AppLayout>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: "#EC4899" }}>M</Text>ilky{" "}
            <Text style={{ color: "#EC4899" }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>Login</Text>
        </View>

        {login.isPending ? (
          <ActivityIndicator size="large" color="#EC4899" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#6B7280"
                    style={styles.input}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Senha */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Senha (6 dígitos)"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    onChangeText={onChange}
                    value={value}
                    maxLength={6}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* Botão Entrar com degradê */}
            <LinearGradient
              colors={["#EC4899", "#D946EF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => navigation.replace("ChoosePlan")}>
              <Text style={styles.registerText}>
                Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace("Splash")}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancelar e voltar</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: "#374151",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
  },
  input: {
    color: "white",
    paddingVertical: 12,
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: "#F44336",
    marginBottom: 8,
    marginHorizontal: 18,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 18,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  registerLink: {
    color: "#EC4899",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 24,
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 14,
    color: "#4B5563",
    textDecorationLine: "underline",
  },
});

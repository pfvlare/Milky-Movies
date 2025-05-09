import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  StackNavigationProp,
} from "@react-navigation/native-stack";

import AppLayout from "../components/AppLayout";
import { loginUser } from "../api/services/user/login";
import { LoginType, LoginSchema } from "../schemas/login";
import { useUserStore } from "../store/userStore";
import { RootStackParamList } from "../Navigation/Navigation";

type NavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    paddingHorizontal: 24,
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
  },
  inputContainer: {
    backgroundColor: "#374151",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
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
  },
  loginButton: {
    backgroundColor: "#EC4899",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
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

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginType) => {
    try {
      const user = await loginUser({
        email: data.email,
        password: data.password,
      });

      if (user?.id) {
        // salva no store global
        useUserStore.getState().setUser(user);

        // Se já assinou → Home; senão → Subscription (cartão)
        if (user.isSubscribed) {
          navigation.replace("Home");
        } else {
          navigation.replace("Subscription", { userId: user.id });
        }
      } else {
        // Caso o backend não retorne usuário válido, redireciona ao fluxo de planos
        navigation.replace("ChoosePlan");
      }
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Falha no login");
      console.error("❌ Erro ao logar:", err);
    }
  };

  return (
    <AppLayout>
      <SafeAreaView style={styles.container}>
        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: "#EC4899" }}>M</Text>ilky{" "}
            <Text style={{ color: "#EC4899" }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>Login</Text>
        </View>

        {/* Formulário */}
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
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
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

        {/* Botão Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Link para cadastro (volta para tela de planos) */}
        <TouchableOpacity onPress={() => navigation.replace("ChoosePlan")}>
          <Text style={styles.registerText}>
            Não tem conta?{" "}
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>

        {/* Cancelar */}
        <TouchableOpacity
          onPress={() => navigation.replace("Splash")}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancelar e voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </AppLayout>
  );
}

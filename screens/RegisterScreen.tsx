import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardTypeOptions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { zodResolver } from "@hookform/resolvers/zod";

import * as themeConfig from "../theme";
import { RegisterSchema, RegisterType } from "../schemas/register";
import { registerUser } from "../api/services/user/register";

import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/Navigation";
import { useUserStore } from "../store/userStore";

const theme = themeConfig.theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, "Register">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    justifyContent: "center",
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
  registerButton: {
    backgroundColor: theme.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 18,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  loginText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  loginLink: {
    color: theme.text,
    fontWeight: "bold",
  },
  selectedPlanBox: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 18,
  },
  planLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 4,
  },
  planName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const selectedPlan = route.params?.selectedPlan;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({ resolver: zodResolver(RegisterSchema) });

  const setUser = useUserStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterType) => {
    try {
      const result = await registerUser(data);

      if (!result?.id) throw new Error("ID do usuário não retornado.");

      const user = {
        id: result.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        isSubscribed: false,
        subscription: {
          planName: selectedPlan.name,
          planPrice: selectedPlan.price,
        },
      };

      setUser(user);
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      await AsyncStorage.setItem("@isLoggedIn", "true");

      Toast.show({
        type: "success",
        text1: "Cadastro realizado com sucesso!",
      });

      navigation.replace("Subscription", { userId: result.id });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erro inesperado, tente novamente.";

      Toast.show({
        type: "error",
        text1: "Erro no cadastro",
        text2: message,
      });
      console.error("❌ Erro no cadastro:", error);
    }
  };

  const fields: {
    name: keyof RegisterType;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    maxLength?: number;
  }[] = [
      { name: "firstname", placeholder: "Nome" },
      { name: "lastname", placeholder: "Sobrenome" },
      { name: "email", placeholder: "Email", keyboardType: "email-address" },
      { name: "phone", placeholder: "Telefone", keyboardType: "numeric", maxLength: 11 },
      { name: "address", placeholder: "Endereço" },
    ];

  if (!selectedPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, textAlign: "center" }}>
            Nenhum plano foi selecionado. Por favor, volte e escolha um plano
            antes de continuar.
          </Text>

          <TouchableOpacity
            style={[styles.registerButton, { marginTop: 24 }]}
            onPress={() => navigation.replace("ChoosePlan")}
          >
            <Text style={styles.registerButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
            <Text style={{ color: theme.text }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>Cadastro</Text>
        </View>

        <View style={styles.selectedPlanBox}>
          <Text style={styles.planLabel}>Plano Selecionado</Text>
          <Text style={styles.planName}>
            {selectedPlan.name} - {`R$ ${selectedPlan.price}/mês`}
          </Text>
        </View>

        {fields.map((field) => (
          <View key={field.name}>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder={field.placeholder}
                    placeholderTextColor="#6B7280"
                    style={styles.input}
                    keyboardType={field.keyboardType}
                    maxLength={field.maxLength}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors[field.name] && (
              <Text style={styles.errorText}>
                {errors[field.name]?.message}
              </Text>
            )}
          </View>
        ))}

        <View>
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
                  keyboardType="numeric"
                  maxLength={6}
                  onChangeText={onChange}
                  value={value}
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
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.registerButtonText}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>
            Já tem conta? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

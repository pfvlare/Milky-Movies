import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";

import * as themeConfig from "../theme";
import { RegisterSchema, RegisterType } from "../schemas/register";
import { RootStackParamList } from "../Navigation/Navigation";
import { useUserStore } from "../store/userStore";

const theme = themeConfig.theme;

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation, route }: Props) {
  const selectedPlan = route.params?.selectedPlan;
  const userToEdit = route.params?.userToEdit;

  const setUser = useUserStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({
    mode: "onChange",
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstname: userToEdit?.firstname || "",
      lastname: userToEdit?.lastname || "",
      email: userToEdit?.email || "",
      phone: userToEdit?.phone || "",
      address: userToEdit?.address || "",
      password: "",
      subscription: {
        plan: selectedPlan?.code || "",
        value: Number(selectedPlan?.price) || 0,
      },
    },
  });

  const onSubmit = async (data: RegisterType) => {
    try {
      if (userToEdit) {
        const updatedUser = { ...userToEdit, ...data };
        setUser(updatedUser);
        await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
        Toast.show({ type: "success", text1: "Dados atualizados com sucesso!" });
        navigation.goBack();
        return;
      }

      const now = new Date().toISOString();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const simulatedUser = {
        id: "simulado-123",
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

      setUser(simulatedUser);
      await AsyncStorage.setItem("@user", JSON.stringify(simulatedUser));
      await AsyncStorage.setItem("@isLoggedIn", "true");

      Toast.show({ type: "success", text1: "Modo offline: cadastro simulado!" });
      navigation.replace("Subscription", { userId: "simulado-123" });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro inesperado",
        text2: "Algo deu errado mesmo offline",
      });
      console.error("❌ Erro inesperado:", error);
    }
  };

  const fields = [
    { name: "firstname", placeholder: "Nome" },
    { name: "lastname", placeholder: "Sobrenome" },
    { name: "email", placeholder: "Email", keyboardType: "email-address" },
    { name: "phone", placeholder: "Telefone", keyboardType: "numeric", maxLength: 11 },
    { name: "address", placeholder: "Endereço" },
  ] as const;

  if (!userToEdit && !selectedPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: "white", fontSize: 18, textAlign: "center" }}>
            Nenhum plano foi selecionado. Por favor, volte e escolha um plano antes de continuar.
          </Text>
          <TouchableOpacity
            style={[styles.gradientButton, { marginTop: 24 }]}
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
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 16, zIndex: 10 }}
        onPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Welcome")
        }
      >
        <Ionicons name="arrow-back" size={24} color="#EC4899" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
            <Text style={{ color: theme.text }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>
            {userToEdit ? "Editar Perfil" : "Cadastro"}
          </Text>
        </View>

        {!userToEdit && (
          <View style={styles.selectedPlanBox}>
            <Text style={styles.planLabel}>Plano Selecionado</Text>
            <Text style={styles.planName}>
              {selectedPlan.name} - {`R$ ${selectedPlan.price}/mês`}
            </Text>
          </View>
        )}

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
              <Text style={styles.errorText}>{errors[field.name]?.message}</Text>
            )}
          </View>
        ))}

        {!userToEdit && (
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
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>
        )}

        <LinearGradient
          colors={["#EC4899", "#D946EF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity onPress={handleSubmit(onSubmit)}>
            <Text style={styles.registerButtonText}>
              {userToEdit ? "Salvar Alterações" : "Continuar"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {!userToEdit && (
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
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
  gradientButton: {
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

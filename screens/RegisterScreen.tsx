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
import { UpdateUserSchema, UpdateUserType } from "../schemas/updateUser";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { useUserStore } from "../store/userStore";
import { AxiosError } from "axios";
import { useRegister, useUpdateUser } from "../hooks/useAuth";
import Loading from "../components/loading";

const theme = themeConfig.theme;

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation, route }: Props) {
  const selectedPlan = route.params?.selectedPlan;
  const userToEdit = route.params?.userToEdit;

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hooks de mutação
  const { mutateAsync: registerUser } = useRegister();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  // Debug: Log dos parâmetros recebidos
  console.log('🔍 RegisterScreen - Parâmetros:', {
    selectedPlan,
    userToEdit: userToEdit ? { id: userToEdit.id, email: userToEdit.email } : null,
    isEditMode: !!userToEdit,
  });

  // Configurar formulário baseado no modo (registro ou edição)
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(userToEdit ? UpdateUserSchema : RegisterSchema),
    defaultValues: userToEdit ? {
      firstname: userToEdit.firstname || "",
      lastname: userToEdit.lastname || "",
      email: userToEdit.email || "",
      phone: userToEdit.phone || "",
      address: userToEdit.address || "",
    } : {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      // ✅ CORREÇÃO: Manter em minúsculo para o backend
      subscription: {
        plan: selectedPlan?.code || "basic", // Sempre minúsculo
        value: Number(selectedPlan?.price) || 18.90,
      },
    },
  });

  // Debug: Verificar valores do formulário em tempo real
  const watchedValues = watch();
  console.log('🔍 Form state:', {
    errors: Object.keys(errors),
    isValid,
    hasValues: Object.keys(watchedValues).length > 0,
    formData: watchedValues,
  });

  const onSubmit = async (data: RegisterType | UpdateUserType) => {
    console.log('🚀 onSubmit EXECUTADO! Dados recebidos:', data);

    try {
      setIsLoading(true);
      console.log('⏳ Loading state definido como true');

      if (userToEdit) {
        console.log('✏️ Modo EDIÇÃO iniciado');
        // Modo de edição
        const updatedUserData = await updateUser({
          id: userToEdit.id,
          data: data as UpdateUserType
        });

        const newUserState = {
          ...user,
          ...updatedUserData,
          currentProfileId: user?.currentProfileId
        };

        setUser(newUserState);
        await AsyncStorage.setItem("@user", JSON.stringify(newUserState));

        Toast.show({
          type: "success",
          text1: "Perfil atualizado!",
          text2: "Suas informações foram salvas com sucesso"
        });

        navigation.goBack();
        return;
      }

      console.log('🆕 Modo REGISTRO iniciado');

      // ✅ CORREÇÃO: Garantir que o plano está em minúsculo antes de enviar
      const registerData = {
        ...data,
        subscription: {
          ...(data as RegisterType).subscription,
          plan: (data as RegisterType).subscription.plan.toLowerCase() // Converter para minúsculo
        }
      } as RegisterType;

      console.log("📤 Enviando dados para registro (corrigidos):", {
        ...registerData,
        password: '[HIDDEN]'
      });

      const newUser = await registerUser(registerData);
      console.log('✅ Usuário registrado retornado:', newUser);

      if (!newUser?.id) {
        throw new Error("Usuário inválido retornado da API");
      }

      await AsyncStorage.setItem("@user", JSON.stringify(newUser));
      setUser(newUser);

      Toast.show({
        type: "success",
        text1: "Usuário registrado!",
        text2: "Conta criada com sucesso"
      });

      console.log('🔄 Navegando para Subscription com:', {
        userId: newUser.id,
        selectedPlan: selectedPlan
      });

      // ✅ CORREÇÃO: Passou selectedPlan para SubscriptionScreen
      navigation.replace("Subscription", {
        userId: newUser.id,
        selectedPlan: selectedPlan
      });

    } catch (error: unknown) {
      console.error("❌ Erro na operação:", error);

      const err = error as AxiosError<{ message: string | string[] }>;
      let errorMessage = "Erro inesperado";

      if (err.response?.data?.message) {
        const message = err.response.data.message;
        errorMessage = Array.isArray(message) ? message[0] : message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Toast.show({
        type: "error",
        text1: userToEdit ? "Erro ao atualizar" : "Erro ao registrar",
        text2: errorMessage,
      });
    } finally {
      console.log('🔄 Loading state definido como false');
      setIsLoading(false);
    }
  };

  // Debug: Testar se o botão está sendo clicado
  const handleButtonPress = () => {
    console.log('🔘 BOTÃO CLICADO!');
    console.log('🔘 Current loading state:', isLoading);
    console.log('🔘 Current updating state:', isUpdating);
    console.log('🔘 Current disabled state:', currentIsLoading);
    console.log('🔘 Form errors:', errors);
    console.log('🔘 Form isValid:', isValid);

    // Chamar handleSubmit manualmente
    handleSubmit(onSubmit)();
  };

  const fields = [
    { name: "firstname", placeholder: "Nome" },
    { name: "lastname", placeholder: "Sobrenome" },
    { name: "email", placeholder: "Email", keyboardType: "email-address" },
    { name: "phone", placeholder: "Telefone", keyboardType: "numeric", maxLength: 11 },
    { name: "address", placeholder: "Endereço" },
  ] as const;

  // Validação para modo de registro
  if (!userToEdit && !selectedPlan) {
    console.log('❌ Nenhum plano selecionado, mostrando tela de erro');
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

  const currentIsLoading = isLoading || isUpdating;

  console.log('🎨 Renderizando tela principal. Loading states:', {
    isLoading,
    isUpdating,
    currentIsLoading,
  });

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

        {!userToEdit && selectedPlan && (
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
                    editable={!currentIsLoading}
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
                    editable={!currentIsLoading}
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

        {/* ✅ ALTERAÇÃO: Usar função de debug em vez de handleSubmit direto */}
        <TouchableOpacity
          onPress={handleButtonPress}
          disabled={currentIsLoading}
          style={[styles.gradientButtonContainer, currentIsLoading && styles.disabledButton]}
        >
          <LinearGradient
            colors={currentIsLoading ? ["#6B7280", "#6B7280"] : ["#EC4899", "#D946EF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {currentIsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.registerButtonText}>
                  {userToEdit ? "Salvando..." : "Registrando..."}
                </Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>
                {userToEdit ? "Salvar Alterações" : "Continuar"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Debug info - remover em produção */}
        {__DEV__ && (
          <View style={{ padding: 20, backgroundColor: "#1F2937", margin: 18, borderRadius: 8 }}>
            <Text style={{ color: "white", fontSize: 12, fontFamily: "monospace" }}>
              DEBUG INFO:{'\n'}
              Loading: {isLoading ? 'true' : 'false'}{'\n'}
              Updating: {isUpdating ? 'true' : 'false'}{'\n'}
              Disabled: {currentIsLoading ? 'true' : 'false'}{'\n'}
              Valid: {isValid ? 'true' : 'false'}{'\n'}
              Errors: {Object.keys(errors).join(', ') || 'none'}{'\n'}
              Mode: {userToEdit ? 'edit' : 'register'}{'\n'}
              Plan: {selectedPlan?.name || 'none'}{'\n'}
              Plan Code: {selectedPlan?.code || 'none'}
            </Text>
          </View>
        )}

        {!userToEdit && (
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {currentIsLoading && <Loading />}
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
    fontSize: 14,
  },
  gradientButtonContainer: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 18,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
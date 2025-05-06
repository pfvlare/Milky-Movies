import React, { useState } from "react"
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
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Ionicons } from "@expo/vector-icons"
import * as themeConfig from "../theme"
import Toast from "react-native-toast-message"
import axios from "axios"

const theme = themeConfig.theme

const schema = yup.object().shape({
  firstname: yup.string().required("Nome é obrigatório"),
  lastname: yup.string().required("Sobrenome é obrigatório"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup
    .string()
    .matches(/^\d{6}$/, "A senha deve ter exatamente 6 números")
    .required("Senha é obrigatória"),
  phone: yup
    .string()
    .matches(/^\d{11}$/, "Digite 11 números")
    .required("Telefone é obrigatório"),
  address: yup.string().required("Endereço é obrigatório"),
})

type FormData = {
  firstname: string
  lastname: string
  email: string
  password: string
  phone: string
  address: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
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
  registerButton: {
    backgroundColor: theme.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
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
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 16 : 8,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
})

export default function RegisterScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) })

  const [showPassword, setShowPassword] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
        address: data.address,
      };

      const response = await axios.post("http://localhost:3000/user/register", payload);
      const result = response.data;

      if (!result?.id) throw new Error("ID do usuário não retornado.");

      await AsyncStorage.setItem(
        "@user",
        JSON.stringify({
          id: result.id,
          name: `${data.firstname} ${data.lastname}`,
          email: data.email,
          isSubscribed: false,
        })
      );

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

  const handleMenu = () => {
    setShowMenu(!showMenu)
  }

  const fields: {
    name: keyof FormData
    placeholder: string
    keyboardType?: KeyboardTypeOptions
    maxLength?: number
  }[] = [
      { name: "firstname", placeholder: "Nome" },
      { name: "lastname", placeholder: "Sobrenome" },
      { name: "email", placeholder: "Email", keyboardType: "email-address" },
      { name: "phone", placeholder: "Telefone", keyboardType: "numeric", maxLength: 11 },
      { name: "address", placeholder: "Endereço" },
    ]

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={30} color="white" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
            <Text style={{ color: theme.text }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>Cadastro</Text>
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
              <Text style={styles.errorText}>{errors[field.name]?.message}</Text>
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
  )
}

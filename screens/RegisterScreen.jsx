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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import * as themeConfig from "../theme";

const theme = themeConfig.theme;

const schema = yup.object().shape({
  firstName: yup.string().required("Nome é obrigatório"),
  lastName: yup.string().required("Sobrenome é obrigatório"),
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
});

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
});

export default function RegisterScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [showPassword, setShowPassword] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const onSubmit = async (data) => {
    try {
      const { firstname, lastname, email, password, address, phone } = data
      const response = await fetch("http://localhost:3000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          firstname,
          lastname,
          email,
          password,
          address,
          phone,
        },
      });

      const result = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem(
          "@user",
          JSON.stringify({
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            isSubscribed: false,
          })
        );
        navigation.replace("Subscription");
      } else {
        Alert.alert("Erro no cadastro", result.message || "Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar com o servidor.");
      console.reror(error);
    }
  };

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

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

        {/* Campos do formulário */}
        {[
          { name: "firstname", placeholder: "Nome" },
          { name: "lastname", placeholder: "Sobrenome" },
          { name: "email", placeholder: "Email" },
          {
            name: "phone",
            placeholder: "Telefone",
            keyboardType: "numeric",
            maxLength: 11,
          },
          { name: "address", placeholder: "Endereço" },
        ].map((field) => (
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
                    secureTextEntry={field.secure}
                    keyboardType={field.keyboardType || "default"}
                    maxLength={field.maxLength || 100}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors[field.name] && (
              <Text style={styles.errorText}>{errors[field.name].message}</Text>
            )}
          </View>
        ))}

        {/* Campo de senha com botão de olho */}
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
  );
}

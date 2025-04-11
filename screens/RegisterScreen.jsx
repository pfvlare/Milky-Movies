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
    .min(6, "Mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  phone: yup
    .string()
    .min(11, "Digite 11 números")
    .max(11, "Digite 11 números")
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
  },
  input: {
    color: "white",
    paddingVertical: 12,
    fontSize: 16,
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

  const [showMenu, setShowMenu] = useState(false);

  const onSubmit = async (data) => {
    await AsyncStorage.setItem(
      "@user",
      JSON.stringify({ ...data, isSubscribed: false })
    );
    navigation.replace("Subscription");
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

        {[
          { name: "firstName", placeholder: "Nome" },
          { name: "lastName", placeholder: "Sobrenome" },
          { name: "email", placeholder: "Email" },
          { name: "phone", placeholder: "Telefone", keyboardType: "numeric", maxLength: 11 },
          { name: "address", placeholder: "Endereço" },
          { name: "password", placeholder: "Senha", secure: true },
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
              <Text style={styles.errorText}>
                {errors[field.name].message}
              </Text>
            )}
          </View>
        ))}

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
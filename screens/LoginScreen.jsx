import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AppLayout from "../components/AppLayout";
import { Ionicons } from "@expo/vector-icons";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Obrigatório"),
  password: yup.string().required("Obrigatório"),
});

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

export default function LoginScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    const savedUser = await AsyncStorage.getItem("@user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    if (
      parsedUser &&
      data.email === parsedUser.email &&
      data.password === parsedUser.password
    ) {
      if (!parsedUser.isSubscribed) {
        navigation.replace("Subscription");
      } else {
        await AsyncStorage.setItem("@isLoggedIn", "true");
        navigation.replace("Home");
      }
    } else {
      Alert.alert("Erro", "Credenciais inválidas");
    }
  };

  return (
    <AppLayout showMenu={false}>
      <SafeAreaView style={styles.container}>
        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: "#EC4899" }}>M</Text>ilky{" "}
            <Text style={{ color: "#EC4899" }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>Login</Text>
        </View>

        <View>
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
                />
              </View>
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Senha"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>
            Não tem conta?{" "}
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>

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
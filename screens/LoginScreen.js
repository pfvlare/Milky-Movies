import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AppLayout from "../components/AppLayout";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Obrigatório"),
  password: yup.string().required("Obrigatório"),
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
      <SafeAreaView className="flex-1 bg-neutral-900 justify-center px-6">
        {/* Título */}
        <Text className="text-white text-4xl font-bold text-center mb-2">
          <Text className="text-pink-400">M</Text>ilky{" "}
          <Text className="text-pink-400">M</Text>ovies
        </Text>
        <Text className="text-gray-400 text-center mb-6">Login</Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Email"
              placeholderTextColor="gray"
              className="bg-neutral-800 text-white p-4 rounded-xl mb-2"
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-400 mb-2">{errors.email.message}</Text>
        )}

        {/* Senha */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Senha"
              placeholderTextColor="gray"
              secureTextEntry
              className="bg-neutral-800 text-white p-4 rounded-xl mb-4"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-400 mb-2">{errors.password.message}</Text>
        )}

        {/* Botão Entrar */}
        <TouchableOpacity
          className="bg-pink-500 p-4 rounded-xl mb-4"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-white text-center font-semibold">Entrar</Text>
        </TouchableOpacity>

        {/* Link para Cadastro */}
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text className="text-gray-400 text-center">
            Não tem conta?{" "}
            <Text className="text-pink-400 font-bold">Cadastre-se</Text>
          </Text>
        </TouchableOpacity>

        {/* Botão Cancelar */}
        <TouchableOpacity
          onPress={() => navigation.replace("Splash")}
          className="mt-6"
        >
          <Text className="text-center text-sm text-neutral-500 underline">
            Cancelar e voltar
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </AppLayout>
  );
}

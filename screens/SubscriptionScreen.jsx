import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  cardNumber: yup
    .string()
    .required("Número do cartão é obrigatório")
    .min(16, "Mínimo 16 dígitos")
    .max(16, "Máximo 16 dígitos"),
  cvv: yup
    .string()
    .required("CVV é obrigatório")
    .min(3, "CVV inválido")
    .max(4, "CVV inválido"),
  expiry: yup
    .string()
    .required("Data de validade é obrigatória")
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Formato inválido (MM/AA)"),
});

export default function SubscriptionScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const userData = await AsyncStorage.getItem("@user");
      if (!userData) return;

      const updatedUser = {
        ...JSON.parse(userData),
        isSubscribed: true,
        subscription: data,
      };

      await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("@isLoggedIn", "true");

      Alert.alert("Assinatura confirmada", "Você já pode acessar os filmes!");
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível processar a assinatura.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900 justify-center px-6">
      <Text className="text-white text-4xl font-bold text-center mb-2">
        <Text className="text-pink-400">M</Text>ilky{" "}
        <Text className="text-pink-400">M</Text>ovies
      </Text>
      <Text className="text-gray-400 text-center mb-6">Assinatura</Text>

      {[
        { name: "cardNumber", placeholder: "Número do cartão" },
        { name: "cvv", placeholder: "CVV" },
        { name: "expiry", placeholder: "Validade (MM/AA)" },
      ].map((field) => (
        <View key={field.name}>
          <Controller
            control={control}
            name={field.name}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder={field.placeholder}
                placeholderTextColor="gray"
                className="bg-neutral-800 text-white p-4 rounded-xl mb-2"
                keyboardType="numeric"
                maxLength={field.name === "cvv" ? 4 : 16}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors[field.name] && (
            <Text className="text-red-400 mb-2">
              {errors[field.name].message}
            </Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        className="bg-pink-500 p-4 rounded-xl mb-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-white text-center font-semibold">Assinar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text className="text-gray-400 text-center">
          Cancelar?{" "}
          <Text className="text-pink-400 font-bold">Voltar ao login</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  firstName: yup.string().required("Nome é obrigatório"),
  lastName: yup.string().required("Sobrenome é obrigatório"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup
    .string()
    .min(6, "Mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  phone: yup.string().required("Telefone é obrigatório"),
  address: yup.string().required("Endereço é obrigatório"),
});

export default function RegisterScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    await AsyncStorage.setItem(
      "@user",
      JSON.stringify({ ...data, isSubscribed: false })
    );
    Alert.alert("Sucesso", "Cadastro realizado! Agora assine para continuar.");
    navigation.replace("Subscription");
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900 px-6 pt-12">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-white text-4xl font-bold text-center mb-2">
          <Text className="text-pink-400">M</Text>ilky{" "}
          <Text className="text-pink-400">M</Text>ovies
        </Text>
        <Text className="text-gray-400 text-center mb-6">Cadastro</Text>

        {[
          { name: "firstName", placeholder: "Nome" },
          { name: "lastName", placeholder: "Sobrenome" },
          { name: "email", placeholder: "Email" },
          { name: "phone", placeholder: "Telefone" },
          { name: "address", placeholder: "Endereço" },
          { name: "password", placeholder: "Senha", secure: true },
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
                  secureTextEntry={field.secure}
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
          <Text className="text-white text-center font-semibold">
            Continuar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text className="text-gray-400 text-center mb-6">
            Já tem conta? <Text className="text-pink-400 font-bold">Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

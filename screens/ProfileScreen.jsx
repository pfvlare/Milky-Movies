import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("@user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };

    const unsubscribe = navigation.addListener("focus", loadUser);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@isLoggedIn");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Assinatura",
      "Assinatura cancelada com sucesso (modo demonstração)."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900 pt-12 px-6">
      <Text className="text-white text-4xl font-bold text-center mb-2">
        <Text className="text-pink-400">M</Text>ilky{" "}
        <Text className="text-pink-400">M</Text>ovies
      </Text>
      <Text className="text-gray-400 text-center mb-6">Perfil</Text>

      {user ? (
        <ScrollView>
          <Text className="text-white text-lg mb-2">
            👤 Nome: {user.firstName} {user.lastName}
          </Text>
          <Text className="text-white text-lg mb-2">
            📧 Email: {user.email}
          </Text>
          <Text className="text-white text-lg mb-2">
            📍 Endereço: {user.address}
          </Text>
          <Text className="text-white text-lg mb-6">
            📞 Telefone: {user.phone}
          </Text>

          <Text className="text-white text-xl font-bold mb-4">
            💳 Assinatura
          </Text>
          <Text className="text-neutral-400 mb-6">Status: Ativa</Text>

          <TouchableOpacity
            className="bg-red-500 py-3 rounded-xl mb-6"
            onPress={handleCancelSubscription}
          >
            <Text className="text-white text-center font-bold">
              Cancelar Assinatura
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-700 py-3 rounded-xl"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-bold">Sair</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <Text className="text-white text-center mt-10">
          Carregando dados do usuário...
        </Text>
      )}
    </SafeAreaView>
  );
}

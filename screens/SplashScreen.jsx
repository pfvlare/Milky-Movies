import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user");
        const isLoggedIn = await AsyncStorage.getItem("@isLoggedIn");

        if (storedUser && isLoggedIn === "true") {
          const user = JSON.parse(storedUser);
          if (user.isSubscribed) {
            navigation.replace("Home");
          } else {
            navigation.replace("Subscription");
          }
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Erro ao verificar login:", error);
        navigation.replace("Login");
      }
    };

    const timer = setTimeout(checkAuth, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-neutral-900">
      <Text className="text-white text-4xl font-bold mb-4">
        <Text className="text-pink-500">M</Text>ilky{" "}
        <Text className="text-pink-500">M</Text>ovies
      </Text>
      <ActivityIndicator size="large" color="#ec4899" />
    </View>
  );
}

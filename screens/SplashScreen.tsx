import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/Navigation";
import { useUserStore } from "../store/userStore"; // ⬅️ Import da store

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  pinkText: {
    color: "#EC4899",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
    resizeMode: "contain",
  },
});

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();
  const setUser = useUserStore((state) => state.setUser); // ⬅️ Hook da store

  useEffect(() => {
    const waitAndCheckAuth = async () => {
      await new Promise((res) => setTimeout(res, 2500));

      try {
        const storedUser = await AsyncStorage.getItem("@user");
        const isLoggedIn = await AsyncStorage.getItem("@isLoggedIn");

        if (!storedUser || isLoggedIn !== "true") {
          return navigation.replace("Welcome");
        }

        const user = JSON.parse(storedUser);

        if (
          !user ||
          typeof user !== "object" ||
          !user.id ||
          typeof user.id !== "string" ||
          !user.email
        ) {
          await AsyncStorage.removeItem("@user");
          await AsyncStorage.removeItem("@isLoggedIn");
          return navigation.replace("Welcome");
        }

        // ⬅️ Salva o usuário na store global Zustand
        setUser(user);

        if (user.isSubscribed) {
          return navigation.replace("Home");
        } else {
          return navigation.replace("Subscription", { userId: user.id });
        }
      } catch (err) {
        console.error("Erro ao verificar login:", err);
        navigation.replace("Welcome");
      }
    };

    waitAndCheckAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/MovieTime.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>
        <Text style={styles.pinkText}>M</Text>ilky{" "}
        <Text style={styles.pinkText}>M</Text>ovies
      </Text>
      <ActivityIndicator size="large" color="#EC4899" />
    </View>
  );
}

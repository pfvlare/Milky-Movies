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
  const navigation = useNavigation();

  useEffect(() => {
    const waitAndCheckAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500)); // espera 2.5 segundos fixos

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

    waitAndCheckAuth();
  }, []);

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
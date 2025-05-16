import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/Navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

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

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const start = async () => {
      await new Promise((res) => setTimeout(res, 1500)); // Simula carregamento
      navigation.replace("Welcome");
    };

    start();
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

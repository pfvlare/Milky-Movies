import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/Navigation";
import { useUserStore } from "../store/userStore";

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
  const setUser = useUserStore((state) => state.setUser);
  const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);

  useEffect(() => {
    const start = async () => {
      await new Promise((res) => setTimeout(res, 1500)); // Simula carregamento

      const stored = await AsyncStorage.getItem("@user");
      if (!stored) {
        navigation.replace("Welcome"); // Não logado
        return;
      }

      const parsed = JSON.parse(stored);
      if (!parsed?.id) {
        navigation.replace("Welcome");
        return;
      }

      setUser(parsed);
      if (parsed.currentProfileId) {
        setCurrentProfile(parsed.currentProfileId);
      }

      navigation.replace("ChooseProfile");
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

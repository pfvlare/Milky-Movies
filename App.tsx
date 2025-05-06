import { useEffect, useState } from "react";
import Navigation from "./Navigation/Navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View } from "react-native";

const queryClient = new QueryClient();

export default function App() {
  const [initialScreen, setInitialScreen] = useState<"Home" | "Login" | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("@user");
      setInitialScreen(user ? "Login" : "Login");
    };

    checkUser();
  }, []);

  if (!initialScreen) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  // Se carregou corretamente
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Navigation initialRoute={initialScreen} />
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Você pode deixar aqui uma leitura futura, se quiser validar algo
      await AsyncStorage.getItem("@user");
      setReady(true);
    };

    init();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Navigation initialRoute="Welcome" />
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

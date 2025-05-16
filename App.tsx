import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import Navigation from "./Navigation/Navigation"; // <-- Caminho correto
import "./global.css"; // se estiver usando Tailwind ou global CSS

const queryClient = new QueryClient();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Se quiser validar token, login ou algo aqui, pode
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

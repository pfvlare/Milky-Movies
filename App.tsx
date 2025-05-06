import { useEffect, useState } from "react";
import Navigation from "./Navigation/Navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { View, Text, ActivityIndicator } from "react-native";

const queryClient = new QueryClient();

export default function App() {
  const [initialScreen, setInitialScreen] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem("@user");
        console.log("Usuário encontrado no AsyncStorage:", user);
        setInitialScreen(user ? "Home" : "Login");
      } catch (err: any) {
        console.error("Erro ao ler usuário do AsyncStorage:", err);
        setErro("Erro ao acessar os dados locais.");
      }
    };

    checkUser();
  }, []);

  // Enquanto carrega
  if (!initialScreen && !erro) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  // Se der erro
  if (erro) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", fontSize: 18 }}>{erro}</Text>
        <Text style={{ marginTop: 10 }}>Verifique permissões de armazenamento ou reinicie o app.</Text>
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

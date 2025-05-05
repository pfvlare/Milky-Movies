import { useEffect, useState } from "react";
import Navigation from "./Navigation/Navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function App() {
  const [initialScreen, setInitialScreen] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("@user");
      setInitialScreen(user ? "Home" : "Login");
    };
    checkUser();
  }, []);

  if (!initialScreen) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Navigation initialRoute={initialScreen} />
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

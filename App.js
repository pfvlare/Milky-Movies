import { useEffect, useState } from "react";
import Navigation from "./Navigation/Navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./global.css";

export default function App() {
  const [initialScreen, setInitialScreen] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("@user");
      setInitialScreen(user ? "Home" : "Login");
    };
    checkUser();
  }, []);

  if (!initialScreen) return null;

  return <Navigation initialRoute={initialScreen} />;
}
// AppLayout.js
import React from "react";
import { SafeAreaView } from "react-native";
import MenuModal from "./MenuModal";
import { useRoute } from "@react-navigation/native";

// Rotas onde o menu não deve aparecer
const hiddenMenuRoutes = ["Login", "Register", "Splash", "Subscription"];

export default function AppLayout({ children }) {
  const route = useRoute();

  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      {shouldShowMenu && <MenuModal />}
      {children}
    </SafeAreaView>
  );
}

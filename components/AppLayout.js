// AppLayout.js
import React, { useState } from "react";
import { SafeAreaView, Pressable, Text } from "react-native";
import MenuModal from "./MenuModal";
import { useRoute } from "@react-navigation/native";

// Rotas onde o menu não deve aparecer
const hiddenMenuRoutes = ["Login", "Register", "Splash", "Subscription"];

export default function AppLayout({ children }) {
  const route = useRoute();
  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  const [showMenu, setShowMenu] = useState(false);

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <Pressable onPress={handleMenu} className="p-2 absolute top-14 left-2">
        <Text className="text-white">Menu</Text>
      </Pressable>
      {shouldShowMenu && showMenu && (
        <MenuModal visible={showMenu} trigger={handleMenu} />
      )}
      {children}
    </SafeAreaView>
  );
}

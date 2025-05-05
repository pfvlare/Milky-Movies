import React from "react";
import { SafeAreaView } from "react-native";
import Toast from "react-native-toast-message";

export default function AppLayout({ children }) {
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      {children}
      <Toast />
    </SafeAreaView>
  );
}

// AppLayout.js
import React from "react";
import { SafeAreaView } from "react-native";

export default function AppLayout({ children }) {
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">

      {children}
    </SafeAreaView>
  );
}

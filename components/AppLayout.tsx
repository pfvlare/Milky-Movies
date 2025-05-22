import React from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";

export default function AppLayout({ children }) {
  return (
    <SafeAreaView style={styles.container}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827", // fundo escuro padrão
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
});

import React from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";

import * as themeConfig from "../theme";
const theme = themeConfig.theme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  scrollview: {
    flexGrow: 1,
  },
});

export default function AppLayout({ children, showMenu = true }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollview}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
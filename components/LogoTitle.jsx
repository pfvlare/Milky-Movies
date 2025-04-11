import React from "react";
import { Text, View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pinkText: {
    color: '#EC4899',
    fontSize: 24,
    fontWeight: 'bold',
  },
  whiteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default function LogoTitle() {
  return (
    <View style={styles.container}>
      <Text style={styles.pinkText}>M</Text>
      <Text style={styles.whiteText}>ilky </Text>
      <Text style={styles.pinkText}>M</Text>
      <Text style={styles.whiteText}>ovies</Text>
    </View>
  );
}
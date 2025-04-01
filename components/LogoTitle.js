// components/LogoTitle.js
import React from "react";
import { Text, View } from "react-native";

export default function LogoTitle() {
  return (
    <View className="flex-row justify-center mb-6">
      <Text className="text-3xl font-bold text-pink-500">M</Text>
      <Text className="text-3xl font-bold text-white">ilky </Text>
      <Text className="text-3xl font-bold text-pink-500">M</Text>
      <Text className="text-3xl font-bold text-white">ovies</Text>
    </View>
  );
}

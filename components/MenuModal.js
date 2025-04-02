import React from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function MenuModal({ visible, onClose, trigger }) {
  const navigation = useNavigation();

  const goTo = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={() => {
          onClose?.();
          trigger?.();
        }}
      >
        <TouchableWithoutFeedback>
          <View className="bg-neutral-900 p-4 rounded-t-3xl">
            <Pressable onPress={() => goTo("Home")} className="mb-4">
              <Text className="text-white text-lg">🎬 Home</Text>
            </Pressable>
            <Pressable onPress={() => goTo("Favorites")} className="mb-4">
              <Text className="text-white text-lg">⭐ Favoritos</Text>
            </Pressable>
            <Pressable onPress={() => goTo("Profile")}>
              <Text className="text-white text-lg">👤 Perfil</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

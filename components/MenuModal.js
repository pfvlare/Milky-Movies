import React, { useEffect, useRef } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function MenuModal({ visible, onClose, trigger }) {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const goTo = (screen) => {
    closeMenu();
    navigation.navigate(screen);
  };

  const openMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
      trigger?.();
    });
  };

  useEffect(() => {
    if (visible) {
      openMenu();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        className="flex-1 justify-start flex-row bg-black/50 duration-300"
        activeOpacity={1}
        onPress={closeMenu}
      >
        <TouchableWithoutFeedback>
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              width: "66%",
            }}
            className="bg-neutral-900 pl-8 py-20 rounded-tr-3xl rounded-br-3xl"
          >
            <Pressable onPress={() => goTo("Home")} className="mb-4">
              <Text className="text-white text-lg">🎬 Home</Text>
            </Pressable>
            <Pressable onPress={() => goTo("Favorites")} className="mb-4">
              <Text className="text-white text-lg">⭐ Favoritos</Text>
            </Pressable>
            <Pressable onPress={() => goTo("Profile")}>
              <Text className="text-white text-lg">👤 Perfil</Text>
            </Pressable>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

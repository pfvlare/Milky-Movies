import React, { useEffect, useRef } from "react";
import {
  Modal,
  TouchableOpacity,
  Text,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    width: "66%",
    backgroundColor: "#111827",
    paddingLeft: 32,
    paddingVertical: 80,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  menuItem: {
    marginBottom: 16,
  },
  menuText: {
    color: "white",
    fontSize: 16,
  },
});

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
<<<<<<< HEAD
        className="flex-1 justify-start flex-row bg-black/50 duration-300"
=======
        style={styles.modalContainer}
>>>>>>> origin/main
        activeOpacity={1}
        onPress={closeMenu}
      >
        <TouchableWithoutFeedback>
          <Animated.View
<<<<<<< HEAD
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
=======
            style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
          >
              <Pressable onPress={() => goTo("Home")} style={styles.menuItem}>
                <Text style={styles.menuText}>🎬 Home</Text>
              </Pressable>
              <Pressable onPress={() => goTo("Favorites")} style={styles.menuItem}>
                <Text style={styles.menuText}>⭐ Favoritos</Text>
              </Pressable>
              <Pressable onPress={() => goTo("Profile")} style={styles.menuItem}>
                <Text style={styles.menuText}>👤 Perfil</Text>
>>>>>>> origin/main
              </Pressable>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/main

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
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../Navigation/NavigationTypes"; // ✅ Corrigido

type MenuModalProps = {
  visible: boolean;
  onClose?: () => void;
  trigger?: () => void;
  navigation: NavigationProp<RootStackParamList>;
};

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

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, trigger, navigation }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const goTo = (screen: keyof RootStackParamList) => {
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
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={closeMenu}
      >
        <TouchableWithoutFeedback>
          <Animated.View
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
            </Pressable>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default MenuModal;

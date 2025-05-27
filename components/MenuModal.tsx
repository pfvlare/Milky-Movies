import React, { useEffect, useRef } from "react";
import {
  Modal,
  TouchableOpacity,
  Text,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { useUserStore } from "../store/userStore";
import Toast from "react-native-toast-message";

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
    paddingVertical: 60,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: "space-between",
  },
  profileList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  profileItem: {
    alignItems: "center",
    marginRight: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  profileAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileName: {
    color: "#F9FAFB",
    fontSize: 14,
  },
  profileSelected: {
    borderColor: "#EC4899",
    borderWidth: 2,
    borderRadius: 40,
    padding: 2,
  },
  section: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutText: {
    color: "#EC4899",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 16,
  },
});

type MenuModalProps = {
  visible: boolean;
  onClose?: () => void;
  trigger?: () => void;
  navigation: NavigationProp<RootStackParamList>;
};

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, trigger, navigation }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);

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

  const openMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goTo = (screen: keyof RootStackParamList) => {
    closeMenu();
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@isLoggedIn");
    setUser(null);
    closeMenu();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const handleChangeProfile = () => {
    setCurrentProfile(null);
    Toast.show({ type: "info", text1: "Selecione um perfil" });
    closeMenu();
    navigation.reset({ index: 0, routes: [{ name: "ChooseProfile" }] });
  };

  useEffect(() => {
    if (visible) openMenu();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={closeMenu}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
          >
            <View>
              <View style={styles.profileList}>
                {user?.profiles?.slice(0, user.subscription?.maxProfiles || 1).map((profile) => {
                  const initials = profile.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  const isSelected = user.currentProfileId === profile.id;

                  return (
                    <View key={profile.id} style={styles.profileItem}>
                      <View
                        style={[
                          styles.profileAvatar,
                          { backgroundColor: profile.color || "#EC4899" },
                          isSelected && styles.profileSelected,
                        ]}
                      >
                        <Text style={styles.profileAvatarText}>{initials}</Text>
                      </View>
                      <Text style={styles.profileName}>{profile.name}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.section}>
                <Pressable onPress={() => goTo("Home")} style={styles.menuItem}>
                  <Ionicons name="home-outline" size={20} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Início</Text>
                </Pressable>

                <Pressable onPress={() => goTo("Favorites")} style={styles.menuItem}>
                  <Ionicons name="heart-outline" size={20} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Favoritos</Text>
                </Pressable>

                <Pressable onPress={() => goTo("Profile")} style={styles.menuItem}>
                  <Ionicons name="person-outline" size={20} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Perfil</Text>
                </Pressable>

                {(user?.subscription?.maxProfiles || 1) > 1 && (
                  <Pressable onPress={handleChangeProfile} style={styles.menuItem}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color="#EC4899"
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>Trocar de Perfil</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Pressable onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair</Text>
            </Pressable>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default MenuModal;

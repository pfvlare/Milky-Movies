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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { useUserStore } from "../store/userStore";
import { useProfiles, useProfileLimits } from "../hooks/useProfiles";
import { useSubscriptionByUserId } from "../hooks/useSubscription";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  menuContainer: {
    width: "75%",
    backgroundColor: "#111827",
    paddingLeft: 24,
    paddingRight: 16,
    paddingVertical: 60,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  backgroundOverlay: {
    flex: 1,
  },
  menuContent: {
    flex: 1,
  },
  userSection: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  currentProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#1F2937",
    borderRadius: 12,
  },
  currentProfileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  currentProfileText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  currentProfileInfo: {
    flex: 1,
  },
  currentProfileName: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  currentProfileSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  profilesSection: {
    marginBottom: 24,
  },
  profilesSectionTitle: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profilesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  profileItem: {
    alignItems: "center",
    marginBottom: 16,
    minWidth: 70,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    position: "relative",
  },
  profileAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileName: {
    color: "#F9FAFB",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 60,
  },
  profileSelected: {
    borderColor: "#10B981",
    borderWidth: 3,
  },
  currentBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#10B981",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111827",
  },
  addProfileButton: {
    alignItems: "center",
    marginBottom: 16,
    minWidth: 70,
  },
  addProfileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#374151",
    borderWidth: 2,
    borderColor: "#EC4899",
    borderStyle: "dashed",
  },
  addProfileText: {
    color: "#EC4899",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 60,
  },
  limitsInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#374151",
    borderRadius: 8,
  },
  limitsText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  upgradeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upgradeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upgradeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  navigationSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: "#1F2937",
  },
  menuIcon: {
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  subscriptionInfo: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#EC4899",
  },
  subscriptionTitle: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  subscriptionText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  subscriptionValue: {
    color: "#EC4899",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  logoutButton: {
    borderRadius: 8,
  },
  logoutGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },
});

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  navigation: NavigationProp<RootStackParamList>;
};

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, navigation }) => {
  // Animação começa com valor negativo (fora da tela à esquerda)
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);

  // Hooks para buscar dados
  const { data: profiles = [], isLoading: isLoadingProfiles } = useProfiles(user?.id);
  const { data: profileLimits } = useProfileLimits(user?.id);
  const { data: subscription } = useSubscriptionByUserId(user?.id);

  // Encontrar perfil atual
  const currentProfile = profiles.find((p) => p.id === user?.currentProfileId) || profiles[0];

  // Função para mapear planos
  const getPlanDisplayName = (plan: string) => {
    const planNames = {
      'basic': 'Básico',
      'intermediary': 'Padrão',
      'complete': 'Premium',
    };
    return planNames[plan] || 'Gratuito';
  };

  const closeMenu = () => {
    console.log('🔄 Fechando menu...');

    // Animar o fechamento (deslizando para a esquerda)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300, // Volta para fora da tela à esquerda
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      console.log('✅ Menu fechado, chamando onClose');
      onClose();
    });
  };

  const openMenu = () => {
    console.log('🔄 Abrindo menu...');

    // Animar a abertura (deslizando da esquerda para posição 0)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, // Posição final (visível)
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const goTo = (screen: keyof RootStackParamList) => {
    console.log('🔄 Navegando para:', screen);
    closeMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      await AsyncStorage.removeItem("@isLoggedIn");
      setUser(null);
      closeMenu();

      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
        Toast.show({
          type: "success",
          text1: "Logout realizado",
          text2: "Até logo!"
        });
      }, 350);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao sair",
        text2: "Tente novamente"
      });
    }
  };

  const handleChangeProfile = (profileId?: string) => {
    if (profileId) {
      setCurrentProfile(profileId);
      Toast.show({
        type: "success",
        text1: "Perfil alterado",
        text2: `Agora usando: ${profiles.find(p => p.id === profileId)?.name}`
      });
    }
    closeMenu();
  };

  const handleManageProfiles = () => {
    goTo("ChooseProfile");
  };

  const handleUpgradePlan = () => {
    goTo("ChangePlan");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Resetar animações quando o modal for aberto
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-300); // Começa fora da tela à esquerda
      opacityAnim.setValue(0);
      openMenu();
    }
  }, [visible]);

  // Se não está visível, não renderizar
  if (!visible) {
    return null;
  }

  const maxProfiles = profileLimits?.maxProfiles || 1;
  const currentProfilesCount = profileLimits?.currentProfiles || profiles.length;
  const canCreateMore = profileLimits?.canCreateMore ?? (profiles.length < maxProfiles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeMenu}
      hardwareAccelerated
    >
      <Animated.View
        style={[
          styles.modalContainer,
          { opacity: opacityAnim }
        ]}
      >
        {/* Menu container - PRIMEIRO (lado esquerdo) */}
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
              {/* Seção do Usuário Atual */}
              <View style={styles.userSection}>
                {currentProfile ? (
                  <TouchableOpacity
                    style={styles.currentProfileContainer}
                    onPress={handleManageProfiles}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.currentProfileAvatar,
                        { backgroundColor: currentProfile.color || "#EC4899" }
                      ]}
                    >
                      <Text style={styles.currentProfileText}>
                        {getInitials(currentProfile.name)}
                      </Text>
                    </View>
                    <View style={styles.currentProfileInfo}>
                      <Text style={styles.currentProfileName}>{currentProfile.name}</Text>
                      <Text style={styles.currentProfileSubtitle}>Perfil atual</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.currentProfileContainer}
                    onPress={handleManageProfiles}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.currentProfileAvatar, { backgroundColor: "#EC4899" }]}>
                      <Text style={styles.currentProfileText}>
                        {user?.firstname ? user.firstname.charAt(0).toUpperCase() : "U"}
                      </Text>
                    </View>
                    <View style={styles.currentProfileInfo}>
                      <Text style={styles.currentProfileName}>
                        {user?.firstname || "Usuário"}
                      </Text>
                      <Text style={styles.currentProfileSubtitle}>Criar perfil</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={20} color="#EC4899" />
                  </TouchableOpacity>
                )}

                {/* Lista de Perfis */}
                {profiles.length > 0 && (
                  <View style={styles.profilesSection}>
                    <Text style={styles.profilesSectionTitle}>Trocar Perfil</Text>

                    {isLoadingProfiles ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#EC4899" />
                        <Text style={styles.loadingText}>Carregando perfis...</Text>
                      </View>
                    ) : (
                      <View style={styles.profilesList}>
                        {profiles.map((profile) => {
                          const isSelected = user?.currentProfileId === profile.id;

                          return (
                            <TouchableOpacity
                              key={profile.id}
                              style={styles.profileItem}
                              onPress={() => handleChangeProfile(profile.id)}
                              disabled={isSelected}
                            >
                              <View
                                style={[
                                  styles.profileAvatar,
                                  { backgroundColor: profile.color || "#EC4899" },
                                  isSelected && styles.profileSelected,
                                ]}
                              >
                                <Text style={styles.profileAvatarText}>
                                  {getInitials(profile.name)}
                                </Text>
                                {isSelected && (
                                  <View style={styles.currentBadge}>
                                    <Ionicons name="checkmark" size={10} color="#fff" />
                                  </View>
                                )}
                              </View>
                              <Text
                                style={styles.profileName}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {profile.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                        {/* Botão Adicionar Perfil */}
                        {canCreateMore && (
                          <TouchableOpacity
                            style={styles.addProfileButton}
                            onPress={handleManageProfiles}
                          >
                            <View style={styles.addProfileAvatar}>
                              <Ionicons name="add" size={20} color="#EC4899" />
                            </View>
                            <Text style={styles.addProfileText}>Adicionar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* Informações de Limite */}
                    <View style={styles.limitsInfo}>
                      <Text style={styles.limitsText}>
                        {currentProfilesCount}/{maxProfiles} perfis
                      </Text>
                      {subscription?.plan !== 'complete' && (
                        <TouchableOpacity
                          style={styles.upgradeButton}
                          onPress={handleUpgradePlan}
                        >
                          <LinearGradient
                            colors={["#EC4899", "#D946EF"]}
                            style={styles.upgradeGradient}
                          >
                            <Text style={styles.upgradeText}>UPGRADE</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Seção de Navegação */}
              <View style={styles.navigationSection}>
                <Pressable onPress={() => goTo("Home")} style={styles.menuItem}>
                  <Ionicons name="home-outline" size={24} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Início</Text>
                </Pressable>

                <Pressable onPress={() => goTo("Favorites")} style={styles.menuItem}>
                  <Ionicons name="heart-outline" size={24} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Favoritos</Text>
                </Pressable>

                <Pressable onPress={() => goTo("Profile")} style={styles.menuItem}>
                  <Ionicons name="person-outline" size={24} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Minha Conta</Text>
                </Pressable>

                <Pressable onPress={handleManageProfiles} style={styles.menuItem}>
                  <Ionicons name="people-outline" size={24} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Gerenciar Perfis</Text>
                </Pressable>

                <Pressable onPress={() => goTo("ChangePlan")} style={styles.menuItem}>
                  <Ionicons name="card-outline" size={24} color="#EC4899" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Planos</Text>
                </Pressable>
              </View>

              {/* Informações da Assinatura */}
              {subscription && (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionTitle}>Sua Assinatura</Text>
                  <Text style={styles.subscriptionText}>
                    {`Plano: ${getPlanDisplayName(subscription.plan)}`}
                  </Text>
                  <Text style={styles.subscriptionText}>
                    {`Valor: `}
                    <Text style={styles.subscriptionValue}>
                      {`R$ ${subscription.value.toFixed(2).replace('.', ',')}/mês`}
                    </Text>
                  </Text>
                  <Text style={styles.subscriptionText}>
                    {`Expira em: ${new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}`}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Seção de Logout */}
            <View style={styles.logoutSection}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  style={styles.logoutGradient}
                >
                  <Ionicons name="log-out-outline" size={20} color="#fff" />
                  <Text style={styles.logoutText}>Sair</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* Background overlay que fecha o menu - SEGUNDO (lado direito) */}
        <TouchableOpacity
          style={styles.backgroundOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      </Animated.View>
    </Modal>
  );
};

export default MenuModal;
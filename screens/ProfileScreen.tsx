import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import * as themeConfig from "../theme";
import { useUserStore } from "../store/userStore";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSubscriptionByUserId } from "../hooks/useSubscription";
import { useCardsByUser, useDeleteCard } from "../hooks/useCards";
import { useProfiles } from "../hooks/useProfiles";
import { useQueryClient } from '@tanstack/react-query';

const theme = themeConfig.theme;
type NavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

interface Card {
  id: string;
  nameCard: string;
  cardNumber: string;
  expiresDate: string;
  securityCode: string;
  userId: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setSubscription = useUserStore((state) => state.setSubscription);
  const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);
  const queryClient = useQueryClient();

  const [showCardsModal, setShowCardsModal] = useState(false);
  const [orderedCards, setOrderedCards] = useState<Card[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hooks para buscar dados
  const { data: profiles = [] } = useProfiles(user?.id);
  const { data: subscription } = useSubscriptionByUserId(user?.id);
  const { data: cards, refetch: refetchCards } = useCardsByUser(user?.id);
  const deleteCardMutation = useDeleteCard();

  // Encontrar perfil atual baseado no currentProfileId ou usar o primeiro disponível
  const currentProfile = React.useMemo(() => {
    if (!profiles || profiles.length === 0) return null;

    // Se há um currentProfileId definido, tentar encontrar esse perfil
    if (user?.currentProfileId) {
      const foundProfile = profiles.find((p) => p.id === user.currentProfileId);
      if (foundProfile) return foundProfile;
    }

    // Se não encontrou ou não há currentProfileId, usar o primeiro perfil
    const firstProfile = profiles[0];

    // Se o primeiro perfil é diferente do currentProfileId, atualizar o store
    if (firstProfile && firstProfile.id !== user?.currentProfileId) {
      setCurrentProfile(firstProfile.id);
    }

    return firstProfile;
  }, [profiles, user?.currentProfileId, setCurrentProfile]);

  console.log("🚀 ~ ProfileScreen ~ user:", user);
  console.log("🚀 ~ ProfileScreen ~ profiles:", profiles);
  console.log("🚀 ~ ProfileScreen ~ currentProfile:", currentProfile);
  console.log("🚀 ~ ProfileScreen ~ user.currentProfileId:", user?.currentProfileId);

  const formatCardExpiry = (expiresDate: string) => {
    try {
      const date = new Date(expiresDate);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${year}`;
    } catch (error) {
      return "Inválida";
    }
  };

  const getPlanInfo = (plan: string, value: number) => {
    const planNames = {
      basic: "Básico",
      intermediary: "Padrão",
      complete: "Premium"
    };

    return {
      name: planNames[plan as keyof typeof planNames] || "Padrão",
      price: `R$ ${value.toFixed(2).replace('.', ',')}`
    };
  };

  // Função para verificar se a assinatura está ativa
  const isSubscriptionActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

  // Função para mascarar número do cartão
  const maskCardNumber = (cardNumber: string) => {
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  // Função para definir cartão como principal (mover para primeira posição)
  const setPrimaryCard = async (cardId: string) => {
    if (!cards) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const cardToMove = cards.find(card => card.id === cardId);
    const otherCards = cards.filter(card => card.id !== cardId);

    if (cardToMove) {
      const newOrder = [cardToMove, ...otherCards];
      setOrderedCards(newOrder);

      // Simular reordenação no cache local
      queryClient.setQueryData(['cards', user.id], newOrder);

      Alert.alert(
        "Cartão Principal",
        `Cartão **** ${cardToMove.cardNumber.slice(-4)} definido como principal!`
      );
    }
  };

  // Função para deletar cartão
  const handleDeleteCard = async (cardId: string, cardNumber: string) => {
    Alert.alert(
      "Excluir Cartão",
      `Deseja realmente excluir o cartão **** ${cardNumber.slice(-4)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);

              await deleteCardMutation.mutateAsync(cardId);

              await queryClient.invalidateQueries({ queryKey: ['cards', user.id] });
              await refetchCards();

              if (orderedCards.length > 0) {
                const newOrderedCards = orderedCards.filter(card => card.id !== cardId);
                setOrderedCards(newOrderedCards);
              }

              Alert.alert("Sucesso", "Cartão excluído com sucesso!");
            } catch (error) {
              console.error("🚀 ~ Erro completo ao excluir cartão:", error);
              console.error("🚀 ~ Erro response:", error.response);
              console.error("🚀 ~ Erro response data:", error.response?.data);
              console.error("🚀 ~ Erro response status:", error.response?.status);

              let errorMessage = "Não foi possível excluir o cartão.";

              if (error.response?.status === 404) {
                errorMessage = "Cartão não encontrado. Pode já ter sido excluído.";
                // Se for 404, ainda assim remover do cache local
                await queryClient.invalidateQueries({ queryKey: ['cards', user.id] });
                await refetchCards();
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              }

              Alert.alert("Erro", errorMessage);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // Função para navegar para escolha de perfil
  const handleChangeProfile = () => {
    navigation.navigate("ChooseProfile" as never);
  };

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Inicializar ordem dos cartões
    if (cards && cards.length > 0) {
      setOrderedCards(cards);
    }

    // Atualizar o store com os dados da subscription quando disponível
    if (subscription && cards && cards.length > 0) {
      const firstCard = orderedCards.length > 0 ? orderedCards[0] : cards[0];
      const planInfo = getPlanInfo(subscription.plan, subscription.value);

      setSubscription({
        cardNumber: firstCard.cardNumber,
        expiry: formatCardExpiry(firstCard.expiresDate),
        planName: planInfo.name,
        planPrice: Number(planInfo.price),
        isActive: isSubscriptionActive(subscription.expiresAt),
      });
    }
  }, [subscription, cards, orderedCards, setSubscription]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@isLoggedIn");
    setUser({} as any);
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const handleCancelSubscription = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Alert.alert("Assinatura", "Assinatura cancelada com sucesso (modo demonstração).");
  };

  const handleUpdateCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (user?.id) {
      navigation.navigate("Subscription", { userId: user.id });
    }
  };

  const getInitials = () => {
    if (!currentProfile?.name) {
      // Fallback para nome do usuário se não há perfil
      if (user?.firstname) {
        return user.firstname.charAt(0).toUpperCase();
      }
      return "U"; // User default
    }
    return currentProfile.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Máximo 2 iniciais
  };

  const getDisplayName = () => {
    if (currentProfile?.name) {
      return currentProfile.name;
    }
    if (user?.firstname && user?.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    if (user?.firstname) {
      return user.firstname;
    }
    return "Usuário";
  };

  const cardsToShow = orderedCards.length > 0 ? orderedCards : (cards || []);
  const primaryCard = cardsToShow.length > 0 ? cardsToShow[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
        }
      >
        <Ionicons name="arrow-back" size={24} color="#EC4899" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerWrapper}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: currentProfile?.color || "#EC4899" }]}
              onPress={handleChangeProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
              <View style={styles.changeProfileBadge}>
                <Ionicons name="swap-horizontal" size={16} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.mainTitle}>
              <Text style={{ color: theme.text }}>M</Text>ilky{" "}
              <Text style={{ color: theme.text }}>M</Text>ovies
            </Text>

            <TouchableOpacity onPress={handleChangeProfile} style={styles.profileContainer}>
              <Text style={styles.subtitle}>Perfil: {getDisplayName()}</Text>
              <Ionicons name="chevron-down" size={16} color="#EC4899" style={styles.dropdownIcon} />
            </TouchableOpacity>

            {profiles.length === 0 && (
              <TouchableOpacity
                style={styles.createProfileButton}
                onPress={handleChangeProfile}
              >
                <Text style={styles.createProfileText}>Criar Perfil</Text>
                <Ionicons name="add-circle-outline" size={16} color="#EC4899" />
              </TouchableOpacity>
            )}
          </View>

          {user?.id ? (
            <>
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Register", { userToEdit: user })
                    }
                  >
                    <Ionicons name="create-outline" size={20} color="#EC4899" />
                  </TouchableOpacity>
                </View>

                {[
                  { label: "Nome", value: `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Não informado" },
                  { label: "Email", value: user.email || "Não informado" },
                  { label: "Endereço", value: user.address || "Não informado" },
                  { label: "Telefone", value: user.phone || "Não informado" },
                ].map((item, idx) => (
                  <View key={idx} style={styles.infoItem}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoText}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Cartões</Text>
                  <TouchableOpacity onPress={() => setShowCardsModal(true)}>
                    <Ionicons name="card-outline" size={20} color="#EC4899" />
                  </TouchableOpacity>
                </View>

                {primaryCard ? (
                  <>
                    <View style={styles.primaryCardContainer}>
                      <View style={styles.primaryCardHeader}>
                        <Text style={styles.primaryCardTitle}>Cartão Principal</Text>
                        <View style={styles.primaryBadge}>
                          <Ionicons name="star" size={12} color="#fff" />
                          <Text style={styles.primaryBadgeText}>PRINCIPAL</Text>
                        </View>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Portador</Text>
                        <Text style={styles.infoText}>{primaryCard.nameCard}</Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Número</Text>
                        <Text style={styles.infoText}>{maskCardNumber(primaryCard.cardNumber)}</Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Validade</Text>
                        <Text style={styles.infoText}>
                          {formatCardExpiry(primaryCard.expiresDate)}
                        </Text>
                      </View>
                    </View>

                    {cardsToShow.length > 1 && (
                      <TouchableOpacity
                        style={styles.manageCardsButton}
                        onPress={() => setShowCardsModal(true)}
                      >
                        <Text style={styles.manageCardsText}>
                          Gerenciar {cardsToShow.length} cart{cardsToShow.length > 1 ? 'ões' : 'ão'}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#EC4899" />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.noCardContainer}>
                    <Ionicons name="card-outline" size={48} color="#6B7280" />
                    <Text style={styles.noCardText}>Nenhum cartão cadastrado</Text>
                  </View>
                )}

                <TouchableOpacity onPress={handleUpdateCard}>
                  <LinearGradient
                    colors={["#EC4899", "#D946EF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>
                      {primaryCard ? "Adicionar Novo Cartão" : "Cadastrar Cartão de Crédito"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={[styles.section, { marginBottom: 32 }]}>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Assinatura</Text>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Plano</Text>
                  <Text style={styles.infoText}>
                    {subscription ? getPlanInfo(subscription.plan, subscription.value).name : "Não informado"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Valor</Text>
                  <Text style={styles.infoText}>
                    {subscription ? getPlanInfo(subscription.plan, subscription.value).price : "R$ --"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text
                    style={{
                      color: subscription && isSubscriptionActive(subscription.expiresAt) ? "#10B981" : "#EF4444",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {subscription && isSubscriptionActive(subscription.expiresAt) ? "Ativa" : "Inativa"}
                  </Text>
                </View>

                {subscription && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Expira em</Text>
                    <Text style={styles.infoText}>
                      {new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ChangePlan", {
                      currentPlan: {
                        name: subscription ? getPlanInfo(subscription.plan, subscription.value).name : "",
                        price: subscription ? getPlanInfo(subscription.plan, subscription.value).price : "",
                      },
                    })
                  }
                >
                  <LinearGradient
                    colors={["#EC4899", "#D946EF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Trocar Plano de Assinatura</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {subscription && isSubscriptionActive(subscription.expiresAt) && (
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
                    <Text style={styles.buttonText}>Cancelar Assinatura</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.loadingText}>Nenhum usuário logado.</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal de Gerenciamento de Cartões */}
      <Modal
        visible={showCardsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCardsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gerenciar Cartões</Text>
            <TouchableOpacity
              onPress={() => setShowCardsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#EC4899" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {cardsToShow.map((card, index) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{card.nameCard}</Text>
                    {index === 0 && (
                      <View style={styles.primaryBadge}>
                        <Ionicons name="star" size={12} color="#fff" />
                        <Text style={styles.primaryBadgeText}>PRINCIPAL</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
                  <Text style={styles.cardExpiry}>
                    Válido até {formatCardExpiry(card.expiresDate)}
                  </Text>

                  {/* Debug info - remover depois */}
                  {__DEV__ && (
                    <Text style={styles.debugText}>ID: {card.id}</Text>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {index !== 0 && (
                    <TouchableOpacity
                      style={styles.setPrimaryButton}
                      onPress={() => setPrimaryCard(card.id)}
                    >
                      <Ionicons name="star-outline" size={16} color="#EC4899" />
                      <Text style={styles.setPrimaryText}>Definir como Principal</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.deleteButton, isDeleting && { opacity: 0.5 }]}
                    onPress={() => handleDeleteCard(card.id, card.cardNumber)}
                    disabled={isDeleting}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={styles.deleteText}>
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => {
                setShowCardsModal(false);
                handleUpdateCard();
              }}
            >
              <LinearGradient
                colors={["#EC4899", "#D946EF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCardGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addCardText}>Adicionar Novo Cartão</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  innerWrapper: {
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  changeProfileBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#374151",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111827",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  mainTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1F2937",
  },
  subtitle: {
    color: "#EC4899",
    fontSize: 18,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  createProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EC4899",
    borderStyle: "dashed",
  },
  createProfileText: {
    color: "#EC4899",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  section: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 2,
  },
  infoText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "500",
  },
  primaryCardContainer: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EC4899",
  },
  primaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryCardTitle: {
    color: "#F3F4F6",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  manageCardsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#374151",
    borderRadius: 8,
    marginBottom: 12,
  },
  manageCardsText: {
    color: "#EC4899",
    fontSize: 14,
    fontWeight: "500",
  },
  noCardContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noCardText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 8,
  },
  gradientButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#B91C1C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: "#374151",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    color: "#F3F4F6",
    textAlign: "center",
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#111827",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cardItem: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardName: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "600",
  },
  cardNumber: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 4,
  },
  cardExpiry: {
    color: "#6B7280",
    fontSize: 14,
  },
  debugText: {
    color: "#6B7280",
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  setPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  setPrimaryText: {
    color: "#EC4899",
    fontSize: 14,
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7F1D1D",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteText: {
    color: "#EF4444",
    fontSize: 14,
    marginLeft: 6,
  },
  addCardButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  addCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  addCardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardTypeOptions,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import * as themeConfig from "../theme";
import { SubscriptionSchema, SubscriptionType } from "../schemas/card";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { useUserStore } from "../store/userStore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCreateCard, useCardsByUser, useDeleteCard } from "../hooks/useCards";
import { useFindById } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSubscription, useUpdateSubscription } from "../hooks/useSubscription";

const theme = themeConfig.theme;

type Props = NativeStackScreenProps<RootStackParamList, "Subscription">;

interface Card {
  id: string;
  nameCard: string;
  cardNumber: string;
  expiresDate: string;
  securityCode: string;
  userId: string;
}

export default function SubscriptionScreen({ navigation, route }: Props) {
  const { userId, selectedPlan, isUpdate } = route.params;

  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const setSubscription = useUserStore((state) => state.setSubscription);

  // Hooks para cartões
  const { data: existingCards = [], refetch: refetchCards, isLoading: isLoadingCards } = useCardsByUser(userId);
  const createCard = useCreateCard();
  const deleteCardMutation = useDeleteCard();

  // Hooks para assinatura
  const createSubscription = useCreateSubscription(userId);
  const updateSubscription = useUpdateSubscription(userId);
  const { data: userData, isSuccess } = useFindById(userId);

  // Estados locais
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionType>({
    resolver: zodResolver(SubscriptionSchema),
  });

  // Decidir se mostra formulário ou lista de cartões
  useEffect(() => {
    if (existingCards.length === 0) {
      setShowNewCardForm(true);
    } else {
      setShowNewCardForm(false);
      // Selecionar primeiro cartão por padrão se nenhum estiver selecionado
      if (!selectedCardId) {
        setSelectedCardId(existingCards[0]?.id);
      }
    }
  }, [existingCards, selectedCardId]);

  console.log('🔍 SubscriptionScreen params:', { userId, selectedPlan, isUpdate });
  console.log('🔍 Existing cards:', existingCards);

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

  const maskCardNumber = (cardNumber: string) => {
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  const handleNewCard = async (data: SubscriptionType) => {
    try {
      setIsProcessing(true);

      if (!userData) throw new Error("Usuário não encontrado");

      const [month, year] = data.expiry.split("/");
      const expiresDate = new Date(Number(`20${year}`), Number(month) - 1);

      const cardPayload = {
        nameCard: `${userData.firstname} ${userData.lastname}`,
        cardNumber: data.cardNumber,
        securityCode: data.cvv,
        expiresDate: expiresDate.toISOString(),
        userId: userId,
      };

      console.log('🔄 Criando novo cartão:', cardPayload);
      const newCard = await createCard.mutateAsync(cardPayload);

      await refetchCards();

      // Se há um plano selecionado, processar assinatura
      if (selectedPlan) {
        await handleSubscription(selectedPlan);
      }

      Toast.show({
        type: "success",
        text1: "Cartão adicionado!",
        text2: "Cartão cadastrado com sucesso"
      });

      reset();
      setShowNewCardForm(false);

      // Se não há plano selecionado, voltar para perfil
      if (!selectedPlan) {
        navigation.goBack();
      }

    } catch (error: any) {
      console.error("❌ Erro ao criar cartão:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao adicionar cartão",
        text2: error?.response?.data?.message || "Verifique os dados preenchidos.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscription = async (plan: any) => {
    try {
      const subscriptionPayload = {
        plan: plan.code,
        value: Number(plan.price),
        userId: userId,
      };

      console.log('🔄 Processando assinatura:', subscriptionPayload);

      if (isUpdate) {
        await updateSubscription.mutateAsync(subscriptionPayload);
        Toast.show({
          type: "success",
          text1: "Assinatura atualizada!",
          text2: `Plano ${plan.name} ativado`
        });
      } else {
        await createSubscription.mutateAsync(subscriptionPayload);
        Toast.show({
          type: "success",
          text1: "Assinatura criada!",
          text2: `Bem-vindo ao ${plan.name}`
        });
      }

      // Atualizar store local
      if (userData) {
        const updatedSubscription = {
          planName: plan.name,
          planPrice: Number(plan.price),
          cardNumber: existingCards[0]?.cardNumber || "",
          expiry: existingCards[0] ? formatCardExpiry(existingCards[0].expiresDate) : "",
          isActive: true,
        };
        setSubscription(updatedSubscription);
      }

      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Navegar baseado no contexto
      if (isUpdate) {
        navigation.goBack(); // Voltar para perfil
      } else {
        navigation.reset({ index: 0, routes: [{ name: "ChooseProfile" }] });
      }

    } catch (error: any) {
      console.error("❌ Erro na assinatura:", error);
      Toast.show({
        type: "error",
        text1: "Erro na assinatura",
        text2: error?.response?.data?.message || "Tente novamente.",
      });
    }
  };

  const handleUseExistingCard = async () => {
    if (!selectedCardId) {
      Toast.show({
        type: "error",
        text1: "Selecione um cartão",
        text2: "Escolha um cartão para continuar"
      });
      return;
    }

    if (selectedPlan) {
      await handleSubscription(selectedPlan);
    } else {
      navigation.goBack();
    }
  };

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
              await refetchCards();

              // Se era o cartão selecionado, selecionar outro
              if (selectedCardId === cardId) {
                const remainingCards = existingCards.filter(card => card.id !== cardId);
                setSelectedCardId(remainingCards[0]?.id || null);
              }

              Toast.show({
                type: "success",
                text1: "Cartão excluído!",
                text2: "Cartão removido com sucesso"
              });

            } catch (error: any) {
              console.error("❌ Erro ao excluir cartão:", error);
              Toast.show({
                type: "error",
                text1: "Erro ao excluir",
                text2: error?.response?.data?.message || "Tente novamente"
              });
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    if (showNewCardForm && existingCards.length > 0) {
      // Se está no formulário e há cartões, voltar para lista
      setShowNewCardForm(false);
      reset();
    } else {
      // Senão, voltar para tela anterior
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Profile");
      }
    }
  };

  const fields: {
    name: keyof SubscriptionType;
    placeholder: string;
    keyboardType: KeyboardTypeOptions;
    maxLength: number;
  }[] = [
      { name: "cardNumber", placeholder: "Número do cartão", keyboardType: "numeric", maxLength: 16 },
      { name: "cvv", placeholder: "CVV", keyboardType: "numeric", maxLength: 3 },
      { name: "expiry", placeholder: "Validade (MM/AA)", keyboardType: "numeric", maxLength: 5 },
    ];

  if (isLoadingCards) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Carregando cartões...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="#EC4899" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.innerWrapper}>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>
              <Text style={{ color: theme.text }}>M</Text>ilky{" "}
              <Text style={{ color: theme.text }}>M</Text>ovies
            </Text>
            <Text style={styles.subtitle}>
              {showNewCardForm ? "Adicionar Cartão" : "Escolher Cartão"}
            </Text>
            {selectedPlan && (
              <View style={styles.planInfo}>
                <Text style={styles.planInfoText}>
                  Plano: {selectedPlan.name} - R$ {selectedPlan.price}/mês
                </Text>
              </View>
            )}
          </View>

          {showNewCardForm ? (
            // Formulário para novo cartão
            <>
              {fields.map((field) => (
                <View key={field.name}>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <TextInput
                          placeholder={field.placeholder}
                          placeholderTextColor="#6B7280"
                          style={styles.input}
                          keyboardType={field.keyboardType}
                          maxLength={field.maxLength}
                          value={value}
                          onChangeText={(text) => {
                            if (field.name === "expiry") {
                              const sanitized = text.replace(/[^0-9]/g, "");
                              if (sanitized.length === 2 && !text.includes("/")) {
                                onChange(`${sanitized}/`);
                              } else {
                                onChange(text);
                              }
                            } else {
                              onChange(text);
                            }
                          }}
                        />
                      </View>
                    )}
                  />
                  {errors[field.name] && (
                    <Text style={styles.errorText}>
                      {errors[field.name]?.message as string}
                    </Text>
                  )}
                </View>
              ))}

              <TouchableOpacity
                onPress={handleSubmit(handleNewCard)}
                disabled={isProcessing}
                style={[styles.gradientButtonContainer, isProcessing && { opacity: 0.6 }]}
              >
                <LinearGradient
                  colors={["#EC4899", "#D946EF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.subscribeButtonText}>
                      {selectedPlan ? "Finalizar Assinatura" : "Adicionar Cartão"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {existingCards.length > 0 && (
                <TouchableOpacity onPress={() => setShowNewCardForm(false)}>
                  <Text style={styles.cancelText}>
                    Usar cartão existente? <Text style={styles.cancelLink}>Ver cartões</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Lista de cartões existentes
            <>
              <View style={styles.cardsContainer}>
                <Text style={styles.cardsTitle}>
                  Cartões Cadastrados ({existingCards.length})
                </Text>

                {existingCards.map((card, index) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.cardItem,
                      selectedCardId === card.id && styles.selectedCard
                    ]}
                    onPress={() => setSelectedCardId(card.id)}
                  >
                    <View style={styles.cardInfo}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardName}>{card.nameCard}</Text>
                        {selectedCardId === card.id && (
                          <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
                      <Text style={styles.cardExpiry}>
                        Válido até {formatCardExpiry(card.expiresDate)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.deleteButton, isDeleting && { opacity: 0.5 }]}
                      onPress={() => handleDeleteCard(card.id, card.cardNumber)}
                      disabled={isDeleting}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleUseExistingCard}
                disabled={!selectedCardId || isProcessing}
                style={[
                  styles.gradientButtonContainer,
                  (!selectedCardId || isProcessing) && { opacity: 0.6 }
                ]}
              >
                <LinearGradient
                  colors={["#EC4899", "#D946EF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.subscribeButtonText}>
                      {selectedPlan ? "Usar Este Cartão" : "Continuar"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowNewCardForm(true)}>
                <Text style={styles.cancelText}>
                  Adicionar novo cartão? <Text style={styles.cancelLink}>Clique aqui</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerWrapper: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  mainTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  planInfo: {
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },
  planInfoText: {
    color: "#EC4899",
    fontSize: 14,
    fontWeight: "600",
  },
  // Estilos do formulário
  inputContainer: {
    backgroundColor: "#374151",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  input: {
    color: "white",
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#F44336",
    marginBottom: 8,
    marginHorizontal: 4,
    fontSize: 14,
  },
  // Estilos dos cartões
  cardsContainer: {
    marginBottom: 24,
  },
  cardsTitle: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  cardItem: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#374151",
  },
  selectedCard: {
    borderColor: "#EC4899",
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardName: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedBadge: {
    backgroundColor: "#EC4899",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardNumber: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 4,
  },
  cardExpiry: {
    color: "#6B7280",
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: "#7F1D1D",
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  // Estilos dos botões
  gradientButtonContainer: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  cancelLink: {
    color: theme.text,
    fontWeight: "bold",
  },
});
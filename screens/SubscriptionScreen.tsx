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
    defaultValues: {
      cardNumber: "",
      cvv: "",
      expiry: "",
    },
  });

  // Decidir se mostra formulário ou lista de cartões
  useEffect(() => {
    console.log('🔍 SubscriptionScreen context analysis:', {
      userId,
      selectedPlan: selectedPlan ? { name: selectedPlan.name, code: selectedPlan.code } : null,
      isUpdate,
      existingCardsCount: existingCards.length,
      context: selectedPlan ? 'Cadastro/Assinatura' : 'Perfil/Adição de cartão'
    });

    if (existingCards.length === 0) {
      setShowNewCardForm(true);
    } else {
      setShowNewCardForm(false);
      // Selecionar primeiro cartão por padrão se nenhum estiver selecionado
      if (!selectedCardId) {
        setSelectedCardId(existingCards[0]?.id);
      }
    }
  }, [existingCards, selectedCardId, selectedPlan, isUpdate, userId]);

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

      // Lógica da data (mantém igual)
      const [month, year] = data.expiry.split("/");
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(`20${year}`, 10);

      if (monthNum < 1 || monthNum > 12) {
        throw new Error("Mês inválido. Use formato MM/AA");
      }

      if (yearNum < new Date().getFullYear()) {
        throw new Error("Ano não pode ser no passado");
      }

      // Criar data corretamente - último dia do mês
      const lastDayOfMonth = new Date(yearNum, monthNum, 0).getDate();
      const expiresDate = new Date(yearNum, monthNum - 1, lastDayOfMonth, 23, 59, 59);

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

      Toast.show({
        type: "success",
        text1: "Cartão adicionado!",
        text2: "Cartão cadastrado com sucesso"
      });

      reset();
      setShowNewCardForm(false);

      // CORREÇÃO: Lógica de navegação baseada no contexto
      if (selectedPlan) {
        // Se há plano selecionado, é um fluxo de cadastro/assinatura
        console.log('🎯 Fluxo de cadastro/assinatura - processando assinatura');
        await handleSubscription(selectedPlan);
      } else {
        // Se não há plano, é apenas adição de cartão do perfil
        console.log('🎯 Fluxo de perfil - voltando para perfil');
        navigation.navigate("Profile");
      }

    } catch (error: any) {
      console.error("❌ Erro ao criar cartão:", error);

      let errorMessage = "Verifique os dados preenchidos.";

      if (error.message?.includes("Mês inválido") || error.message?.includes("Ano não pode")) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        const apiMessage = error.response.data.message;
        errorMessage = Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage;
      }

      Toast.show({
        type: "error",
        text1: "Erro ao adicionar cartão",
        text2: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscription = async (plan: any) => {
    try {
      console.log('🔍 Plan object details:', {
        selectedPlan: plan,
        planCode: plan?.code,
        planCodeType: typeof plan?.code,
      });

      // Validar se o plano tem as propriedades necessárias
      if (!plan || !plan.code || !plan.price) {
        throw new Error("Dados do plano inválidos");
      }

      // Converter para minúsculo para bater com o enum do Prisma
      let planCode = plan.code.toString().toLowerCase().trim();

      // Mapear possíveis variações para os valores corretos
      const planMapping: { [key: string]: string } = {
        'basic': 'basic',
        'basico': 'basic',
        'intermediary': 'intermediary',
        'intermediario': 'intermediary',
        'padrão': 'intermediary',
        'padrao': 'intermediary',
        'complete': 'complete',
        'completo': 'complete',
        'premium': 'complete'
      };

      planCode = planMapping[planCode] || planCode;

      // Verificar se o plano é válido
      const validPlans = ['basic', 'intermediary', 'complete'];
      if (!validPlans.includes(planCode)) {
        throw new Error(`Plano inválido: ${plan.code}. Planos aceitos: ${validPlans.join(', ')}`);
      }

      const subscriptionPayload = {
        plan: planCode,
        value: Number(plan.price),
        userId: userId,
      };

      console.log('🔄 Payload antes do envio:', {
        originalPlan: plan.code,
        transformedPlan: planCode,
        finalPayload: subscriptionPayload,
        planType: typeof subscriptionPayload.plan,
        validPlans: validPlans
      });

      if (isUpdate) {
        console.log('🔄 Atualizando assinatura...');
        await updateSubscription.mutateAsync(subscriptionPayload);
        Toast.show({
          type: "success",
          text1: "Assinatura atualizada!",
          text2: `Plano ${plan.name} ativado`
        });
      } else {
        console.log('🔄 Criando nova assinatura...');
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

      // CORREÇÃO: Navegação baseada no contexto
      if (isUpdate) {
        // Atualização de plano - voltar para perfil
        console.log('🎯 Atualização concluída - voltando para perfil');
        navigation.goBack();
      } else {
        // Novo cadastro - ir para escolha de perfil (ou home)
        console.log('🎯 Novo cadastro concluído - indo para ChooseProfile');
        navigation.reset({
          index: 0,
          routes: [{ name: "ChooseProfile" }]
        });
      }

    } catch (error: any) {
      console.error("❌ Erro na assinatura:", error);
      console.error("❌ Error response:", error?.response?.data);

      let errorMessage = "Tente novamente.";
      if (error.message?.includes("Plano inválido")) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        const apiMessage = error.response.data.message;
        errorMessage = Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage;
      }

      Toast.show({
        type: "error",
        text1: "Erro na assinatura",
        text2: errorMessage,
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

    // CORREÇÃO: Mesma lógica de contexto
    if (selectedPlan) {
      console.log('🎯 Usando cartão existente para assinatura');
      await handleSubscription(selectedPlan);
    } else {
      console.log('🎯 Seleção de cartão do perfil - voltando');
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
    console.log('🔙 HandleGoBack context:', {
      showNewCardForm,
      existingCardsCount: existingCards.length,
      selectedPlan: selectedPlan ? selectedPlan.name : null,
      canGoBack: navigation.canGoBack()
    });

    if (showNewCardForm && existingCards.length > 0) {
      // Se está no formulário e há cartões, voltar para lista
      console.log('🔙 Voltando do formulário para lista de cartões');
      setShowNewCardForm(false);
      reset();
    } else {
      // Senão, voltar para tela anterior
      console.log('🔙 Voltando para tela anterior');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Profile");
      }
    }
  };

  const formatCardNumberInput = (text: string) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, '');
    return cleaned;
  };

  const formatCvvInput = (text: string) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, '');
    return cleaned;
  };

  const formatExpiryInput = (text: string) => {
    // Remover caracteres não numéricos
    const sanitized = text.replace(/[^0-9]/g, "");

    let formatted = sanitized;

    // Adicionar barra automaticamente após 2 dígitos
    if (sanitized.length >= 2) {
      formatted = `${sanitized.slice(0, 2)}/${sanitized.slice(2, 4)}`;
    }

    // Validação em tempo real para o mês
    if (sanitized.length >= 2) {
      const month = parseInt(sanitized.slice(0, 2), 10);
      if (month < 1 || month > 12) {
        // Se o mês for inválido, não permitir
        return text.slice(0, -1); // Remove o último caractere
      }
    }

    return formatted;
  };

  const fields: {
    name: keyof SubscriptionType;
    placeholder: string;
    keyboardType: KeyboardTypeOptions;
    maxLength: number;
    formatter?: (text: string) => string;
  }[] = [
      {
        name: "cardNumber",
        placeholder: "Número do cartão (16 dígitos)",
        keyboardType: "numeric",
        maxLength: 16,
        formatter: formatCardNumberInput
      },
      {
        name: "cvv",
        placeholder: "CVV (3 dígitos)",
        keyboardType: "numeric",
        maxLength: 3,
        formatter: formatCvvInput
      },
      {
        name: "expiry",
        placeholder: "Validade (MM/AA)",
        keyboardType: "numeric",
        maxLength: 5,
        formatter: formatExpiryInput
      },
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
                            const formatted = field.formatter ? field.formatter(text) : text;
                            onChange(formatted);
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
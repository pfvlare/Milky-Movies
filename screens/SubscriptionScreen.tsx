import React from "react";
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
import { useCreateCard } from "../hooks/useCards";
import { useFindById } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSubscription } from "../hooks/useSubscription";

const theme = themeConfig.theme;

type Props = NativeStackScreenProps<RootStackParamList, "Subscription">;

export default function SubscriptionScreen({ navigation, route }: Props) {
  const { userId, selectedPlan } = route.params;

  const queryClient = useQueryClient();
  const createCard = useCreateCard();
  const registerPlan = useCreateSubscription(userId)
  const setSubscription = useUserStore((state) => state.setSubscription);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionType>({
    resolver: zodResolver(SubscriptionSchema),
  });

  const onSubmit = async (data: SubscriptionType) => {
    try {
      if (selectedPlan) {
        await registerPlan.mutateAsync({
          plan: selectedPlan.code,
          value: selectedPlan.price,
          userId: userId,
        });
      }

      const { data: user, isSuccess } = useFindById(userId);

      const [month, year] = data.expiry.split("/");
      const expiresDate = new Date(Number(`20${year}`), Number(month) - 1);

      const payload = {
        nameCard: `${user?.firstname} ${user?.lastname}`,
        cardNumber: data.cardNumber,
        securityCode: data.cvv,
        expiresDate: expiresDate.toISOString(),
        userId: userId,
      };

      await createCard.mutateAsync(payload);

      const updated = {
        ...user,
        isSubscribed: true,
        subscription: {
          planName: user.subscription?.plan,
          planPrice: user.subscription?.value || 0,
          cardNumber: data.cardNumber,
          expiry: data.expiry,
          isActive: true,
        },
      };

      if (isSuccess || registerPlan.isSuccess) {
        setSubscription(updated.subscription);
        Toast.show({ type: "success", text1: "Cartão registrado com sucesso!" });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        navigation.reset({ index: 0, routes: [{ name: "ChooseProfile" }] });
      }

    } catch (e: any) {
      console.error("❌ Subscription error:", e);
      Toast.show({
        type: "error",
        text1: "Erro ao registrar cartão",
        text2: e?.response?.data?.message || "Verifique os dados preenchidos.",
      });
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

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("Splash");
        }}
      >
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
            <Text style={styles.subtitle}>Assinatura</Text>
          </View>

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

          <LinearGradient
            colors={["#EC4899", "#D946EF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <TouchableOpacity onPress={handleSubmit(onSubmit)}>
              <Text style={styles.subscribeButtonText}>Assinar</Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>
              Cancelar? <Text style={styles.cancelLink}>Voltar ao login</Text>
            </Text>
          </TouchableOpacity>
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
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 18,
  },
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
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 4,
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

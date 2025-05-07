import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import * as themeConfig from "../theme";
import { useRoute, RouteProp } from "@react-navigation/native";
import { registerCard } from "../api/services/card/register";
import { SubscriptionSchema, SubscriptionType } from "../schemas/card";

const theme = themeConfig.theme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
  },
  scrollContainer: {
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
  },
  input: {
    color: "white",
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#F44336",
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: theme.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
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
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 16 : 8,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
});

export default function SubscriptionScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionType>({ resolver: zodResolver(SubscriptionSchema) });

  const [showMenu, setShowMenu] = useState(false);

  type SubscriptionScreenRouteProp = RouteProp<{ params: { userId: string } }, 'params'>;
  const route = useRoute<SubscriptionScreenRouteProp>();
  const { userId } = route.params;

  const onSubmit = async (data: SubscriptionType) => {
    try {
      if (!userId) {
        Alert.alert("Erro", "Usuário não identificado.");
        return;
      }

      const [month, year] = data.expiry.split("/");
      const expiryDate = new Date(Number(`20${year}`), Number(month) - 1);

      await registerCard({
        cardNumber: data.cardNumber,
        securityCode: data.cvv,
        expiresDate: expiryDate.toISOString(),
        nameCard: "Cartão Principal",
        userId: userId,
      });

      const userData = await AsyncStorage.getItem("@user");
      const parsedUser = userData ? JSON.parse(userData) : {};
      const updatedUser = { ...parsedUser, isSubscribed: true };

      await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("@isLoggedIn", "true");

      Alert.alert("Assinatura confirmada", "Você já pode acessar os filmes!");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível processar a assinatura.");
      console.error("❌ Subscription error:", e);
    }
  };

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={30} color="white" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            <Text style={{ color: theme.text }}>M</Text>ilky{" "}
            <Text style={{ color: theme.text }}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>Assinatura</Text>
        </View>

        {[
          {
            name: "cardNumber",
            placeholder: "Número do cartão",
            keyboardType: "numeric",
            maxLength: 16,
          },
          {
            name: "cvv",
            placeholder: "CVV",
            keyboardType: "numeric",
            maxLength: 3,
          },
          {
            name: "expiry",
            placeholder: "Validade (MM/AA)",
            keyboardType: "numeric",
            maxLength: 5,
          },
        ].map((field: { name: "cardNumber" | "cvv" | "expiry"; placeholder: string; keyboardType: string; maxLength: number }) => (
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
                    keyboardType={field.keyboardType as KeyboardTypeOptions}
                    maxLength={field.maxLength}
                    value={value}
                    onChangeText={(text) => {
                      if (field.name === "expiry") {
                        if (text.length === 2 && !text.includes("/")) {
                          onChange(text + "/");
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
              <Text style={styles.errorText}>{errors[field.name]?.message}</Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.subscribeButtonText}>Assinar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.cancelText}>
            Cancelar? <Text style={styles.cancelLink}>Voltar ao login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

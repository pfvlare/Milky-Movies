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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import * as themeConfig from "../theme";

const theme = themeConfig.theme;

// ✅ Esquema de validação (senha removida)
const schema = yup.object().shape({
  cardNumber: yup
    .string()
    .required("Número do cartão é obrigatório")
    .length(16, "O número do cartão deve ter 16 dígitos"),
  cvv: yup
    .string()
    .required("CVV é obrigatório")
    .length(3, "O CVV deve ter exatamente 3 dígitos"),
  expiry: yup
    .string()
    .required("Data de validade é obrigatória")
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Formato inválido (MM/AA)"),
});

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
  } = useForm({ resolver: yupResolver(schema) });

  const [showMenu, setShowMenu] = useState(false);

  const onSubmit = async (data) => {
    try {
      const userData = await AsyncStorage.getItem("@user");
      if (!userData) return;

      const updatedUser = {
        ...JSON.parse(userData),
        isSubscribed: true,
        subscription: {
          cardNumber: data.cardNumber,
          cvv: data.cvv,
          expiry: data.expiry,
        },
      };

      await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("@isLoggedIn", "true");

      Alert.alert("Assinatura confirmada", "Você já pode acessar os filmes!");
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível processar a assinatura.");
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

        {/* Campos do cartão */}
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
        ].map((field) => (
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
              <Text style={styles.errorText}>
                {errors[field.name].message}
              </Text>
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

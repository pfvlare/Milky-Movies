import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Telas
import WelcomeScreen from "../screens/WelcomeScreen"; // nova
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import HomeScreen from "../screens/HomeScreen";
import MovieScreen from "../screens/MovieScreen";
import PersonScreen from "../screens/PersonScreen";
import SearchScreen from "../screens/SearchScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChoosePlanScreen from "../screens/ChoosePlanScreen";
import ChangePlanScreen from "../screens/ChangePlanScreen";
import ConfirmCardScreen from "../screens/ConfirmCardScreen";

// Tipo de plano
export type Plan = {
  id: string;
  name: string;
  price: string;
};

// Navegação com rotas tipadas
export type RootStackParamList = {
  Welcome: undefined; // nova
  Splash: undefined;
  Login: undefined;
  Register: { selectedPlan: Plan };
  Subscription: { userId: string };
  Home: undefined;
  Movie: { id: string };
  Person: { id: string };
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
  ChoosePlan: undefined;
  ChangePlan: undefined;
  ConfirmCard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationProps = {
  initialRoute?: keyof RootStackParamList;
};

const Navigation = ({ initialRoute = "Welcome" }: NavigationProps) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Movie" component={MovieScreen} />
        <Stack.Screen name="Person" component={PersonScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
        <Stack.Screen name="ChangePlan" component={ChangePlanScreen} />
        <Stack.Screen name="ConfirmCard" component={ConfirmCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Subscription: { userId: string };
  Home: undefined;
  Movie: { id: string };
  Person: { id: string };
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};


export default function Navigation({ initialRoute = "Splash" }: { initialRoute?: keyof RootStackParamList }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        {...({} as any)}
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

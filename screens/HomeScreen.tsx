import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import TrendingMovies from "../components/trendingMovies";
import MovieList from "../components/movieList";
import Loading from "../components/loading";
import * as themeConfig from "../theme";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import AppLayout from "../components/AppLayout";
import MenuModal from "../components/MenuModal";
import { useTrendingMovies } from "../hooks/useMovies";
import Toast from "react-native-toast-message";

const theme = themeConfig.theme;

const hiddenMenuRoutes = ["Login", "Register", "Splash", "Subscription"];

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mainTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  pinkText: {
    color: theme.text,
  },
  searchButton: {
    padding: 8,
  },
  scrollContainer: {
    paddingBottom: 10,
  },
});

type RootStackParamList = {
  Search: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [showMenu, setShowMenu] = useState(false);

  const route = useRoute();
  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  const { data, isLoading, error } = useTrendingMovies();

  if (error) {
    Toast.show({
      type: "error",
      text1: error.message || "Erro ao carregar filmes",
    });
  }

  const handleMenu = () => setShowMenu(!showMenu);

  return (
    <AppLayout>
      <View style={localStyles.container}>
        <View style={localStyles.header}>
          <TouchableOpacity
            style={localStyles.menuButton}
            onPress={handleMenu}
            disabled={!shouldShowMenu}
          >
            {shouldShowMenu ? (
              <Ionicons name="menu-outline" size={30} color="white" />
            ) : (
              <View style={{ width: 30 }} />
            )}
          </TouchableOpacity>

          <View style={localStyles.titleContainer}>
            <Text style={localStyles.mainTitle}>
              <Text style={localStyles.pinkText}>M</Text>ilky{" "}
              <Text style={localStyles.pinkText}>M</Text>ovies
            </Text>
          </View>

          <TouchableOpacity
            style={localStyles.searchButton}
            onPress={() => navigation.navigate("Search")}
          >
            <Ionicons name="search-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />

        {showMenu && shouldShowMenu && (
          <MenuModal visible={showMenu} trigger={handleMenu} onClose={undefined} />
        )}

        {isLoading ? (
          <Loading />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.scrollContainer}
          >
            {data?.results?.length > 0 && <TrendingMovies data={data.results} />}
            <MovieList title="Lançamentos" data={[]} hiddenSeeAll={undefined} />
            <MovieList title="Mais Assistidos" data={[]} hiddenSeeAll={undefined} />
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}

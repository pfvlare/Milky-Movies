import { View, Text, TouchableOpacity, ScrollView, Pressable, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { MagnifyingGlassIcon, Bars3Icon } from "react-native-heroicons/outline";

import { styles } from "../theme";
import TrendingMovies from "../components/trendingMovies";
import MovieList from "../components/movieList";
import Loading from "../components/loading";
import {
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
} from "../api/moviedb";

import * as themeConfig from "../theme";
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

export default function HomeScreen() {
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  useEffect(() => {
    getTrendingMovies();
    getUpcomingMovies();
    getTopRatedMovies();
  }, []);

  const getTrendingMovies = async () => {
    const data = await fetchTrendingMovies();
    if (data?.results) setTrending(data.results);
    setLoading(false);
  };

  const getUpcomingMovies = async () => {
    const data = await fetchUpcomingMovies();
    if (data?.results) setUpcoming(data.results);
  };

  const getTopRatedMovies = async () => {
    const data = await fetchTopRatedMovies();
    if (data?.results) setTopRated(data.results);
  };

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

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
          <MenuModal visible={showMenu} trigger={handleMenu} />
        )}

        {loading ? (
          <Loading />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.scrollContainer}
          >
            {trending.length > 0 && <TrendingMovies data={trending} />}
            <MovieList title="Lançamentos" data={upcoming} />
            <MovieList title="Mais Assistidos" data={topRated} />
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}

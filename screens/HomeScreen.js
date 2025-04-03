import { View, Text, TouchableOpacity, ScrollView, Pressable } from "react-native";
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
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import MenuModal from "../components/MenuModal";


import AppLayout from "../components/AppLayout";

const hiddenMenuRoutes = ["Login", "Register", "Splash", "Subscription"];

export default function HomeScreen() {
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  const [showMenu, setShowMenu] = useState(false);

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

  const navigation = useNavigation();

  useEffect(() => {
    getTrendingMovies();
    getUpcomingMovies();
    getTopRatedMovies();
  }, []);

  const getTrendingMovies = async () => {
    const data = await fetchTrendingMovies();
    if (data && data.results) setTrending(data.results);
    setLoading(false);
  };

  const getUpcomingMovies = async () => {
    const data = await fetchUpcomingMovies();
    if (data && data.results) setUpcoming(data.results);
  };

  const getTopRatedMovies = async () => {
    const data = await fetchTopRatedMovies();
    if (data && data.results) setTopRated(data.results);
  };

  return (
    <AppLayout>
      <View className="flex-row justify-between items-center mx-4 mt-5 mb-3">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleMenu}>
            <Bars3Icon size={30} strokeWidth={2} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">
            <Text style={styles.text}>M</Text>ilky{" "}
            <Text style={styles.text}>M</Text>ovies
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <MagnifyingGlassIcon size={30} strokeWidth={2} color="white" />
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />

      {shouldShowMenu && showMenu && (
        <MenuModal visible={showMenu} trigger={handleMenu} />
      )}

      {loading ? (
        <Loading />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {trending.length > 0 && <TrendingMovies data={trending} />}
          <MovieList title="Lançamentos" data={upcoming} />
          <MovieList title="Mais Assistidos" data={topRated} />
        </ScrollView>
      )}
    </AppLayout>
  );
}

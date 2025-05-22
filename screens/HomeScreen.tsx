import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import TrendingMovies from "../components/trendingMovies";
import MovieList from "../components/movieList";
import Loading from "../components/loading";
import * as themeConfig from "../theme";
import AppLayout from "../components/AppLayout";
import MenuModal from "../components/MenuModal";
import {
  useTopRatedMovies,
  useTrendingMovies,
  useUpcomingMovies,
} from "../hooks/useMovies";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/Navigation";
import { useUserStore } from "../store/userStore";

const theme = themeConfig.theme;

const styles = StyleSheet.create({
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

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation, route }: Props) {
  const [showMenu, setShowMenu] = useState(false);

  const user = useUserStore((state) => state.user);
  const currentProfileId = user?.currentProfileId;

  const { data: trendingMovies, isLoading, error } = useTrendingMovies();
  const { data: upcomingMovies } = useUpcomingMovies();
  const { data: topRatedMovies } = useTopRatedMovies();

  const hiddenMenuRoutes = ["Login", "Register", "Splash", "Subscription"];
  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  if (error) {
    Toast.show({
      type: "error",
      text1: error.message || "Erro ao carregar filmes",
    });
  }

  const handleMenu = () => setShowMenu((prev) => !prev);

  const handleSeeAll = (title: string, data: any[]) => {
    navigation.navigate("MovieListScreen" as never, { title, data } as never);
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenu}
            disabled={!shouldShowMenu}
          >
            {shouldShowMenu ? (
              <Ionicons name="menu-outline" size={30} color="white" />
            ) : (
              <View style={{ width: 30 }} />
            )}
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              <Text style={styles.pinkText}>M</Text>ilky{" "}
              <Text style={styles.pinkText}>M</Text>ovies
            </Text>
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate("Search")}
          >
            <Ionicons name="search-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />

        {showMenu && shouldShowMenu && (
          <MenuModal
            visible={showMenu}
            trigger={handleMenu}
            onClose={undefined}
            navigation={navigation}
          />
        )}

        {isLoading ? (
          <Loading />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {trendingMovies?.results?.length > 0 && (
              <TrendingMovies
                data={trendingMovies.results}
                navigation={navigation}
              />
            )}

            {upcomingMovies?.results?.length > 0 && (
              <MovieList
                title="Lançamentos"
                data={upcomingMovies.results}
                hiddenSeeAll={false}
                navigation={navigation}
                onSeeAll={() =>
                  handleSeeAll("Lançamentos", upcomingMovies.results)
                }
              />
            )}

            {topRatedMovies?.results?.length > 0 && (
              <MovieList
                title="Mais Assistidos"
                data={topRatedMovies.results}
                hiddenSeeAll={false}
                navigation={navigation}
                onSeeAll={() =>
                  handleSeeAll("Mais Assistidos", topRatedMovies.results)
                }
              />
            )}
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}

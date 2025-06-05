import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import TrendingMovies from "../components/trendingMovies";
import MovieList from "../components/movieList";
import * as themeConfig from "../theme";
import AppLayout from "../components/AppLayout";
import MenuModal from "../components/MenuModal";
import {
  useTopRatedMovies,
  useTrendingMovies,
  useUpcomingMovies,
} from "../hooks/useMovies";
import { useProfiles } from "../hooks/useProfiles";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/NavigationTypes";
import { useUserStore } from "../store/userStore";

const theme = themeConfig.theme;
const { width } = Dimensions.get('window');

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
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mainTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pinkText: {
    color: theme.text,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  welcomeText: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  profileName: {
    color: theme.text,
    fontWeight: "600",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: "#F3F4F6",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  loadingSubtext: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  errorIcon: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  retryGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyStateIcon: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  emptyStateTitle: {
    color: "#F3F4F6",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyStateGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation, route }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const user = useUserStore((state) => state.user);
  const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);

  // Buscar perfis
  const { data: profiles = [] } = useProfiles(user?.id);

  // Hooks para buscar filmes
  const trendingQuery = useTrendingMovies();
  const upcomingQuery = useUpcomingMovies();
  const topRatedQuery = useTopRatedMovies();

  // Estados calculados
  const isLoading = trendingQuery.isLoading || upcomingQuery.isLoading || topRatedQuery.isLoading;
  const hasError = trendingQuery.error || upcomingQuery.error || topRatedQuery.error;
  const hasData = (trendingQuery.data?.results?.length || 0) > 0 ||
    (upcomingQuery.data?.results?.length || 0) > 0 ||
    (topRatedQuery.data?.results?.length || 0) > 0;

  // Encontrar perfil atual
  const currentProfile = profiles.find((p) => p.id === user?.currentProfileId) || profiles[0];

  // Auto-definir perfil se necessário
  useEffect(() => {
    if (profiles.length > 0 && !user?.currentProfileId) {
      const firstProfile = profiles[0];
      console.log("🔄 Auto-definindo perfil:", firstProfile.name);
      setCurrentProfile(firstProfile.id);
    }
  }, [profiles, user?.currentProfileId, setCurrentProfile]);

  // Debug
  console.log('🏠 HomeScreen Status:', {
    isLoading,
    hasError: !!hasError,
    hasData,
    trendingCount: trendingQuery.data?.results?.length || 0,
    upcomingCount: upcomingQuery.data?.results?.length || 0,
    topRatedCount: topRatedQuery.data?.results?.length || 0,
    currentProfile: currentProfile?.name,
  });

  const hiddenMenuRoutes = ["Login", "Register", "Splash", "Subscription"];
  const shouldShowMenu = !hiddenMenuRoutes.includes(route.name);

  const handleMenu = () => {
    console.log('🔄 Toggle menu, current state:', showMenu);
    setShowMenu((prev) => !prev);
  };

  const handleCloseMenu = () => {
    console.log('🔄 Fechando menu via callback');
    setShowMenu(false);
  };

  const handleSeeAll = (title: string, data: any[]) => {
    navigation.navigate("MovieListScreen", { title, data } as never);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        trendingQuery.refetch(),
        upcomingQuery.refetch(),
        topRatedQuery.refetch()
      ]);
      Toast.show({
        type: "success",
        text1: "✨ Atualizado!",
        text2: "Conteúdo mais recente carregado"
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar",
        text2: "Verifique sua conexão"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Se não há usuário
  if (!user?.id) {
    return (
      <AppLayout>
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="person-outline" size={64} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyStateTitle}>Bem-vindo ao Milky Movies!</Text>
          <Text style={styles.emptyStateText}>
            Faça login para descobrir milhares de filmes e criar sua lista personalizada de favoritos.
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate("Welcome")}
          >
            <LinearGradient
              colors={["#EC4899", "#D946EF"]}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.emptyStateButtonText}>Fazer Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenu}
            disabled={!shouldShowMenu}
          >
            {shouldShowMenu ? (
              <Ionicons name="menu-outline" size={28} color="white" />
            ) : (
              <View style={{ width: 28 }} />
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
            <Ionicons name="search-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            {getGreeting()}, {currentProfile?.name || user?.firstname || 'Usuário'}! 👋
          </Text>
          <Text style={styles.profileText}>
            O que você gostaria de assistir hoje?
          </Text>
        </View>

        <StatusBar style="light" />

        {/* Menu Modal */}
        {shouldShowMenu && (
          <MenuModal
            visible={showMenu}
            onClose={handleCloseMenu}
            navigation={navigation}
          />
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Carregando seus filmes...</Text>
            <Text style={styles.loadingSubtext}>Buscando o melhor conteúdo para você</Text>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="warning-outline" size={64} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>Ops! Algo deu errado</Text>
            <Text style={styles.errorSubtext}>
              Não conseguimos carregar os filmes no momento.{'\n'}
              Verifique sua conexão e tente novamente.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <LinearGradient
                colors={["#EC4899", "#D946EF"]}
                style={styles.retryGradient}
              >
                <Ionicons name="refresh-outline" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#EC4899"
                colors={["#EC4899"]}
                title="Atualizando..."
                titleColor="#9CA3AF"
              />
            }
          >
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate("Favorites")}
              >
                <Ionicons name="heart-outline" size={16} color="#EC4899" />
                <Text style={styles.quickActionText}>Favoritos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate("Search")}
              >
                <Ionicons name="search-outline" size={16} color="#EC4899" />
                <Text style={styles.quickActionText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            {hasData && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {trendingQuery.data?.results?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Em Alta</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {upcomingQuery.data?.results?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Lançamentos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {topRatedQuery.data?.results?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Top Rated</Text>
                </View>
              </View>
            )}

            {/* Trending Movies */}
            {trendingQuery.data?.results?.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>🔥 Em Alta</Text>
                    <Text style={styles.sectionSubtitle}>Os mais populares hoje</Text>
                  </View>
                </View>
                <TrendingMovies
                  data={trendingQuery.data.results}
                  navigation={navigation}
                />
              </>
            )}

            {/* Upcoming Movies */}
            {upcomingQuery.data?.results?.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>🎬 Lançamentos</Text>
                    <Text style={styles.sectionSubtitle}>Próximos filmes nos cinemas</Text>
                  </View>
                </View>
                <MovieList
                  title=""
                  data={upcomingQuery.data.results}
                  hiddenSeeAll={false}
                  navigation={navigation}
                  onSeeAll={() =>
                    handleSeeAll("Lançamentos", upcomingQuery.data.results)
                  }
                />
              </>
            )}

            {/* Top Rated Movies */}
            {topRatedQuery.data?.results?.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>⭐ Mais Assistidos</Text>
                    <Text style={styles.sectionSubtitle}>Os melhores avaliados</Text>
                  </View>
                </View>
                <MovieList
                  title=""
                  data={topRatedQuery.data.results}
                  hiddenSeeAll={false}
                  navigation={navigation}
                  onSeeAll={() =>
                    handleSeeAll("Mais Assistidos", topRatedQuery.data.results)
                  }
                />
              </>
            )}

            {!hasData && !isLoading && !hasError && (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="film-outline" size={64} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyStateTitle}>Nada por aqui ainda</Text>
                <Text style={styles.emptyStateText}>
                  Não conseguimos encontrar filmes no momento.{'\n'}
                  Que tal tentar novamente?
                </Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleRefresh}>
                  <LinearGradient
                    colors={["#EC4899", "#D946EF"]}
                    style={styles.emptyStateGradient}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#fff" />
                    <Text style={styles.emptyStateButtonText}>Recarregar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}
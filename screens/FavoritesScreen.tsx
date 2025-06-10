import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppLayout from "../components/AppLayout";
import { image185, fallBackMoviePoster, formatRating } from "../hooks/useMovies";
import { useFavorites } from "../hooks/useFavorites";

const { width, height } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  rightControls: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  syncButton: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 0.4)",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  mainTitle: {
    color: "#F3F4F6",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  pinkText: {
    color: "#EC4899",
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
    alignSelf: "center",
  },
  syncStatusText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#EC4899",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  movieItem: {
    width: ITEM_WIDTH,
    marginBottom: 24,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#374151",
  },
  posterContainer: {
    position: "relative",
    width: "100%",
    height: height * 0.28,
  },
  poster: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#374151",
  },
  favoriteOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(236, 72, 153, 0.9)",
    padding: 6,
    borderRadius: 16,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 18,
  },
  movieYear: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  addedDate: {
    color: "#6B7280",
    fontSize: 11,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(55, 65, 81, 0.8)",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  actionButtonText: {
    color: "#D1D5DB",
    fontSize: 11,
    fontWeight: "600",
  },
  removeButtonText: {
    color: "#EF4444",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  emptyTitle: {
    color: "#F3F4F6",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 16,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 120,
  },
  emptyButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "rgba(55, 65, 81, 0.8)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  secondaryButtonText: {
    color: "#F3F4F6",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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
  },
});

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const {
    favorites,
    loading,
    syncLoading,
    loadFavorites,
    removeFavorite,
    clearAllFavorites,
    syncWithBackend
  } = useFavorites();

  const handleRefresh = async () => {
    await loadFavorites();
  };

  const confirmRemoveFavorite = (movie: any) => {
    Alert.alert(
      "Remover dos Favoritos",
      `Tem certeza que deseja remover "${movie.title}" dos seus favoritos?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removeFavorite(movie.id),
        },
      ]
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      "Limpar Favoritos",
      "Tem certeza que deseja remover todos os filmes dos favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar Tudo",
          style: "destructive",
          onPress: clearAllFavorites,
        },
      ]
    );
  };

  const shareFavorites = async () => {
    try {
      const movieTitles = favorites.map(fav => fav.title).join('\n• ');
      await Share.share({
        message: `Meus filmes favoritos no Milky Movies:\n\n• ${movieTitles}`,
        title: "Meus Favoritos - Milky Movies",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const goToMovie = (movie: any) => {
    navigation.navigate("Movie" as never, movie as never);
  };

  const goToSearch = () => {
    navigation.navigate("Search" as never);
  };

  const goToHome = () => {
    navigation.navigate("Home" as never);
  };

  const getMovieYear = (releaseDate?: string) => {
    if (!releaseDate) return '';
    try {
      return new Date(releaseDate).getFullYear().toString();
    } catch {
      return '';
    }
  };

  const formatAddedDate = (timestamp?: number) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Hoje';
      if (diffDays === 2) return 'Ontem';
      if (diffDays <= 7) return `${diffDays} dias atrás`;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const renderMovieItem = ({ item, index }: { item: any; index: number }) => (
    <View
      style={[
        styles.movieItem,
        { marginRight: index % 2 === 0 ? 16 : 0 }
      ]}
    >
      <TouchableOpacity onPress={() => goToMovie(item)} activeOpacity={0.8}>
        <View style={styles.posterContainer}>
          <Image
            source={
              item.poster_path
                ? { uri: image185(item.poster_path) }
                : fallBackMoviePoster
            }
            style={styles.poster}
          />

          <View style={styles.favoriteOverlay}>
            <Ionicons name="heart" size={16} color="white" />
          </View>

          {item.vote_average && item.vote_average > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {formatRating(item.vote_average)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.release_date && (
            <Text style={styles.movieYear}>
              {getMovieYear(item.release_date)}
            </Text>
          )}
          <Text style={styles.addedDate}>
            Adicionado {formatAddedDate(item.added_at)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => goToMovie(item)}
        >
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => confirmRemoveFavorite(item)}
        >
          <Text style={[styles.actionButtonText, styles.removeButtonText]}>
            Remover
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        {/* Top Row - Navegação e Ações */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
          </TouchableOpacity>

          <View style={styles.rightControls}>
            <TouchableOpacity
              style={[styles.headerButton, styles.syncButton]}
              onPress={syncWithBackend}
              disabled={syncLoading}
            >
              <Ionicons
                name={syncLoading ? "refresh" : "cloud-outline"}
                size={20}
                color="#22C55E"
              />
            </TouchableOpacity>

            {favorites.length > 0 && (
              <>
                <TouchableOpacity style={styles.headerButton} onPress={shareFavorites}>
                  <Ionicons name="share-outline" size={20} color="#F3F4F6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={confirmClearAll}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Título Centralizado */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            <Text style={styles.pinkText}>M</Text>ilky{" "}
            <Text style={styles.pinkText}>M</Text>ovies
          </Text>
          <Text style={styles.subtitle}>💖 Meus Favoritos</Text>

          {syncLoading && (
            <View style={styles.syncStatus}>
              <ActivityIndicator size="small" color="#22C55E" />
              <Text style={styles.syncStatusText}>Sincronizando...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      {favorites.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {favorites.filter(f => f.vote_average && f.vote_average >= 7).length}
            </Text>
            <Text style={styles.statLabel}>Bem Avaliados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(favorites.map(f => getMovieYear(f.release_date)).filter(Boolean)).size}
            </Text>
            <Text style={styles.statLabel}>Anos Diferentes</Text>
          </View>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <AppLayout>
        <SafeAreaView style={styles.container}>
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Carregando favoritos...</Text>
          </View>
        </SafeAreaView>
      </AppLayout>
    );
  }

  if (favorites.length === 0) {
    return (
      <AppLayout>
        <SafeAreaView style={styles.container}>
          {renderHeader()}
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={64} color="#EC4899" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyText}>
              Comece a explorar filmes e adicione seus preferidos aos favoritos.{'\n'}
              Toque no coração nos detalhes do filme!
            </Text>

            <View style={styles.emptyActions}>
              <TouchableOpacity style={styles.emptyButton} onPress={goToSearch}>
                <LinearGradient
                  colors={["#EC4899", "#D946EF"]}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Buscar Filmes</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={goToHome}>
                <Text style={styles.secondaryButtonText}>Explorar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={favorites}
          renderItem={renderMovieItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor="#EC4899"
              colors={["#EC4899"]}
              // As linhas `title` e `titleColor` foram removidas ou comentadas
            />
          }
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
        />
      </SafeAreaView>
    </AppLayout>
  );
}
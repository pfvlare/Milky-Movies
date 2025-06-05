import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Share,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Cast from "../components/cast";
import MovieList from "../components/movieList";
import AppLayout from "../components/AppLayout";
import { useMovieComplete } from "../hooks/useMovies";
import { image500, imageOriginal, fallBackMoviePoster, formatRuntime, formatRating } from "../hooks/useMovies";
import { useFavorites } from "../hooks/useFavorites";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    position: "relative",
    width: width,
    height: height * 0.6,
  },
  moviePoster: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 120 : 100,
    zIndex: 10,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
    zIndex: 10,
  },
  headerControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  rightControls: {
    flexDirection: "row",
    gap: 12,
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(236, 72, 153, 0.9)",
    transform: [{ scale: 1.05 }],
  },
  favoriteButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  detailsContainer: {
    marginTop: -(height * 0.12),
    paddingHorizontal: 16,
    paddingBottom: 20,
    zIndex: 15,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    color: "#F3F4F6",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 40,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  originalTitle: {
    color: "#9CA3AF",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 12,
  },
  tagline: {
    color: "#EC4899",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  quickInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickInfoText: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  ratingBox: {
    backgroundColor: "rgba(31, 41, 55, 0.9)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  ratingValue: {
    color: "#F59E0B",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ratingLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
  genresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  genreChip: {
    backgroundColor: "#EC4899",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genreText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  overviewSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F3F4F6",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  overview: {
    color: "#D1D5DB",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "justify",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryButton: {
    flex: 2,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  detailsGrid: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#374151",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 200,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 200,
  },
  errorIcon: {
    marginBottom: 16,
    padding: 20,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  retryGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  section: {
    marginBottom: 32,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionIcon: {
    marginRight: 12,
    backgroundColor: "#1F2937",
    padding: 8,
    borderRadius: 8,
  },
  companiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  companyChip: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  companyText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "500",
  },
  favoriteIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#22C55E",
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  syncIndicator: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
});

interface MovieScreenParams {
  id: number;
  title?: string;
  poster_path?: string;
}

const MovieScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, title, poster_path } = route.params as MovieScreenParams;

  const [refreshing, setRefreshing] = useState(false);
  const [favoritePressed, setFavoritePressed] = useState(false);

  // Hook de favoritos com sincronização
  const { isFavorite, addFavorite, removeFavorite, syncLoading } = useFavorites();

  // Hook para buscar dados completos do filme
  const { movie, credits, similar, isLoading, hasError, refetchAll } = useMovieComplete(id);

  // Verificar se é favorito
  const isMovieFavorite = isFavorite(id);

  const toggleFavorite = async () => {
    if (!movie && !title) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Informações do filme não disponíveis"
      });
      return;
    }

    setFavoritePressed(true);

    // Preparar dados do filme
    const movieData = {
      id,
      title: movie?.title || title || "Filme sem título",
      poster_path: movie?.poster_path || poster_path,
      release_date: movie?.release_date,
      vote_average: movie?.vote_average,
      vote_count: movie?.vote_count,
      overview: movie?.overview,
      popularity: movie?.popularity,
    };

    try {
      if (isMovieFavorite) {
        await removeFavorite(id);
      } else {
        await addFavorite(movieData);
      }
    } catch (error) {
      console.error("Erro ao toggle favorito:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar favoritos"
      });
    } finally {
      setTimeout(() => setFavoritePressed(false), 200);
    }
  };

  const handleShare = async () => {
    try {
      const movieTitle = movie?.title || title || "Filme";
      const movieOverview = movie?.overview || 'Um ótimo filme para assistir!';

      await Share.share({
        message: `🎬 Confira este filme: ${movieTitle}\n\n${movieOverview}\n\n📱 Compartilhado via Milky Movies`,
        title: movieTitle,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao compartilhar",
        text2: "Tente novamente"
      });
    }
  };

  const handleWatchTrailer = () => {
    const movieTitle = movie?.title || title || "filme";
    const searchQuery = `${movieTitle} trailer oficial`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    Linking.openURL(youtubeUrl).catch(() => {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível abrir o YouTube"
      });
    });
  };

  const handleWatchMovie = () => {
    // Navegar para o player com URL do YouTube
    const movieTitle = movie?.title || title || "filme";
    const searchQuery = `${movieTitle} filme completo`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    navigation.navigate("PlayerScreen" as never, {
      videoUrl: youtubeUrl,
      title: movieTitle,
      type: 'movie'
    } as never);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAll();
      Toast.show({
        type: "success",
        text1: "Atualizado!",
        text2: "Informações do filme atualizadas"
      });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar",
        text2: "Tente novamente"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const formatBudget = (budget: number) => {
    if (!budget) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(budget);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getImageSource = () => {
    if (movie?.backdrop_path) {
      return imageOriginal(movie.backdrop_path);
    } else if (movie?.poster_path) {
      return image500(movie.poster_path);
    } else if (poster_path) {
      return image500(poster_path);
    } else {
      return fallBackMoviePoster;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Carregando filme...</Text>
          </View>
        </SafeAreaView>
      </AppLayout>
    );
  }

  if (hasError) {
    return (
      <AppLayout>
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="warning-outline" size={48} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>Erro ao carregar filme</Text>
            <Text style={styles.errorSubtext}>
              Não conseguimos carregar as informações deste filme.{'\n'}
              Verifique sua conexão e tente novamente.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <LinearGradient
                colors={["#EC4899", "#D946EF"]}
                style={styles.retryGradient}
              >
                <Ionicons name="refresh-outline" size={16} color="#fff" />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#EC4899"
            colors={["#EC4899"]}
          />
        }
      >
        {/* Header com Poster */}
        <View style={styles.headerContainer}>
          <Image
            source={{
              uri: getImageSource(),
            }}
            style={styles.moviePoster}
          />

          {/* Gradientes */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.headerGradient}
          />
          <LinearGradient
            colors={['transparent', 'rgba(17,24,39,0.8)', '#111827']}
            style={styles.bottomGradient}
          />

          {/* Controles do Header */}
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
            </TouchableOpacity>

            <View style={styles.rightControls}>
              <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#F3F4F6" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isMovieFavorite && styles.favoriteButtonActive,
                  favoritePressed && styles.favoriteButtonPressed,
                  syncLoading && styles.syncIndicator
                ]}
                onPress={toggleFavorite}
                disabled={syncLoading}
              >
                {syncLoading ? (
                  <ActivityIndicator size="small" color="#22C55E" />
                ) : (
                  <>
                    <Ionicons
                      name={isMovieFavorite ? "heart" : "heart-outline"}
                      size={24}
                      color={isMovieFavorite ? "white" : "#F3F4F6"}
                    />
                    {isMovieFavorite && (
                      <View style={styles.favoriteIndicator}>
                        <Ionicons name="checkmark" size={8} color="white" />
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Detalhes do Filme */}
        <View style={styles.detailsContainer}>
          {/* Título e Informações Básicas */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{movie?.title || title}</Text>
            {movie?.original_title && movie.original_title !== movie.title && (
              <Text style={styles.originalTitle}>"{movie.original_title}"</Text>
            )}
            {movie?.tagline && (
              <Text style={styles.tagline}>"{movie.tagline}"</Text>
            )}

            {/* Informações Rápidas */}
            <View style={styles.quickInfoContainer}>
              {movie?.release_date && (
                <View style={styles.quickInfoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#EC4899" />
                  <Text style={styles.quickInfoText}>
                    {new Date(movie.release_date).getFullYear()}
                  </Text>
                </View>
              )}

              {movie?.runtime && (
                <View style={styles.quickInfoItem}>
                  <Ionicons name="time-outline" size={16} color="#EC4899" />
                  <Text style={styles.quickInfoText}>
                    {formatRuntime(movie.runtime)}
                  </Text>
                </View>
              )}

              <View style={styles.quickInfoItem}>
                <Ionicons name="flag-outline" size={16} color="#EC4899" />
                <Text style={styles.quickInfoText}>
                  {movie?.status === "Released" ? "Lançado" : movie?.status || "N/A"}
                </Text>
              </View>

              {isMovieFavorite && (
                <View style={styles.quickInfoItem}>
                  <Ionicons name="heart" size={16} color="#EC4899" />
                  <Text style={styles.quickInfoText}>Favorito</Text>
                </View>
              )}
            </View>
          </View>

          {/* Avaliações */}
          {(movie?.vote_average || movie?.vote_count) && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingValue}>
                  {formatRating(movie.vote_average)}
                </Text>
                <Text style={styles.ratingLabel}>TMDB</Text>
              </View>

              <View style={styles.ratingBox}>
                <Text style={styles.ratingValue}>
                  {movie.vote_count ? (movie.vote_count / 1000).toFixed(1) + "K" : "N/A"}
                </Text>
                <Text style={styles.ratingLabel}>Votos</Text>
              </View>

              <View style={styles.ratingBox}>
                <Text style={styles.ratingValue}>
                  {movie.popularity ? movie.popularity.toFixed(0) : "N/A"}
                </Text>
                <Text style={styles.ratingLabel}>Popular</Text>
              </View>
            </View>
          )}

          {/* Gêneros */}
          {movie?.genres?.length > 0 && (
            <View style={styles.genresContainer}>
              {movie.genres.map((genre: any, index: number) => (
                <View key={genre.id} style={styles.genreChip}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Botões de Ação */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleWatchMovie}
            >
              <LinearGradient
                colors={["#EC4899", "#D946EF"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Assistir</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleWatchTrailer}>
              <LinearGradient
                colors={["#374151", "#4B5563"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="videocam-outline" size={18} color="white" />
                <Text style={styles.secondaryButtonText}>Trailer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Sinopse */}
          {movie?.overview && (
            <View style={styles.overviewSection}>
              <View style={styles.sectionHeaderContainer}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#EC4899" />
                </View>
                <Text style={styles.sectionTitle}>Sinopse</Text>
              </View>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>
          )}

          {/* Detalhes Técnicos */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data de Lançamento</Text>
              <Text style={styles.detailValue}>
                {formatDate(movie?.release_date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duração</Text>
              <Text style={styles.detailValue}>
                {movie?.runtime ? formatRuntime(movie.runtime) : "N/A"}
              </Text>
            </View>

            {movie?.budget > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Orçamento</Text>
                <Text style={styles.detailValue}>
                  {formatBudget(movie.budget)}
                </Text>
              </View>
            )}

            {movie?.revenue > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bilheteria</Text>
                <Text style={styles.detailValue}>
                  {formatBudget(movie.revenue)}
                </Text>
              </View>
            )}

            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Idioma Original</Text>
              <Text style={styles.detailValue}>
                {movie?.original_language?.toUpperCase() || "N/A"}
              </Text>
            </View>
          </View>

          {/* Produtoras */}
          {movie?.production_companies?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="business-outline" size={20} color="#EC4899" />
                </View>
                <Text style={styles.sectionTitle}>Produção</Text>
              </View>
              <View style={styles.companiesContainer}>
                {movie.production_companies.map((company: any) => (
                  <View key={company.id} style={styles.companyChip}>
                    <Text style={styles.companyText}>{company.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Elenco */}
        {credits?.cast?.length > 0 && (
          <Cast navigation={navigation} cast={credits.cast} />
        )}

        {/* Filmes Similares */}
        {similar?.results?.length > 0 && (
          <MovieList
            title="🎬 Filmes Similares"
            data={similar.results}
            hiddenSeeAll={false}
            navigation={navigation}
            onSeeAll={() => {
              navigation.navigate("MovieListScreen" as never, {
                title: "Filmes Similares",
                data: similar.results,
                category: "similar"
              } as never);
            }}
          />
        )}
      </ScrollView>
    </AppLayout>
  );
};

export default MovieScreen;
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useSearchMovies } from "../hooks/useMovies";
import { image185, fallBackMoviePoster } from "../hooks/useMovies";
import { useUserStore } from "../store/userStore";
import AppLayout from "../components/AppLayout";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

const SEARCH_HISTORY_KEY = "@search_history";
const MAX_HISTORY_ITEMS = 10;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface PopularGenre {
  id: number;
  name: string;
  emoji: string;
}

const POPULAR_GENRES: PopularGenre[] = [
  { id: 28, name: "Ação", emoji: "💥" },
  { id: 35, name: "Comédia", emoji: "😂" },
  { id: 18, name: "Drama", emoji: "🎭" },
  { id: 27, name: "Terror", emoji: "👻" },
  { id: 10749, name: "Romance", emoji: "💕" },
  { id: 878, name: "Ficção", emoji: "🚀" },
  { id: 53, name: "Suspense", emoji: "🔍" },
  { id: 16, name: "Animação", emoji: "🎨" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 16,
  },
  headerTitle: {
    color: "#F3F4F6",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#F3F4F6",
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: "500",
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EC4899",
    marginLeft: 8,
  },
  voiceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 2,
  },
  clearHistoryButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearHistoryText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  historyText: {
    color: "#F3F4F6",
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  historyTime: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  removeHistoryButton: {
    padding: 4,
    marginLeft: 8,
  },
  genresContainer: {
    paddingHorizontal: 16,
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  genreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  genreEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  genreText: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  resultsCount: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultsSubtext: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 2,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  filterText: {
    color: "#F3F4F6",
    fontSize: 14,
    marginLeft: 6,
  },
  movieGrid: {
    paddingHorizontal: 8,
  },
  movieItem: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 24,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  moviePoster: {
    width: "100%",
    height: height * 0.28,
    resizeMode: "cover",
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    numberOfLines: 2,
  },
  movieYear: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  movieRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyStateIcon: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  emptyStateTitle: {
    color: "#F3F4F6",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  errorIcon: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
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
});

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null); // NOVO ESTADO AQUI
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  const user = useUserStore((state) => state.user);
  const currentProfile = user?.currentProfileId;

  // Hook de busca
  const { data: searchResults, isLoading, error, refetch } = useSearchMovies(query, selectedGenreId);

  // Carregar histórico de pesquisa
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyJson) {
        const history: SearchHistoryItem[] = JSON.parse(historyJson);
        setSearchHistory(history.slice(0, MAX_HISTORY_ITEMS));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const saveSearchToHistory = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) return;

    try {
      const newItem: SearchHistoryItem = {
        query: searchQuery.trim(),
        timestamp: Date.now(),
      };

      // Remover duplicatas e adicionar novo item
      const updatedHistory = [
        newItem,
        ...searchHistory.filter(item => item.query !== searchQuery.trim())
      ].slice(0, MAX_HISTORY_ITEMS);

      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
      Toast.show({
        type: "success",
        text1: "Histórico limpo",
        text2: "Todas as pesquisas anteriores foram removidas"
      });
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  };

  const removeHistoryItem = async (queryToRemove: string) => {
    try {
      const updatedHistory = searchHistory.filter(item => item.query !== queryToRemove);
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Erro ao remover item do histórico:", error);
    }
  };

  const handleSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim().length >= 3) {
        setQuery(searchQuery);
        setSelectedGenreId(null); // Limpa o gênero selecionado ao digitar
        setShowHistory(false);
        saveSearchToHistory(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setQuery("");
        setSelectedGenreId(null); // Limpa o gênero selecionado
        setShowHistory(true);
      }
    }, 500),
    [searchHistory] // Dependência para o debounce, se quiser que ele re-crie ao mudar o histórico
  );

  const handleHistoryItemPress = (historyQuery: string) => {
    // Se o item do histórico for um gênero (ex: "gênero:Ação"), você precisa parsear isso
    if (historyQuery.startsWith("gênero:")) {
      const genreName = historyQuery.substring("gênero:".length);
      const genre = POPULAR_GENRES.find(g => g.name === genreName);
      if (genre) {
        setQuery(""); // Limpa a query de texto
        setSelectedGenreId(genre.id); // Define o ID do gênero
        setShowHistory(false);
      } else {
        // Fallback se o gênero não for encontrado na lista de POPULAR_GENRES
        setQuery(historyQuery);
        setSelectedGenreId(null);
        setShowHistory(false);
      }
    } else {
      setQuery(historyQuery);
      setSelectedGenreId(null);
      setShowHistory(false);
    }
    saveSearchToHistory(historyQuery); // Salva novamente para atualizar o timestamp
  };

  const handleGenrePress = (genre: PopularGenre) => {
    setQuery(""); // Limpa qualquer texto digitado para focar na busca por gênero
    setSelectedGenreId(genre.id); // Define o ID do gênero
    setShowHistory(false);
    saveSearchToHistory(`gênero:${genre.name}`); // Salva no histórico para legibilidade
  };

  const handleClearSearch = () => {
    setQuery("");
    setSelectedGenreId(null); // Limpa o gênero selecionado também
    setShowHistory(true);
  };

  const handleMoviePress = (item: any) => {
    if (item && item.id) {
      // AQUI é onde você precisa passar os parâmetros.
      // Use 'movieId' como chave para o ID, como já havíamos acordado,
      // pois sua MovieScreen espera 'id' nos parâmetros.
      navigation.navigate("Movie", {
        id: item.id, // <-- MUITO IMPORTANTE: passe o ID aqui como 'id'
        title: item.title,
        poster_path: item.poster_path,
      });
      console.log('DEBUG SearchScreen - Navegando para Movie com ID:', item.id, 'e título:', item.title);
    } else {
      console.warn('DEBUG SearchScreen - Filme selecionado sem ID válido:', item);
      Toast.show({
          type: 'error',
          text1: 'Erro ao abrir filme',
          text2: 'Dados do filme incompletos. Tente outro.'
      });
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return "Agora";
  };

  const renderMovieItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableWithoutFeedback onPress={() => handleMoviePress(item)}>
      <View style={styles.movieItem}>
        <Image
          source={{
            uri: item.poster_path ? image185(item.poster_path) : fallBackMoviePoster,
          }}
          style={styles.moviePoster}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.release_date && (
            <Text style={styles.movieYear}>
              {new Date(item.release_date).getFullYear()}
            </Text>
          )}
          {item.vote_average > 0 && (
            <View style={styles.movieRating}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const showResults = (query.length >= 3 || selectedGenreId !== null) && !showHistory;
  const hasResults = searchResults?.results?.length > 0;

  return (
    <AppLayout>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar Filmes</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Pesquisar filmes, atores, gêneros..."
              placeholderTextColor="#6B7280"
              style={styles.searchInput}
              onChangeText={handleSearch}
              autoCapitalize="none"
              returnKeyType="search"
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.voiceButton}>
              <Ionicons name="mic-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {showHistory ? (
            <>
              {/* Histórico de Pesquisa */}
              {searchHistory.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>🕒 Pesquisas Recentes</Text>
                      <Text style={styles.sectionSubtitle}>Suas últimas buscas</Text>
                    </View>
                    <TouchableOpacity style={styles.clearHistoryButton} onPress={clearSearchHistory}>
                      <Text style={styles.clearHistoryText}>Limpar</Text>
                    </TouchableOpacity>
                  </View>

                  {searchHistory.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.historyItem}
                      onPress={() => handleHistoryItemPress(item.query)}
                    >
                      <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.historyText}>{item.query}</Text>
                      <Text style={styles.historyTime}>{formatTimeAgo(item.timestamp)}</Text>
                      <TouchableOpacity
                        style={styles.removeHistoryButton}
                        onPress={() => removeHistoryItem(item.query)}
                      >
                        <Ionicons name="close" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Gêneros Populares */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>🎬 Explorar Gêneros</Text>
                    <Text style={styles.sectionSubtitle}>Descubra por categoria</Text>
                  </View>
                </View>

                <View style={styles.genresContainer}>
                  <View style={styles.genresGrid}>
                    {POPULAR_GENRES.map((genre) => (
                      <TouchableOpacity
                        key={genre.id}
                        style={styles.genreButton}
                        onPress={() => handleGenrePress(genre)}
                      >
                        <Text style={styles.genreEmoji}>{genre.emoji}</Text>
                        <Text style={styles.genreText}>{genre.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </>
          ) : showResults ? (
            <>
              {/* Header dos Resultados */}
              <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.resultsCount}>
                    {searchResults?.total_results || 0} resultados
                  </Text>
                  <Text style={styles.resultsSubtext}>para "{query}"</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons name="filter-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.filterText}>Filtros</Text>
                </TouchableOpacity>
              </View>

              {/* Resultados */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#EC4899" />
                  <Text style={styles.loadingText}>Buscando filmes...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <View style={styles.errorIcon}>
                    <Ionicons name="warning-outline" size={48} color="#EF4444" />
                  </View>
                  <Text style={styles.errorText}>Erro na busca</Text>
                  <Text style={styles.errorSubtext}>
                    Não conseguimos realizar a pesquisa.{'\n'}Tente novamente.
                  </Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <LinearGradient
                      colors={["#EC4899", "#D946EF"]}
                      style={styles.retryGradient}
                    >
                      <Ionicons name="refresh-outline" size={16} color="#fff" />
                      <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : hasResults ? (
                <FlatList
                  data={searchResults.results}
                  renderItem={renderMovieItem}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  numColumns={2}
                  style={styles.movieGrid}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                  </View>
                  <Text style={styles.emptyStateTitle}>Nenhum resultado</Text>
                  <Text style={styles.emptyStateText}>
                    Não encontramos filmes para "{query}".{'\n'}
                    Tente pesquisar com outras palavras.
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AppLayout>
  );
}
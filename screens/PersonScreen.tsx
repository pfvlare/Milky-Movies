import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import MovieList from "../components/movieList";
import AppLayout from "../components/AppLayout";
// Mude a importação para o moviedb.js (se for onde estão as funções de imagem e fallbacks)
import { image342, fallBackPersonImage } from '../api/moviedb'; // Ajuste o caminho se necessário
import { usePersonDetails, usePersonMovieCredits } from "../hooks/useMovies"; // Hooks de dados ficam aqui
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
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
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 120 : 100,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  shareButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 140 : 120,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  profileImageWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#EC4899",
    backgroundColor: "#1F2937",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 6,
    borderWidth: 3,
    borderColor: "#111827",
  },
  nameSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  name: {
    color: "#F3F4F6",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "#EC4899",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  birthPlace: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#374151",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#EC4899",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#374151",
    marginHorizontal: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
    backgroundColor: "#1F2937",
    padding: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    color: "#F3F4F6",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  biographyCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  biographyText: {
    color: "#D1D5DB",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "justify",
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  readMoreText: {
    color: "#EC4899",
    fontSize: 14,
    fontWeight: "600",
  },
  personalInfoGrid: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
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
  emptyMoviesContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  emptyMoviesIcon: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  emptyMoviesText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  knownForSection: {
    marginBottom: 24,
  },
  knownForTitle: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
});

interface PersonScreenParams {
  id: number;
  name?: string;
}

export default function PersonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, name } = route.params as PersonScreenParams;

  const [refreshing, setRefreshing] = useState(false);
  const [showFullBiography, setShowFullBiography] = useState(false);

  // Hooks para buscar dados da pessoa
  const {
    data: person,
    isLoading: personLoading,
    error: personError,
    refetch: refetchPerson
  } = usePersonDetails(id);

  const {
    data: movieCredits,
    isLoading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies
  } = usePersonMovieCredits(id);

  const isLoading = personLoading || moviesLoading;
  const hasError = personError || moviesError;

  // *** AQUI É ONDE VAMOS USAR A LÓGICA CORRETA ***
  const sourceForPersonImage = person?.profile_path
    ? { uri: image342(person.profile_path) } // Usa image342 do moviedb.js
    : fallBackPersonImage; // Usa fallBackPersonImage do moviedb.js


  // Dados processados
  const movies = movieCredits?.cast || [];
  const knownFor = movies.slice(0, 10); // Top 10 filmes mais conhecidos

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchPerson(), refetchMovies()]);
      Toast.show({
        type: "success",
        text1: "Atualizado!",
        text2: "Informações da pessoa atualizadas"
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

  const handleShare = () => {
    Toast.show({
      type: "info",
      text1: "Compartilhar",
      text2: `${person?.name || name}`
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getAge = (birthday: string, deathday?: string) => {
    if (!birthday) return null;
    try {
      const birth = new Date(birthday);
      const end = deathday ? new Date(deathday) : new Date();
      const age = end.getFullYear() - birth.getFullYear();
      return age;
    } catch {
      return null;
    }
  };

  const formatGender = (gender: number) => {
    switch (gender) {
      case 1: return "Feminino";
      case 2: return "Masculino";
      case 3: return "Não-binário";
      default: return "Não especificado";
    }
  };

  const formatPopularity = (popularity: number) => {
    if (!popularity) return "N/A";
    return `${popularity.toFixed(1)}`;
  };

  const truncatedBiography = person?.biography?.length > 300
    ? person.biography.substring(0, 300) + "..."
    : person?.biography;

  if (isLoading) {
    return (
      <AppLayout>
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Carregando informações...</Text>
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="warning-outline" size={48} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>Erro ao carregar</Text>
            <Text style={styles.errorSubtext}>
              Não conseguimos carregar as informações desta pessoa.{'\n'}
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

  console.log('DEBUG person object:', person);
  console.log('DEBUG person.profile_path:', person?.profile_path, typeof person?.profile_path);
  console.log('DEBUG sourceForPersonImage:', sourceForPersonImage); // Adicione este log para depurar

  return (
    <AppLayout>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.headerGradient}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#F3F4F6" />
          </TouchableOpacity>
        </View>

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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                {/* *** CORREÇÃO AQUI: USAR sourceForPersonImage *** */}
                <Image
                  source={sourceForPersonImage}
                  style={styles.profileImage} // Use o estilo definido no StyleSheet
                />
              </View>
              {person?.popularity > 10 && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </View>

            <View style={styles.nameSection}>
              <Text style={styles.name}>{person?.name || name}</Text>
              {person?.known_for_department && (
                <Text style={styles.subtitle}>
                  {person.known_for_department === 'Acting' ? 'Ator/Atriz' : person.known_for_department}
                </Text>
              )}
              {person?.place_of_birth && (
                <Text style={styles.birthPlace}>
                  📍 {person.place_of_birth}
                </Text>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {movies.length}
              </Text>
              <Text style={styles.statLabel}>Filmes</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatPopularity(person?.popularity)}
              </Text>
              <Text style={styles.statLabel}>Popularidade</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {getAge(person?.birthday, person?.deathday) || "N/A"}
              </Text>
              <Text style={styles.statLabel}>
                {person?.deathday ? "Idade (falecimento)" : "Idade"}
              </Text>
            </View>
          </View>

          {/* Informações Pessoais */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="person-outline" size={20} color="#EC4899" />
              </View>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            </View>

            <View style={styles.personalInfoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gênero</Text>
                <Text style={styles.infoValue}>
                  {formatGender(person?.gender)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nascimento</Text>
                <Text style={styles.infoValue}>
                  {formatDate(person?.birthday)}
                </Text>
              </View>

              {person?.deathday && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Falecimento</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(person?.deathday)}
                  </Text>
                </View>
              )}

              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Conhecido por</Text>
                <Text style={styles.infoValue}>
                  {person?.known_for_department === 'Acting' ? 'Atuação' : person?.known_for_department || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Biografia */}
          {person?.biography && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="book-outline" size={20} color="#EC4899" />
                </View>
                <Text style={styles.sectionTitle}>Biografia</Text>
              </View>

              <View style={styles.biographyCard}>
                <Text style={styles.biographyText}>
                  {showFullBiography ? person.biography : truncatedBiography}
                </Text>
                {person.biography.length > 300 && (
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => setShowFullBiography(!showFullBiography)}
                  >
                    <Text style={styles.readMoreText}>
                      {showFullBiography ? "Ler menos" : "Ler mais"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Filmes */}
          {movies.length > 0 ? (
            <View style={styles.knownForSection}>
              <Text style={styles.knownForTitle}>
                🎬 Filmografia ({movies.length} filmes)
              </Text>
              <MovieList
                title=""
                data={movies}
                hiddenSeeAll={movies.length <= 10}
                navigation={navigation}
                onSeeAll={() => {
                  // Navegar para lista completa de filmes
                  Toast.show({
                    type: "info",
                    text1: "Ver todos os filmes",
                    text2: `${movies.length} filmes encontrados`
                  });
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyMoviesContainer}>
              <View style={styles.emptyMoviesIcon}>
                <Ionicons name="film-outline" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyMoviesText}>
                Nenhum filme encontrado para esta pessoa.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppLayout>
  );
}
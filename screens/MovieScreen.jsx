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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeftIcon,
  HeartIcon as HeartOutlineIcon,
} from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Cast from "../components/cast";
import MovieList from "../components/movieList";
import Loading from "../components/loading";

import {
  fallBackMoviePoster,
  fetchMoviesCredits,
  fetchMoviesDetails,
  fetchSimilarMovies,
  image500,
} from "../api/moviedb";

import * as themeConfig from "../theme";
const theme = themeConfig.theme;

const { width, height } = Dimensions.get("window");
const ios = Platform.OS === "ios";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  safeArea: {
    position: "absolute",
    zIndex: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { paddingTop: 16 },
      android: { marginTop: 16 },
    }),
  },
  backButton: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 8,
  },
  favoriteButton: {
    marginTop: 10,
    marginRight: 16,
  },
  moviePoster: {
    width: width,
    height: height * 0.55,
  },
  gradient: {
    width: width,
    height: height * 0.4,
    position: "absolute",
    bottom: 0,
  },
  detailsContainer: {
    marginTop: -(height * 0.09),
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  title: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  statusAndYear: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  genresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  genre: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 16,
  },
  overview: {
    color: "#6B7280",
    marginTop: 16,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "justify",
  },
});

export default function MovieScreen() {
  const { params: item } = useRoute();
  const navigation = useNavigation();

  const [movie, setMovie] = useState({});
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (item && item.id) {
      getMovieDetails(item.id);
      getMovieCredits(item.id);
      getSimilarMovies(item.id);
      checkIfFavorite(item.id);
    }
  }, [item]);

  const getMovieDetails = async (id) => {
    const data = await fetchMoviesDetails(id);
    if (data) setMovie(data);
    setLoading(false);
  };

  const getMovieCredits = async (id) => {
    const data = await fetchMoviesCredits(id);
    if (data?.cast) setCast(data.cast);
  };

  const getSimilarMovies = async (id) => {
    const data = await fetchSimilarMovies(id);
    if (data?.results) setSimilarMovies(data.results);
  };

  const checkIfFavorite = async (id) => {
    const stored = await AsyncStorage.getItem("favorites");
    const favorites = stored ? JSON.parse(stored) : [];
    const found = favorites.find((m) => m.id === id);
    setIsFavourite(!!found);
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];

      let updated;
      if (isFavourite) {
        updated = favorites.filter((m) => m.id !== item.id);
      } else {
        const alreadyExists = favorites.some((m) => m.id === item.id);
        updated = alreadyExists ? favorites : [...favorites, item];
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.log("Erro ao favoritar:", err);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      style={styles.container}
    >
      <View style={{ width }}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeftIcon size={28} strokeWidth={2.5} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButton}
          >
            {isFavourite ? (
              <HeartIcon size={35} color={theme.background} />
            ) : (
              <HeartOutlineIcon size={35} strokeWidth={2} color="white" />
            )}
          </TouchableOpacity>
        </SafeAreaView>

        {loading ? (
          <Loading />
        ) : (
          <View>
            <Image
              source={{
                uri: item.poster_path
                  ? image500(item.poster_path)
                  : fallBackMoviePoster,
              }}
              style={styles.moviePoster}
            />
            <LinearGradient
              colors={["transparent", "rgba(23,23,23,0.8)", "rgba(23,23,23,1)"]}
              style={styles.gradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{movie?.title}</Text>

        {movie?.id && (
          <Text style={styles.statusAndYear}>
            {movie?.status === "Released" ? "Lançado" : movie?.status} •{" "}
            {movie?.release_date?.split("-")[0]} • {movie?.runtime} min
          </Text>
        )}

        <View style={styles.genresContainer}>
          {movie?.genres?.map((genre, index) => (
            <Text key={index} style={styles.genre}>
              {genre.name}
              {index !== movie.genres.length - 1 ? " • " : ""}
            </Text>
          ))}
        </View>

        <Text style={styles.overview}>
          {movie?.overview || "Descrição não disponível."}
        </Text>
      </View>

      {cast.length > 0 && <Cast navigation={navigation} cast={cast} />}
      {similarMovies.length > 0 && (
        <MovieList
          title="Filmes Semelhantes"
          hiddenSeeAll
          data={similarMovies}
        />
      )}
    </ScrollView>
  );
}
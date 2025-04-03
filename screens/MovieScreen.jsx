import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { styles, theme } from "../theme";
import { LinearGradient } from "expo-linear-gradient";
import Cast from "../components/cast";
import MovieList from "../components/movieList";
import Loading from "../components/loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fallBackMoviePoster,
  fetchMoviesCredits,
  fetchMoviesDetails,
  fetchSimilarMovies,
  image500,
} from "../api/moviedb";

const { width, height } = Dimensions.get("window");
const ios = Platform.OS === "ios";
const topMargin = ios ? "" : "mt-3";

export default function MovieScreen() {
  const { params: item } = useRoute();
  const navigation = useNavigation();

  const [isFavourite, setIsFavourite] = useState(false);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movie, setMovie] = useState({});

  useEffect(() => {
    setLoading(true);
    getMovieDetails(item.id);
    getMovieCredits(item.id);
    getSimilarMovies(item.id);
    checkIfFavorite();
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

  const checkIfFavorite = async () => {
    const stored = await AsyncStorage.getItem("@favorites");
    const favs = stored ? JSON.parse(stored) : [];
    const exists = favs.some((m) => m.id === item.id);
    setIsFavourite(exists);
  };

  const toggleFavorite = async () => {
    const stored = await AsyncStorage.getItem("@favorites");
    let favs = stored ? JSON.parse(stored) : [];

    if (isFavourite) {
      favs = favs.filter((m) => m.id !== item.id);
    } else {
      favs.push(item);
    }

    await AsyncStorage.setItem("@favorites", JSON.stringify(favs));
    setIsFavourite(!isFavourite);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      className="flex-1 bg-neutral-900"
    >
      <View className="w-full">
        <SafeAreaView
          className={
            "absolute z-20 w-full flex-row justify-between items-center px-4 " +
            topMargin
          }
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.background, { marginTop: 10, marginLeft: 15 }]}
            className="rounded-xl p-2"
          >
            <ChevronLeftIcon size={28} strokeWidth={2.5} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            style={{ marginTop: 10, marginRight: 15 }}
          >
            <HeartIcon
              size={35}
              color={isFavourite ? theme.background : "white"}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {loading ? (
          <Loading />
        ) : (
          <View>
            <Image
              source={
                item.poster_path
                  ? { uri: image500(item.poster_path) }
                  : fallBackMoviePoster
              }
              style={{ width, height: height * 0.55 }}
            />
            <LinearGradient
              colors={["transparent", "rgba(23,23,23,0.8)", "rgba(23,23,23,1)"]}
              style={{ width, height: height * 0.4 }}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              className="absolute bottom-0"
            />
          </View>
        )}
      </View>

      <View style={{ marginTop: -(height * 0.09) }} className="space-y-3 px-4">
        <Text className="text-white text-center text-3xl font-bold tracking-wider">
          {movie?.title}
        </Text>

        {movie?.id && (
          <Text className="text-neutral-400 font-semibold text-base text-center mt-2">
            {movie?.status === "Released" ? "Lançado" : movie?.status} •{" "}
            {movie?.release_date?.split("-")[0]} • {movie?.runtime} min
          </Text>
        )}

        <View className="flex-row justify-center flex-wrap items-center gap-1 mt-1">
          {movie?.genres?.map((genre, index) => (
            <Text
              key={index}
              className="text-neutral-400 font-semibold text-base"
            >
              {genre.name}
              {index !== movie.genres.length - 1 ? " • " : ""}
            </Text>
          ))}
        </View>

        <Text className="text-neutral-400 mt-4 text-sm leading-6 text-justify">
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

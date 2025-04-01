import {
  View,
  Text,
  Dimensions,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { useNavigation, useRoute } from "@react-navigation/native";
import { styles } from "../theme";
import MovieList from "../components/movieList";
import Loading from "../components/loading";
import {
  fallBackPersonImage,
  fetchPersonDetails,
  fetchPersonMovies,
  image342,
} from "../api/moviedb";

const { width, height } = Dimensions.get("window");
const ios = Platform.OS === "ios";
const verticalMargin = ios ? "" : "my-3";

export default function PersonScreen() {
  const { params: item } = useRoute();
  const navigation = useNavigation();
  const [isFavourite, toggleFavourite] = useState(false);
  const [personMovies, setPersonMovies] = useState([]);
  const [person, setPerson] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPersonDetails(item.id);
    getPersonMovies(item.id);
  }, [item]);

  const getPersonDetails = async (id) => {
    const data = await fetchPersonDetails(id);
    if (data) setPerson(data);
    setLoading(false);
  };

  const getPersonMovies = async (id) => {
    const data = await fetchPersonMovies(id);
    if (data?.cast) setPersonMovies(data.cast);
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-900"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <SafeAreaView
        className={
          "z-20 w-full flex-row justify-between items-center px-4 " +
          verticalMargin
        }
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.background, { marginTop: 37, marginLeft: 15 }]}
          className="rounded-xl p-2"
        >
          <ChevronLeftIcon size={28} strokeWidth={2.5} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleFavourite(!isFavourite)}
          style={{ marginTop: 37, marginRight: 15 }}
        >
          <HeartIcon size={35} color={isFavourite ? "red" : "white"} />
        </TouchableOpacity>
      </SafeAreaView>

      {loading ? (
        <Loading />
      ) : (
        <View>
          {/* Foto */}
          <View
            className="flex-row justify-center"
            style={{
              shadowColor: "gray",
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 1,
              elevation: 10,
            }}
          >
            <View className="image-center rounded-full overflow-hidden h-72 w-72 border-4 border-neutral-500">
              <Image
                source={
                  person?.profile_path
                    ? { uri: image342(person.profile_path) }
                    : fallBackPersonImage
                }
                style={{ height: height * 0.43, width: width * 0.664 }}
              />
            </View>
          </View>

          {/* Nome e Local de Nascimento */}
          <View style={{ marginTop: 10 }}>
            <Text className="text-3xl text-white font-bold text-center">
              {person?.name}
            </Text>
            <Text className="text-base text-neutral-500 text-center">
              {person?.place_of_birth || "Local desconhecido"}
            </Text>
          </View>

          {/* Informações Rápidas */}
          <View className="mx-3 p-4 mt-6 flex-row justify-between items-center bg-neutral-700 rounded-full overflow-hidden">
            {/* Gênero */}
            <View className="flex-1 items-center">
              <Text className="text-white font-semibold">Gênero</Text>
              <Text className="text-neutral-300 text-sm">
                {person?.gender === 1 ? "Feminino" : "Masculino"}
              </Text>
            </View>

            {/* Divisor */}
            <View className="border-r-2 border-r-neutral-400 h-full mx-2" />

            {/* Nascimento */}
            <View className="flex-1 items-center">
              <Text className="text-white font-semibold text-center">
                Nascimento
              </Text>
              <Text className="text-neutral-300 text-sm text-center">
                {person?.birthday || "N/A"}
              </Text>
            </View>

            {/* Divisor */}
            <View className="border-r-2 border-r-neutral-400 h-full mx-2" />

            {/* Popularidade */}
            <View className="flex-1 items-center">
              <Text className="text-white font-semibold">Popularidade</Text>
              <Text className="text-neutral-300 text-sm">
                {person?.popularity?.toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* Biografia */}
          <View className="my-6 mx-4 space-y-2">
            <Text className="text-white text-lg">Biografia</Text>
            <Text className="text-neutral-400 tracking-wide mt-2 text-justify leading-6">
              {person?.biography || "Nenhuma biografia disponível."}
            </Text>
          </View>

          {/* Filmes */}
          <MovieList title={"Filmes"} hiddenSeeAll={true} data={personMovies} />
        </View>
      )}
    </ScrollView>
  );
}

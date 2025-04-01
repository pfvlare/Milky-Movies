import React, { useCallback, useState } from "react";
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
} from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import Loading from "../components/loading";
import { fallBackMoviePoster, image185, searchMovies } from "../api/moviedb";
import { debounce } from "lodash";
import AppLayout from "../components/AppLayout";

const { width, height } = Dimensions.get("window");

export default function SearchScreen() {
  const navigation = useNavigation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (value) => {
    if (value && value.length > 2) {
      setLoading(true);
      searchMovies({
        query: value,
        include_adult: "false",
        language: "pt-BR",
        page: "1",
      }).then((data) => {
        setLoading(false);
        if (data && data.results) setResults(data.results);
      });
    } else {
      setLoading(false);
      setResults([]);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

  return (
    <AppLayout>
      <View className="mx-4 mt-10 mb-3 flex-row justify-between items-center border border-neutral-500 rounded-full">
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Procurar Filmes..."
          placeholderTextColor={"lightgrey"}
          className="pb-1 pl-6 flex-1 text-base font-semibold text-white tracking-wide"
          style={{ paddingBottom: 10 }}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          className="rounded-full p-3 m-1 bg-pink-400"
        >
          <XMarkIcon size="25" color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loading />
      ) : results.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          className="space-y-3"
        >
          <Text className="text-white font-semibold ml-1">
            Resultados ({results.length})
          </Text>
          <View className="flex-row justify-between flex-wrap pt-2">
            {results.map((item, index) => (
              <TouchableWithoutFeedback
                key={index}
                onPress={() => navigation.push("Movie", item)}
              >
                <View className="space-y-2 mb-4">
                  <Image
                    className="rounded-3xl"
                    source={
                      item.poster_path
                        ? { uri: image185(item.poster_path) }
                        : fallBackMoviePoster
                    }
                    style={{ width: width * 0.44, height: height * 0.3 }}
                  />
                  <Text className="text-neutral-300 ml-1 pt-2">
                    {item.title.length > 22
                      ? item.title.slice(0, 22) + "..."
                      : item.title}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="items-center justify-center pt-28">
          <Image
            source={require("../assets/images/MovieTime.png")}
            className="h-64 w-64"
            style={{ opacity: 0.5 }}
          />
          <Text className="text-lg text-neutral-600 tracking-wide pt-6">
            Sem Resultados...
          </Text>
        </View>
      )}
    </AppLayout>
  );
}

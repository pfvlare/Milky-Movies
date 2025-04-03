import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { fallBackMoviePoster, image185 } from "../api/moviedb";
import AppLayout from "../components/AppLayout";

const { width, height } = Dimensions.get("window");

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadFavorites = async () => {
      const stored = await AsyncStorage.getItem("@favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    };
    const unsubscribe = navigation.addListener("focus", loadFavorites);
    return unsubscribe;
  }, [navigation]);

  const goToMovie = (movie) => {
    navigation.navigate("Movie", movie);
  };

  return (
    <AppLayout>
      <SafeAreaView className="flex-1 bg-neutral-900 pt-12 px-4">
        <TouchableOpacity
          className="absolute left-4 top-14 z-10"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-pink-400 font-semibold">← Voltar</Text>
        </TouchableOpacity>

        <Text className="text-white text-4xl font-bold mb-1 text-center">
          <Text className="text-pink-400">M</Text>ilky{" "}
          <Text className="text-pink-400">M</Text>ovies
        </Text>
        <Text className="text-gray-400 text-center mb-4">Favoritos</Text>

        {favorites.length === 0 ? (
          <Text className="text-neutral-400 text-center mt-10">
            Nenhum filme adicionado aos favoritos.
          </Text>
        ) : (
          <ScrollView>
            <View className="flex-row flex-wrap justify-between">
              {favorites.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToMovie(item)}
                  className="mb-4"
                >
                  <Image
                    source={{
                      uri: item.poster_path
                        ? image185(item.poster_path)
                        : fallBackMoviePoster,
                    }}
                    style={{
                      width: width * 0.44,
                      height: height * 0.3,
                      borderRadius: 20,
                      marginBottom: 8,
                    }}
                  />
                  <Text className="text-white w-40">
                    {item.title.length > 20
                      ? item.title.slice(0, 20) + "..."
                      : item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </AppLayout>
  );
}

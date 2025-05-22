import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { fallBackMoviePoster, image185 } from "../api/moviedb";
import { useUserStore } from "../store/userStore";

const { width, height } = Dimensions.get("window");

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const navigation = useNavigation();

  const profileId = useUserStore((state) => state.user?.currentProfileId);

  const loadFavorites = async () => {
    try {
      const key = `favorites_${profileId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadFavorites();
    }
  }, [profileId]);

  const goToMovie = (movie) => {
    navigation.navigate("Movie", movie);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
        }
      >
        <Ionicons name="arrow-back" size={24} color="#EC4899" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.mainTitle}>
          <Text style={styles.pinkText}>M</Text>ilky{" "}
          <Text style={styles.pinkText}>M</Text>ovies
        </Text>
        <Text style={styles.subtitle}>Favoritos</Text>
      </View>

      {favorites.length === 0 ? (
        <Text style={styles.emptyFavorites}>
          Nenhum filme adicionado aos favoritos.
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollWrapper}
        >
          <View style={styles.favoritesGrid}>
            {favorites.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToMovie(item)}
                style={styles.movieItem}
              >
                <Image
                  source={{
                    uri: item.poster_path
                      ? image185(item.poster_path)
                      : fallBackMoviePoster,
                  }}
                  style={styles.moviePoster}
                />
                <Text style={styles.movieTitle}>
                  {item.title?.length > 20
                    ? item.title.slice(0, 20) + "..."
                    : item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
  },
  scrollWrapper: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  mainTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pinkText: {
    color: "#EC4899",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 18,
  },
  emptyFavorites: {
    color: "#4B5563",
    fontSize: 16,
    marginTop: 40,
    textAlign: "center",
  },
  favoritesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  movieItem: {
    marginBottom: 20,
    width: (width - 72) / 2,
  },
  moviePoster: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 12,
    marginBottom: 8,
  },
  movieTitle: {
    color: "white",
    fontSize: 14,
  },
});

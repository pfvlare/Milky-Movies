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
  StyleSheet,
  Platform,
} from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import Loading from "../components/loading";
import { fallBackMoviePoster, image185, searchMovies } from "../api/moviedb";
import { debounce } from "lodash";
import AppLayout from "../components/AppLayout";
import { Ionicons } from "@expo/vector-icons"; // Importe os ícones

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 10,
    paddingLeft: 8,
  },
  clearButton: {
    backgroundColor: "#EC4899",
    borderRadius: 20,
    padding: 8,
    margin: 4,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultsText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  movieGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  movieItem: {
    marginBottom: 16,
    width: width * 0.44,
  },
  moviePoster: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 12,
  },
  movieTitle: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 8,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.2, // Centraliza verticalmente
  },
  noResultsImage: {
    width: width * 0.5,
    height: height * 0.3,
    opacity: 0.5,
  },
  noResultsText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 16,
  },
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 16 : 8,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
});

export default function SearchScreen() {
  const navigation = useNavigation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const handleMenu = () => {
    setShowMenu(!showMenu);
    // Aqui você precisaria integrar com o seu MenuModal
    console.log("Menu toggled!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.searchBarContainer}>
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Procurar Filmes..."
          placeholderTextColor="#6B7280"
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.clearButton}
        >
          <XMarkIcon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loading />
      ) : results.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.resultsContainer}
        >
          <Text style={styles.resultsText}>
            Resultados ({results.length})
          </Text>
          <View style={styles.movieGrid}>
            {results.map((item, index) => (
              <TouchableWithoutFeedback
                key={index}
                onPress={() => navigation.push("Movie", item)}
              >
                <View style={styles.movieItem}>
                  <Image
                    source={
                      item.poster_path
                        ? { uri: image185(item.poster_path) }
                        : fallBackMoviePoster
                    }
                    style={styles.moviePoster}
                  />
                  <Text style={styles.movieTitle}>
                    {item.title?.length > 22
                      ? item.title.slice(0, 22) + "..."
                      : item.title}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noResultsContainer}>
          <Image
            source={require("../assets/images/MovieTime.png")}
            style={styles.noResultsImage}
          />
          <Text style={styles.noResultsText}>Sem Resultados...</Text>
        </View>
      )}

      {/* <MenuModal visible={showMenu} trigger={handleMenu} /> */}
    </SafeAreaView>
  );
}

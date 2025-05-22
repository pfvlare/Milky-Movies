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
import { Ionicons } from "@expo/vector-icons";

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
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
        }
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#EC4899" />
      </TouchableOpacity>

      <View style={styles.searchBarContainer}>
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Procurar Filmes..."
          placeholderTextColor="#6B7280"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.clearButton} onPress={() => setResults([])}>
          <XMarkIcon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loading />
      ) : results.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsText}>Resultados ({results.length})</Text>
          <View style={styles.movieGrid}>
            {results.map((item, index) => (
              <TouchableWithoutFeedback
                key={index}
                onPress={() => navigation.navigate("Movie", item)}
              >
                <View style={styles.movieItem}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 12,
    marginTop: 70,
    alignItems: "center",
    backgroundColor: "#1F2937",
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
  },
  resultsText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 16,
  },
  movieGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  movieItem: {
    width: width * 0.44,
    marginBottom: 16,
  },
  moviePoster: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 12,
  },
  movieTitle: {
    color: "white",
    fontSize: 14,
    marginTop: 8,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
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
});

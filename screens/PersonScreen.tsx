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
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import MovieList from "../components/movieList.tsx";
import Loading from "../components/loading";
import {
  fallBackPersonImage,
  fetchPersonDetails,
  fetchPersonMovies,
  image342,
} from "../api/moviedb";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

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
    justifyContent: "flex-start",
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
  profileImageContainer: {
    alignItems: "center",
    marginTop: 24,
    shadowColor: "gray",
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    elevation: 10,
  },
  profileImageWrapper: {
    borderRadius: 80,
    overflow: "hidden",
    height: 160,
    width: 160,
    borderWidth: 4,
    borderColor: "#374151",
  },
  profileImage: {
    height: "100%",
    width: "100%",
  },
  name: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
  },
  birthPlace: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  infoContainer: {
    marginHorizontal: 16,
    padding: 16,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  infoValue: {
    color: "#6B7280",
    fontSize: 14,
  },
  biographyContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 8,
  },
  biographyTitle: {
    color: "white",
    fontSize: 18,
  },
  biographyText: {
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "justify",
  },
  moviesList: {
    marginTop: 24,
  },
});

export default function PersonScreen() {
  const { params: item } = useRoute();
  const navigation = useNavigation();
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
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#EC4899" />
        </TouchableOpacity>
      </SafeAreaView>

      {loading ? (
        <Loading />
      ) : (
        <View>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={
                  person?.profile_path
                    ? { uri: image342(person.profile_path) }
                    : fallBackPersonImage
                }
                style={styles.profileImage}
              />
            </View>
          </View>

          <View>
            <Text style={styles.name}>{person?.name}</Text>
            <Text style={styles.birthPlace}>
              {person?.place_of_birth || "Local desconhecido"}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gênero</Text>
              <Text style={styles.infoValue}>
                {person?.gender === 1 ? "Feminino" : "Masculino"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nascimento</Text>
              <Text style={styles.infoValue}>{person?.birthday || "N/A"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Popularidade</Text>
              <Text style={styles.infoValue}>
                {person?.popularity?.toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.biographyContainer}>
            <Text style={styles.biographyTitle}>Biografia</Text>
            <Text style={styles.biographyText}>
              {person?.biography || "Nenhuma biografia disponível."}
            </Text>
          </View>

          <View style={styles.moviesList}>
            <MovieList
              title={"Filmes"}
              hiddenSeeAll={true}
              data={personMovies}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Dimensions,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { image185, fallBackMoviePoster } from "../api/moviedb";

const { width, height } = Dimensions.get("window");

export default function MovieListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { title, data } = route.params as {
        title: string;
        data: any[];
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#EC4899" />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.mainTitle}>
                    <Text style={styles.pinkText}>M</Text>ilky{" "}
                    <Text style={styles.pinkText}>M</Text>ovies
                </Text>
                <Text style={styles.subtitle}>{title}</Text>
            </View>

            <View style={styles.grid}>
                {data?.map((item, index) => (
                    <TouchableWithoutFeedback
                        key={index}
                        onPress={() => navigation.navigate("Movie" as never, item as never)}
                    >
                        <View style={styles.movieItem}>
                            <Image
                                source={
                                    item.poster_path
                                        ? { uri: image185(item.poster_path) }
                                        : fallBackMoviePoster
                                }
                                style={styles.poster}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingHorizontal: 24,
    },
    backButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 30,
        left: 16,
        zIndex: 10,
        backgroundColor: "#1F2937",
        padding: 8,
        borderRadius: 10,
    },
    header: {
        alignItems: "center",
        marginTop: 60,
        marginBottom: 24,
    },
    mainTitle: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    pinkText: {
        color: "#EC4899",
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 18,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    movieItem: {
        marginBottom: 20,
        width: (width - 72) / 2, // 24 padding left + right + gap
    },
    poster: {
        width: "100%",
        height: height * 0.3,
        borderRadius: 12,
        backgroundColor: "#1f2937",
    },
    movieTitle: {
        color: "#D1D5DB",
        fontSize: 14,
        marginTop: 8,
    },
});

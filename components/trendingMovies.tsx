import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { image500, fallBackMoviePoster } from "../api/moviedb";

const { width, height } = Dimensions.get("window");

type Props = {
    data: any[];
    navigation?: any;
};

export default function TrendingMovies({ data, navigation }: Props) {
    const nav = useNavigation();

    if (!data || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mais Populares</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {data.map((item, index) => (
                    <TouchableWithoutFeedback
                        key={index}
                        onPress={() => nav.navigate("Movie", item)}
                    >
                        <View style={styles.card}>
                            <Image
                                source={{
                                    uri: item.poster_path
                                        ? image500(item.poster_path)
                                        : fallBackMoviePoster,
                                }}
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginHorizontal: 16,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    card: {
        marginRight: 16,
        width: width * 0.6,
    },
    poster: {
        width: "100%",
        height: height * 0.35,
        borderRadius: 24,
        backgroundColor: "#1F2937",
    },
    movieTitle: {
        color: "#D1D5DB",
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
});

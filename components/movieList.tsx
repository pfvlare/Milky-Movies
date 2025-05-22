import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fallBackMoviePoster, image185 } from "../api/moviedb";

const { width, height } = Dimensions.get("window");

type Props = {
    title: string;
    data: any[];
    hiddenSeeAll?: boolean;
    navigation?: any;
    onSeeAll?: () => void;
};

export default function MovieList({ title, data, hiddenSeeAll, navigation, onSeeAll }: Props) {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {!hiddenSeeAll && (
                    <TouchableOpacity onPress={onSeeAll}>
                        <Text style={styles.seeAll}>Ver Mais</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {data.map((item, index) => (
                    <TouchableWithoutFeedback
                        key={index}
                        onPress={() => navigation?.navigate("Movie", item)}
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
                                {item.title?.length > 14
                                    ? item.title.slice(0, 14) + "..."
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 16,
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold", // <- garante negrito
    },
    seeAll: {
        fontSize: 16,
        color: "#EC4899",
        fontWeight: "600",
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    movieItem: {
        marginRight: 16,
        alignItems: "flex-start",
        width: width * 0.33,
    },
    moviePoster: {
        borderRadius: 24,
        width: "100%",
        height: height * 0.22,
        backgroundColor: "#1F2937",
    },
    movieTitle: {
        color: "#D1D5DB",
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
});

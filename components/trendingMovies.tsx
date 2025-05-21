import React from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { image500, fallBackMoviePoster } from '../api/moviedb';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        marginTop: 8,
    },
    header: {
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 18,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    movieItem: {
        marginRight: 24,
        alignItems: 'flex-start',
        width: width * 0.75,
    },
    moviePoster: {
        width: '100%',
        height: height * 0.55,
        borderRadius: 24,
    },
    movieTitle: {
        color: '#D1D5DB',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 4,
    },
    watchButton: {
        backgroundColor: '#ff006e',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    watchText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default function TrendingMovies({ data }: { data: any[] }) {
    const navigation = useNavigation();

    const getYouTubeSearchUrl = (title: string) =>
        `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mais Populares</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {data.map((item, index) => (
                    <View key={index} style={styles.movieItem}>
                        <TouchableWithoutFeedback onPress={() => navigation.navigate('Movie', item)}>
                            <Image
                                source={
                                    item.poster_path
                                        ? { uri: image500(item.poster_path) }
                                        : fallBackMoviePoster
                                }
                                style={styles.moviePoster}
                            />
                        </TouchableWithoutFeedback>

                        <Text style={styles.movieTitle}>
                            {item.title?.length > 20 ? item.title.slice(0, 20) + '...' : item.title}
                        </Text>

                        <TouchableOpacity
                            style={styles.watchButton}
                            onPress={() =>
                                navigation.navigate('PlayerScreen', {
                                    videoUrl: getYouTubeSearchUrl(item.title),
                                })
                            }
                        >
                            <Text style={styles.watchText}>▶ Assistir</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

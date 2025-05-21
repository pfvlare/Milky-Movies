import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    Image,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fallBackMoviePoster, image185 } from '../api/moviedb';
import { styles as themeStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 18,
    },
    seeAll: {
        fontSize: 16,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    movieItem: {
        marginRight: 16,
        alignItems: 'flex-start',
        width: width * 0.33,
    },
    moviePoster: {
        borderRadius: 24,
        width: '100%',
        height: height * 0.22,
    },
    movieTitle: {
        color: '#D1D5DB',
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
    watchButton: {
        marginTop: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#ff006e',
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginLeft: 4,
    },
    watchText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

type Props = {
    title: string;
    data: any[];
    hiddenSeeAll?: boolean;
};

export default function MovieList({ title, data, hiddenSeeAll }: Props) {
    const navigation = useNavigation();

    const getYouTubeSearchUrl = (title: string) =>
        `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {!hiddenSeeAll && (
                    <TouchableOpacity>
                        <Text style={[themeStyles.text, styles.seeAll]}>Ver Mais</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {data.map((item, index) => (
                    <View key={index} style={styles.movieItem}>
                        <TouchableWithoutFeedback onPress={() => navigation.navigate('Movie', item)}>
                            <Image
                                source={
                                    item.poster_path
                                        ? { uri: image185(item.poster_path) }
                                        : fallBackMoviePoster
                                }
                                style={styles.moviePoster}
                            />
                        </TouchableWithoutFeedback>

                        <Text style={styles.movieTitle}>
                            {item.title.length > 14 ? item.title.slice(0, 14) + '...' : item.title}
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

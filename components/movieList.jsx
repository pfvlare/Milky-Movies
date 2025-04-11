import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Image, Dimensions, StyleSheet } from 'react-native';
import { styles as themeStyles } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { fallBackMoviePoster, image185 } from '../api/moviedb';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
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
    seeMore: {
        color: themeStyles.text,
        fontSize: 16,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    movieItem: {
        marginRight: 16,
    },
    moviePoster: {
        width: width * 0.33,
        height: height * 0.22,
        borderRadius: 24,
    },
    movieTitle: {
        color: '#D1D5DB',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 10,
    },
});

export default function MovieList({ title, data, hiddenSeeAll }) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {!hiddenSeeAll && (
                    <TouchableOpacity>
                        <Text style={styles.seeMore}>Ver Mais</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {data.map((item, index) => (
                    <TouchableWithoutFeedback
                        key={index}
                        onPress={() => navigation.push('Movie', item)}
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
                                {item.title?.length > 14
                                    ? item.title.slice(0, 14) + '...'
                                    : item.title}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </ScrollView>
        </View>
    );
}
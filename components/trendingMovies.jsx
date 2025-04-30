<<<<<<< HEAD
import { View, Text, TouchableWithoutFeedback, ScrollView, Image, Dimensions } from 'react-native';
import React from 'react';
=======
import React from 'react';
import { View, Text, TouchableWithoutFeedback, ScrollView, Image, Dimensions, StyleSheet } from 'react-native';
>>>>>>> origin/main
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
    },
    moviePoster: {
        width: width * 0.75,
        height: height * 0.55,
        borderRadius: 24,
    },
    movieTitle: {
        color: '#D1D5DB',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 10,
    },
});

export default function TrendingMovies({ data }) {
    const navigation = useNavigation();

    const handleClick = (item) => {
        navigation.navigate('Movie', item);
<<<<<<< HEAD
    }

    return (
        <View className="mb-8 mt-4 space-y-4">
            <View className="mx-4 flex-row justify-between items-center">
                <Text className="text-white text-xl">Mais Populares</Text>
=======
    };

    return (
        <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Mais Populares</Text>
>>>>>>> origin/main
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
<<<<<<< HEAD
                        contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 15 }}
                    >
                        {
                            data.map((item, index) => (
                                <TouchableWithoutFeedback key={index} onPress={() => handleClick(item)}>
                                    <View
                                        style={{
                                            marginRight: 32,
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <Image
                                            source={item.poster_path
                                                ? { uri: image500(item.poster_path) }
                                                : fallBackMoviePoster
                                            }
                                            className="rounded-3xl"
                                            style={{
                                                width: width * 0.75,
                                                height: height * 0.55
                                            }}
                                        />
                                        <Text className="text-neutral-300 ml-1 mt-2" style={{ paddingBottom: 10 }}>
                                            {item.title?.length > 20 ? item.title.slice(0, 20) + '...' : item.title}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            ))
                        }
                    </ScrollView>
                </View>
                );
}
=======
                contentContainerStyle={styles.scrollViewContent}
            >
                {data.map((item, index) => (
                    <TouchableWithoutFeedback key={index} onPress={() => handleClick(item)}>
                        <View style={styles.movieItem}>
                            <Image
                                source={
                                    item.poster_path
                                        ? { uri: image500(item.poster_path) }
                                        : fallBackMoviePoster
                                }
                                style={styles.moviePoster}
                            />
                            <Text style={styles.movieTitle}>
                                {item.title?.length > 20
                                    ? item.title.slice(0, 20) + '...'
                                    : item.title}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </ScrollView>
        </View>
    );
}
>>>>>>> origin/main

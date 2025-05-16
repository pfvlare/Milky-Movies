import React from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    ScrollView,
    Image,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { image500, fallBackMoviePoster } from '../api/moviedb';
import { RootStackParamList } from '../Navigation/Navigation';

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

type Props = {
    data: any[];
    navigation: NavigationProp<RootStackParamList>;
};

export default function TrendingMovies({ data, navigation }: Props) {
    const handleClick = (item: any) => {
        navigation.navigate('Movie', item);
    };

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
                                {item.title?.length > 20 ? item.title.slice(0, 20) + '...' : item.title}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </ScrollView>
        </View>
    );
}

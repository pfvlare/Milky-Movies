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
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/NavigationTypes';
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
    },
    moviePoster: {
        borderRadius: 24,
        width: width * 0.33,
        height: height * 0.22,
    },
    movieTitle: {
        color: '#D1D5DB',
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
});

type Props = {
    title: string;
    data: any[];
    hiddenSeeAll?: boolean;
    navigation: NavigationProp<RootStackParamList>;
};

export default function MovieList({ title, data, hiddenSeeAll, navigation }: Props) {
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
                                {item.title.length > 14 ? item.title.slice(0, 14) + '...' : item.title}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </ScrollView>
        </View>
    );
}

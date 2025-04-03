import { View, Text, TouchableWithoutFeedback, ScrollView, Image, Dimensions } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { image500, fallBackMoviePoster } from '../api/moviedb';

const { width, height } = Dimensions.get('window');

export default function TrendingMovies({ data }) {

    const navigation = useNavigation();

    const handleClick = (item) => {
        navigation.navigate('Movie', item);
    }

    return (
        <View className="mb-8 mt-4 space-y-4">
            <View className="mx-4 flex-row justify-between items-center">
                <Text className="text-white text-xl">Mais Populares</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
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

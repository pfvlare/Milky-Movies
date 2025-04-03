
import { View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Image, Dimensions } from 'react-native'
import React from 'react'
import { styles } from '../theme'
import { useNavigation } from '@react-navigation/native';
import { fallBackMoviePoster, image185 } from '../api/moviedb';

var { width, height } = Dimensions.get('window');

export default function MovieList({ title, data, hiddenSeeAll }) {

    const navigation = useNavigation();

    return (

        <View className="mb-8 space-y-4">
            <View className="mx-4 flex-row justify-between items-center">
                <Text className="text-white text-xl">{title}</Text>
                {
                    !hiddenSeeAll && (
                        <TouchableOpacity>
                            <Text style={styles.text} className="text-lg">Ver Mais</Text>
                        </TouchableOpacity>
                    )
                }
            </View>

            {/* Lista de Filmes */}
            <ScrollView
                horizontal
                showsHorizontalScroll Indicator={false}
                contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 15 }}
            >
                {
                    data.map((item, index) => {
                        return (
                            <TouchableWithoutFeedback
                                key={index}
                                onPress={() => navigation.push('Movie', item)}
                            >

                                <View className="space-y-1 mr-4">
                                    <Image
                                        source={
                                            item.poster_path ?
                                                { uri: image185(item.poster_path) } : fallBackMoviePoster
                                        }
                                        className="rounded-3xl"
                                        style={{ width: width * 0.33, height: height * 0.22 }}
                                    />
                                    <Text className="text-neutral-300 ml-1 mt-3" style={{ paddingBottom: 10 }}>
                                        {
                                            item.title.length > 14 ? item.title.slice(0, 14) + '...' : item.title
                                        }
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}
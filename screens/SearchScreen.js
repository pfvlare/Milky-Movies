import { View, Text, Dimensions, SafeAreaView, TextInput, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import Loading from '../components/loading';
import { fallBackMoviePoster, image185, searchMovies } from '../api/moviedb';
import { debounce } from 'lodash';

var {width, height} = Dimensions.get('window');

export default function SearchScreen() {

    const navigation = useNavigation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    let movieName = 'Guardiões da Galáxia';

    const handleSearch = value=>{
        if(value && value.length>2){
            // console.log('value: ',value);
            setLoading(true);
            searchMovies({
                query: value,
                include_adult: 'false',
                language: 'pt-BR',
                page: '1'
            }).then(data=>{
                setLoading(false);
                console.log('Achei os filmes: ', data);
                if(data && data.results) setResults(data.results);
            })
        }else{
            setLoading(false);
            setResults([]);
        }
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

    return (
        <SafeAreaView className="bg-neutral-800 flex-1" style={{paddingTop: 37}}>
            <View
                className="mx-4 mb-3 flex-row justify-between items-center border border-neutral-500 rounded-full"
            >
                    <TextInput
                        onChangeText={handleTextDebounce}
                        placeholder='Procurar Filmes...'
                        placeholderTextColor={'lightgrey'}
                        className="pb-1 pl-6 flex-1 text-base font-semibold text-white tracking-wide"
                        style={{paddingBottom: 10}}
                    />
                    <TouchableOpacity
                        onPress={()=> navigation.navigate('Home')}
                        className="rounded-full p-3 m-1 bg-pink-400"
                    >
                        <XMarkIcon size="25" color="white" />
                    </TouchableOpacity>
            </View>
            
            {/* Resultados */}
            {
                loading? (
                    <Loading />
                ):
                results.length>0? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingHorizontal: 15}}
                        className="space-y-3"
                    >
                        <Text className="text-white font-semibold ml-1">Resultados ({results.length})</Text>   
                            <View className="flex-row justify-between flex-wrap" style={{paddingTop: 10}}>
                                {
                                    results.map((item, index)=>{
                                        return (
                                            <TouchableWithoutFeedback
                                            key={index}
                                            onPress={()=> navigation.push("Movie", item)}
                                            >
                                                <View className="space-y-2 mb-4">
                                                    <Image className="rounded-3xl"
                                                    // source={require('../assets/images/MoviePoster1.png')}
                                                    source={
                                                        item.poster_path? 
                                                        { uri: image185(item.poster_path) } : fallBackMoviePoster  
                                                    }
                                                    style={{width: width *0.44, height: height*0.3}}
                                                    />
                                                    
                                                    <Text className="text-neutral-300 ml-1" style={{paddingTop: 10}}>
                                                        {
                                                            item.title.length>22? item.title.slice(0,22)+'...': item.title
                                                        }
                                                    </Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        )
                                    })
                                }
                            </View>
                    </ScrollView>
                ):(
                    <View className="items-center justify-center" style={{paddingTop: 150}}>
                        <Image source={require('../assets/images/MovieTime.png')}
                            className="h-64 w-64"
                            style={{opacity: 0.5}}
                        />
                        <Text className="text-lg text-neutral-600 tracking-wide" style={{paddingTop: 25}}>
                            Sem Resultados...
                        </Text>
                    </View>
                )
            }
        </SafeAreaView>
    )
}
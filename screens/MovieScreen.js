
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Image } from 'react-native' 
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { HeartIcon } from 'react-native-heroicons/solid';
import { styles, theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Cast from '../components/cast';
import MovieList from '../components/movieList';
import Loading from '../components/loading';
import { fallBackMoviePoster, fetchMoviesCredits, fetchMoviesDetails, fetchSimilarMovies, image500 } from '../api/moviedb';

var {width, height} = Dimensions.get('window');
const ios = Platform.OS == 'ios';
const topMargin = ios? '': 'mt-3';

export default function MovieScreen() {
    const {params: item} = useRoute();
    const [isFavourite, toggleFavourite] = useState(false);
    const navigation = useNavigation();
    const [cast, setCast] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [movie, setMovie] = useState({});
    // let movieName = 'Guardiões da Galáxia';
    
    useEffect(()=>{
        // console.log('itemid: ',item.id);
        setLoading(true);
        getMovieDetails(item.id);
        getMovieCredits(item.id);
        getSimilarMovies(item.id);
    },[item]);

    const getMovieDetails = async id=>{
        const data = await fetchMoviesDetails(id);
        // console.log('Peguei as informações do filme: ', data);
        if(data) setMovie(data);
        setLoading(false);
    }

    const getMovieCredits = async id=>{
        const data = await fetchMoviesCredits(id);
        // console.log('Peguei esses créditos: ', data);
        if(data && data.cast) setCast(data.cast);
    }

    const getSimilarMovies = async id=>{
        const data = await fetchSimilarMovies(id);
        // console.log('Peguei esses filmes similares: ', data);
        if(data && data.results) setSimilarMovies(data.results);
    }

    return(
        <ScrollView
            contentContainerStyle={{paddingBottom: 20}}
            className="flex-1 bg-neutral-900"
        >
            {/* Botão de Voltar, Favovitar e Poster do filme */}
            <View className="w-full">
                <SafeAreaView className={"absolute z-20 w-full flex-row justify-between items-center px-4" +topMargin}> 
                    <TouchableOpacity onPress={()=> navigation.goBack()} style={[styles.background, { marginTop:10, marginLeft: 15 }]} className="rounded-xl p-2">
                        <ChevronLeftIcon size="28" strokeWidth={2.5} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=> toggleFavourite(!isFavourite)} style={{ marginTop:10, marginRight: 15 }}>
                        <HeartIcon size="35" color={isFavourite? theme.background :"white"} />
                    </TouchableOpacity>
                </SafeAreaView>

                {
                    loading? (
                        <Loading />
                    ):(
                        <View>
                            <Image
                                // source={require('../assets/images/MoviePoster1.png')}
                                source={
                                    item.poster_path
                                        ? { uri: image500(item.poster_path) }
                                        : fallBackMoviePoster
                                }
                                style={{width, height: height*0.55}}
                            />
                            
                            <LinearGradient
                                colors={['transparent', 'rgba(23,23,23,0.8)', 'rgba(23,23,23, 1)']}
                                style={{width, height: height*0.40}}
                                start={{x: 0.5, y: 0}}
                                end={{x: 0.5, y: 1}}
                                className="absolute bottom-0"
                            />
                        </View>
                    )
                }

            </View>

            
            {/* Detalhes do Filme */}
            <View style={{marginTop: -(height *0.09)}} className="space-y-3"> 
                
                {/* Título */}
                <Text className="text-white text-center text-3xl font-bold tracking-wider">
                    {
                        item.title
                    }
                </Text>
                
                {/* Se já lançou, quando lançou e quanto tempo tem */}
                {
                    movie?.id?(
                        <Text className="text-neutral-400 font-semibold text-base text-center" style={{marginTop: 10}}> 
                            {movie?.status === "Released" ? "Lançado" : movie?.status} • {movie?.release_date?.split('-')[0]} • {movie?.runtime} min
                        </Text>
                    ):null
                }
                
                {/* Gêneros */}
                <View className="flex-row justify-center items-center">
                    {movie?.genres?.map((genre, index) => {
                        let showDot = index + 1 != movie.genres.length;
                        return (
                            <Text
                                key={index}
                                className="text-neutral-400 font-semibold text-base"
                                style={{ marginRight: showDot ? 5 : 0 }}
                            >
                                {genre?.name} {showDot ? "•" : null}
                            </Text>
                        );
                    })}
                </View>

                {/* Sinópse do filme */}
                <Text className="text-neutral-400 mx-4 tracking-wide" style={{marginTop: 15 }}>
                    {
                    movie?.overview || 'N/A'
                    }
                </Text>

            </View>

            {/* Elenco */}
            {cast.length>0 && <Cast navigation={navigation} cast={cast} />}

            {/* Filmes Semelhantes */}
            {similarMovies.length>0 && <MovieList title="Filmes Semelhantes" hiddenSeeAll={true} data={similarMovies} />}

        </ScrollView>
    )
}
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import AppLayout from "../components/AppLayout";
import { image185, fallBackMoviePoster, formatRating, formatDate } from "../hooks/useMovies";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2; // 16 padding left + right + 16 gap

interface MovieListScreenParams {
    title: string;
    data: any[];
    category?: string;
    genre?: number;
    year?: number;
}

interface Movie {
    id: number;
    title: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    vote_count?: number;
    overview?: string;
    popularity?: number;
    adult?: boolean;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    backButton: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 12,
        borderRadius: 12,
        marginRight: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
    },
    mainTitle: {
        color: "#F3F4F6",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    pinkText: {
        color: "#EC4899",
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
        textAlign: "center",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "rgba(31, 41, 55, 0.5)",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#374151",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statNumber: {
        color: "#EC4899",
        fontSize: 20,
        fontWeight: "bold",
    },
    statLabel: {
        color: "#9CA3AF",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    movieItem: {
        width: ITEM_WIDTH,
        marginBottom: 24,
        backgroundColor: "#1F2937",
        borderRadius: 16,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#374151",
    },
    posterContainer: {
        position: "relative",
        width: "100%",
        height: height * 0.28,
    },
    poster: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        backgroundColor: "#374151",
    },
    ratingBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        color: "#F59E0B",
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 4,
    },
    movieInfo: {
        padding: 12,
    },
    movieTitle: {
        color: "#F3F4F6",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        lineHeight: 18,
    },
    movieYear: {
        color: "#9CA3AF",
        fontSize: 12,
        marginBottom: 4,
    },
    moviePopularity: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    popularityText: {
        color: "#6B7280",
        fontSize: 11,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
        paddingHorizontal: 32,
    },
    emptyIcon: {
        marginBottom: 24,
        padding: 20,
        borderRadius: 50,
        backgroundColor: "rgba(156, 163, 175, 0.1)",
    },
    emptyTitle: {
        color: "#F3F4F6",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    emptyText: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyButton: {
        borderRadius: 12,
        overflow: "hidden",
    },
    emptyButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    loadingText: {
        color: "#9CA3AF",
        fontSize: 16,
        marginTop: 16,
    },
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    filterButton: {
        backgroundColor: "#1F2937",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#374151",
        flexDirection: "row",
        alignItems: "center",
    },
    filterButtonActive: {
        backgroundColor: "#EC4899",
        borderColor: "#EC4899",
    },
    filterText: {
        color: "#D1D5DB",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    filterTextActive: {
        color: "#fff",
    },
});

export default function MovieListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { title, data, category, genre, year } = route.params as MovieListScreenParams;

    const [movies, setMovies] = useState<Movie[]>(data || []);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date' | 'title'>('popularity');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setMovies(data);
        }
    }, [data]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Aqui você pode implementar uma nova busca se necessário
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
            Toast.show({
                type: "success",
                text1: "Lista atualizada",
                text2: `${movies.length} filmes carregados`
            });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            Toast.show({
                type: "error",
                text1: "Erro ao atualizar",
                text2: "Tente novamente"
            });
        } finally {
            setRefreshing(false);
        }
    };

    const sortMovies = (sortType: typeof sortBy) => {
        setSortBy(sortType);
        const sortedMovies = [...movies].sort((a, b) => {
            switch (sortType) {
                case 'popularity':
                    return (b.popularity || 0) - (a.popularity || 0);
                case 'rating':
                    return (b.vote_average || 0) - (a.vote_average || 0);
                case 'date':
                    return new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime();
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                default:
                    return 0;
            }
        });
        setMovies(sortedMovies);

        Toast.show({
            type: "info",
            text1: "Lista ordenada",
            text2: getSortLabel(sortType)
        });
    };

    const getSortLabel = (sortType: typeof sortBy) => {
        switch (sortType) {
            case 'popularity': return 'Por popularidade';
            case 'rating': return 'Por avaliação';
            case 'date': return 'Por data de lançamento';
            case 'title': return 'Por título (A-Z)';
            default: return '';
        }
    };

    const handleMoviePress = (movie: Movie) => {
        navigation.navigate("Movie" as never, movie as never);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const getMovieYear = (releaseDate?: string) => {
        if (!releaseDate) return '';
        try {
            return new Date(releaseDate).getFullYear().toString();
        } catch {
            return '';
        }
    };

    const renderMovieItem = ({ item, index }: { item: Movie; index: number }) => (
        <TouchableOpacity
            style={[
                styles.movieItem,
                { marginRight: index % 2 === 0 ? 16 : 0 }
            ]}
            onPress={() => handleMoviePress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.posterContainer}>
                <Image
                    source={
                        item.poster_path
                            ? { uri: image185(item.poster_path) }
                            : fallBackMoviePoster
                    }
                    style={styles.poster}
                />
                {item.vote_average && item.vote_average > 0 && (
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>
                            {formatRating(item.vote_average)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.release_date && (
                    <Text style={styles.movieYear}>
                        {getMovieYear(item.release_date)}
                    </Text>
                )}
                {item.popularity && (
                    <View style={styles.moviePopularity}>
                        <Ionicons name="trending-up" size={12} color="#6B7280" />
                        <Text style={styles.popularityText}>
                            {item.popularity.toFixed(0)}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>
                        <Text style={styles.pinkText}>M</Text>ilky{" "}
                        <Text style={styles.pinkText}>M</Text>ovies
                    </Text>
                    <Text style={styles.subtitle}>{title}</Text>
                </View>
            </View>

            {/* Stats */}
            {movies.length > 0 && (
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{movies.length}</Text>
                        <Text style={styles.statLabel}>Filmes</Text>
                    </View>
                    {movies.some(m => m.vote_average) && (
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {(movies.reduce((acc, m) => acc + (m.vote_average || 0), 0) / movies.length).toFixed(1)}
                            </Text>
                            <Text style={styles.statLabel}>Média</Text>
                        </View>
                    )}
                    {year && (
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{year}</Text>
                            <Text style={styles.statLabel}>Ano</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Filtros de Ordenação */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        sortBy === 'popularity' && styles.filterButtonActive
                    ]}
                    onPress={() => sortMovies('popularity')}
                >
                    <Ionicons
                        name="trending-up"
                        size={16}
                        color={sortBy === 'popularity' ? "#fff" : "#D1D5DB"}
                    />
                    <Text style={[
                        styles.filterText,
                        sortBy === 'popularity' && styles.filterTextActive
                    ]}>
                        Popular
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        sortBy === 'rating' && styles.filterButtonActive
                    ]}
                    onPress={() => sortMovies('rating')}
                >
                    <Ionicons
                        name="star"
                        size={16}
                        color={sortBy === 'rating' ? "#fff" : "#D1D5DB"}
                    />
                    <Text style={[
                        styles.filterText,
                        sortBy === 'rating' && styles.filterTextActive
                    ]}>
                        Avaliação
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        sortBy === 'date' && styles.filterButtonActive
                    ]}
                    onPress={() => sortMovies('date')}
                >
                    <Ionicons
                        name="calendar"
                        size={16}
                        color={sortBy === 'date' ? "#fff" : "#D1D5DB"}
                    />
                    <Text style={[
                        styles.filterText,
                        sortBy === 'date' && styles.filterTextActive
                    ]}>
                        Recente
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        sortBy === 'title' && styles.filterButtonActive
                    ]}
                    onPress={() => sortMovies('title')}
                >
                    <Ionicons
                        name="text"
                        size={16}
                        color={sortBy === 'title' ? "#fff" : "#D1D5DB"}
                    />
                    <Text style={[
                        styles.filterText,
                        sortBy === 'title' && styles.filterTextActive
                    ]}>
                        A-Z
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    if (loading) {
        return (
            <AppLayout>
                <SafeAreaView style={styles.container}>
                    {renderHeader()}
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#EC4899" />
                        <Text style={styles.loadingText}>Carregando filmes...</Text>
                    </View>
                </SafeAreaView>
            </AppLayout>
        );
    }

    if (!movies || movies.length === 0) {
        return (
            <AppLayout>
                <SafeAreaView style={styles.container}>
                    {renderHeader()}
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="film-outline" size={64} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyTitle}>Nenhum filme encontrado</Text>
                        <Text style={styles.emptyText}>
                            Não há filmes para exibir na categoria "{title}".{'\n'}
                            Tente explorar outras categorias.
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={handleGoBack}>
                            <LinearGradient
                                colors={["#EC4899", "#D946EF"]}
                                style={styles.emptyButtonGradient}
                            >
                                <Ionicons name="arrow-back" size={20} color="#fff" />
                                <Text style={styles.emptyButtonText}>Voltar</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={movies}
                    renderItem={renderMovieItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    numColumns={2}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#EC4899"
                            colors={["#EC4899"]}
                            title="Atualizando..."
                            titleColor="#9CA3AF"
                        />
                    }
                    columnWrapperStyle={{
                        justifyContent: 'space-between',
                    }}
                    ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                />
            </SafeAreaView>
        </AppLayout>
    );
}
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../store/userStore';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://localhost:3000';

interface FavoriteMovie {
    id: number; // ID do TMDB
    title: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    vote_count?: number;
    overview?: string;
    popularity?: number;
    added_at: number; // Timestamp local
}

interface BackendFavorite {
    id: string;
    userId: string;
    movieIds: string[]; // IDs do TMDB como strings
}

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);

    const user = useUserStore((state) => state.user);
    const profileId = user?.currentProfileId;
    const userId = user?.id;

    // Chave para AsyncStorage baseada no perfil atual
    const getStorageKey = () => `favorites_${profileId}`;

    // ================= FUNÇÕES DE STORAGE LOCAL =================

    const loadLocalFavorites = async (): Promise<FavoriteMovie[]> => {
        try {
            if (!profileId) return [];

            const key = getStorageKey();
            const stored = await AsyncStorage.getItem(key);

            if (stored) {
                const data: FavoriteMovie[] = JSON.parse(stored);
                // Garantir que todos os favoritos tenham timestamp
                return data.map(fav => ({
                    ...fav,
                    added_at: fav.added_at || Date.now()
                }));
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar favoritos locais:', error);
            return [];
        }
    };

    const saveLocalFavorites = async (newFavorites: FavoriteMovie[]) => {
        try {
            if (!profileId) return;

            const key = getStorageKey();
            await AsyncStorage.setItem(key, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Erro ao salvar favoritos locais:', error);
            throw error;
        }
    };

    // ================= FUNÇÕES DE API =================

    const syncWithBackend = async () => {
        if (!userId || !profileId) return;

        try {
            setSyncLoading(true);

            // Buscar favoritos do backend
            const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}`);

            if (response.ok) {
                const backendData: BackendFavorite = await response.json();
                const backendMovieIds = backendData.movieIds || [];

                // Carregar favoritos locais
                const localFavorites = await loadLocalFavorites();
                const localMovieIds = localFavorites.map(f => f.id.toString());

                // Encontrar diferenças
                const toAddToBackend = localMovieIds.filter(id => !backendMovieIds.includes(id));
                const toAddToLocal = backendMovieIds.filter(id => !localMovieIds.includes(id));

                // Sincronizar novos favoritos para o backend
                for (const movieId of toAddToBackend) {
                    await addToBackend(movieId);
                }

                // Buscar detalhes dos filmes que estão no backend mas não localmente
                const newMoviesFromBackend: FavoriteMovie[] = [];
                for (const movieId of toAddToLocal) {
                    try {
                        const movieDetails = await fetchMovieDetails(parseInt(movieId));
                        if (movieDetails) {
                            newMoviesFromBackend.push({
                                ...movieDetails,
                                added_at: Date.now() // Como não temos o timestamp real, usar atual
                            });
                        }
                    } catch (error) {
                        console.error(`Erro ao buscar detalhes do filme ${movieId}:`, error);
                    }
                }

                // Atualizar favoritos locais
                if (newMoviesFromBackend.length > 0) {
                    const updatedFavorites = [...localFavorites, ...newMoviesFromBackend];
                    await saveLocalFavorites(updatedFavorites);
                }

                console.log('✅ Favoritos sincronizados com sucesso');

            } else if (response.status === 404) {
                // Usuário não tem lista de favoritos, criar uma
                await createUserFavorites();
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
        } finally {
            setSyncLoading(false);
        }
    };

    const createUserFavorites = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/favorites/${userId}`, {
                method: 'POST',
            });

            if (response.ok) {
                console.log('✅ Lista de favoritos criada no backend');
                // Após criar, sincronizar favoritos locais
                const localFavorites = await loadLocalFavorites();
                for (const favorite of localFavorites) {
                    await addToBackend(favorite.id.toString());
                }
            }
        } catch (error) {
            console.error('Erro ao criar lista de favoritos:', error);
        }
    };

    const addToBackend = async (movieId: string) => {
        if (!userId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/favorites/add/${userId}/${movieId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao adicionar filme ${movieId} no backend:`, error);
            throw error;
        }
    };

    const removeFromBackend = async (movieId: string) => {
        if (!userId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/favorites/remove/${userId}/${movieId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao remover filme ${movieId} do backend:`, error);
            throw error;
        }
    };

    // ================= BUSCAR DETALHES DO FILME NO TMDB =================

    const fetchMovieDetails = async (movieId: number): Promise<FavoriteMovie | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tmdb/movie/${movieId}`);

            if (response.ok) {
                const movieData = await response.json();
                return {
                    id: movieData.id,
                    title: movieData.title,
                    poster_path: movieData.poster_path,
                    release_date: movieData.release_date,
                    vote_average: movieData.vote_average,
                    vote_count: movieData.vote_count,
                    overview: movieData.overview,
                    popularity: movieData.popularity,
                    added_at: Date.now()
                };
            }
            return null;
        } catch (error) {
            console.error(`Erro ao buscar detalhes do filme ${movieId}:`, error);
            return null;
        }
    };

    // ================= FUNÇÕES PRINCIPAIS =================

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const localFavorites = await loadLocalFavorites();
            setFavorites(localFavorites);

            // Sincronizar com backend em background
            if (userId) {
                syncWithBackend();
            }
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao carregar favoritos',
                text2: 'Tente novamente'
            });
        } finally {
            setLoading(false);
        }
    };

    const addFavorite = async (movie: Omit<FavoriteMovie, 'added_at'>) => {
        try {
            const movieWithTimestamp: FavoriteMovie = {
                ...movie,
                added_at: Date.now()
            };

            // Verificar se já não está nos favoritos
            const currentFavorites = await loadLocalFavorites();
            const isAlreadyFavorite = currentFavorites.some(fav => fav.id === movie.id);

            if (isAlreadyFavorite) {
                Toast.show({
                    type: 'info',
                    text1: 'Já está nos favoritos',
                    text2: movie.title
                });
                return false;
            }

            // Adicionar localmente
            const updatedFavorites = [movieWithTimestamp, ...currentFavorites];
            await saveLocalFavorites(updatedFavorites);

            // Adicionar no backend em background
            if (userId) {
                addToBackend(movie.id.toString()).catch(error => {
                    console.error('Erro ao sincronizar com backend:', error);
                });
            }

            Toast.show({
                type: 'success',
                text1: 'Adicionado aos favoritos',
                text2: movie.title
            });

            return true;
        } catch (error) {
            console.error('Erro ao adicionar favorito:', error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao adicionar',
                text2: 'Tente novamente'
            });
            return false;
        }
    };

    const removeFavorite = async (movieId: number) => {
        try {
            const currentFavorites = await loadLocalFavorites();
            const movieToRemove = currentFavorites.find(fav => fav.id === movieId);
            const updatedFavorites = currentFavorites.filter(fav => fav.id !== movieId);

            await saveLocalFavorites(updatedFavorites);

            // Remover do backend em background
            if (userId) {
                removeFromBackend(movieId.toString()).catch(error => {
                    console.error('Erro ao sincronizar remoção com backend:', error);
                });
            }

            Toast.show({
                type: 'info',
                text1: 'Removido dos favoritos',
                text2: movieToRemove?.title || 'Filme removido'
            });

            return true;
        } catch (error) {
            console.error('Erro ao remover favorito:', error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao remover',
                text2: 'Tente novamente'
            });
            return false;
        }
    };

    const isFavorite = useCallback((movieId: number): boolean => {
        return favorites.some(fav => fav.id === movieId);
    }, [favorites]);

    const clearAllFavorites = async () => {
        try {
            await saveLocalFavorites([]);

            // Limpar do backend (remover todos os filmes)
            if (userId) {
                for (const favorite of favorites) {
                    await removeFromBackend(favorite.id.toString()).catch(error => {
                        console.error('Erro ao remover do backend:', error);
                    });
                }
            }

            Toast.show({
                type: 'success',
                text1: 'Favoritos limpos',
                text2: 'Todos os filmes foram removidos'
            });

            return true;
        } catch (error) {
            console.error('Erro ao limpar favoritos:', error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao limpar',
                text2: 'Tente novamente'
            });
            return false;
        }
    };

    // ================= EFFECTS =================

    useEffect(() => {
        if (profileId) {
            loadFavorites();
        }
    }, [profileId, userId]);

    return {
        favorites,
        loading,
        syncLoading,
        loadFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearAllFavorites,
        syncWithBackend
    };
};
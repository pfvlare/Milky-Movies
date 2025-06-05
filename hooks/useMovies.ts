import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000'; // ou sua URL do backend

const fetcher = async (endpoint: string) => {
    try {
        console.log('🎬 Fetching:', `${API_BASE_URL}${endpoint}`);

        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        console.log('✅ Success:', endpoint, 'results:', json.results?.length || json.name || json.title || 'data loaded');

        return json;
    } catch (error) {
        console.error('❌ Error:', endpoint, error.message);
        throw error;
    }
};

// ==================== HOOKS DE FILMES ====================

export const useTrendingMovies = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher('/tmdb/trending');
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { data, isLoading, error, refetch };
};

export const useUpcomingMovies = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher('/tmdb/upcoming');
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { data, isLoading, error, refetch };
};

export const useTopRatedMovies = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher('/tmdb/top-rated');
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { data, isLoading, error, refetch };
};

export const usePopularMovies = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher('/tmdb/popular');
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { data, isLoading, error, refetch };
};

export const useMovieDetails = (id: string | number) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDetails = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher(`/tmdb/movie/${id}`);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    return { data, isLoading, error, refetch: fetchDetails };
};

export const useMovieCredits = (movieId: string | number) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCredits = async () => {
        if (!movieId) return;

        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher(`/tmdb/movie/${movieId}/credits`);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [movieId]);

    return { data, isLoading, error, refetch: fetchCredits };
};

export const useSimilarMovies = (movieId: string | number) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSimilar = async () => {
        if (!movieId) return;

        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher(`/tmdb/movie/${movieId}/similar`);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSimilar();
    }, [movieId]);

    return { data, isLoading, error, refetch: fetchSimilar };
};

export const useSearchMovies = (query: string) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchMovies = async () => {
        if (!query || query.length < 3) {
            setData(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher(`/tmdb/search?q=${encodeURIComponent(query)}`);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchMovies();
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [query]);

    return { data, isLoading, error, refetch: searchMovies };
};

// ==================== HOOKS DE PESSOA ====================

export const usePersonDetails = (personId: string | number) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPersonDetails = async () => {
        if (!personId) return;

        try {
            setIsLoading(true);
            setError(null);
            console.log('🎭 Fetching person details for ID:', personId);
            const result = await fetcher(`/tmdb/person/${personId}`);
            setData(result);
        } catch (err) {
            console.error('❌ Error fetching person details:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonDetails();
    }, [personId]);

    return { data, isLoading, error, refetch: fetchPersonDetails };
};

export const usePersonMovieCredits = (personId: string | number) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPersonMovies = async () => {
        if (!personId) return;

        try {
            setIsLoading(true);
            setError(null);
            console.log('🎬 Fetching person movie credits for ID:', personId);
            const result = await fetcher(`/tmdb/person/${personId}/movie-credits`);
            setData(result);
        } catch (err) {
            console.error('❌ Error fetching person movies:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonMovies();
    }, [personId]);

    return { data, isLoading, error, refetch: fetchPersonMovies };
};

// ==================== HOOKS DE GÊNEROS E DESCOBERTA ====================

export const useGenres = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGenres = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher('/tmdb/genres');
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    return { data, isLoading, error, refetch: fetchGenres };
};

export const useDiscoverMovies = (options: {
    genre?: number;
    year?: number;
    page?: number;
    sortBy?: string;
    voteAverageGte?: number;
    voteCountGte?: number;
} = {}) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const discoverMovies = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.genre) params.append('genre', options.genre.toString());
            if (options.year) params.append('year', options.year.toString());
            if (options.page) params.append('page', options.page.toString());
            if (options.sortBy) params.append('sortBy', options.sortBy);
            if (options.voteAverageGte) params.append('voteAverageGte', options.voteAverageGte.toString());
            if (options.voteCountGte) params.append('voteCountGte', options.voteCountGte.toString());

            const queryString = params.toString();
            const endpoint = `/tmdb/discover${queryString ? `?${queryString}` : ''}`;

            const result = await fetcher(endpoint);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        discoverMovies();
    }, [JSON.stringify(options)]);

    return { data, isLoading, error, refetch: discoverMovies };
};

// ==================== HOOKS PERSONALIZADOS PARA FUNCIONALIDADES ESPECÍFICAS ====================

// Hook para buscar filmes de múltiplas categorias de uma vez
export const useMovieCategories = () => {
    const trendingQuery = useTrendingMovies();
    const upcomingQuery = useUpcomingMovies();
    const topRatedQuery = useTopRatedMovies();
    const popularQuery = usePopularMovies();

    const isLoading = trendingQuery.isLoading || upcomingQuery.isLoading ||
        topRatedQuery.isLoading || popularQuery.isLoading;

    const hasError = trendingQuery.error || upcomingQuery.error ||
        topRatedQuery.error || popularQuery.error;

    const refetchAll = async () => {
        await Promise.all([
            trendingQuery.refetch(),
            upcomingQuery.refetch(),
            topRatedQuery.refetch(),
            popularQuery.refetch()
        ]);
    };

    return {
        trending: trendingQuery.data,
        upcoming: upcomingQuery.data,
        topRated: topRatedQuery.data,
        popular: popularQuery.data,
        isLoading,
        hasError,
        refetchAll
    };
};

// Hook para buscar detalhes completos de um filme (detalhes + créditos + similares)
export const useMovieComplete = (movieId: string | number) => {
    const detailsQuery = useMovieDetails(movieId);
    const creditsQuery = useMovieCredits(movieId);
    const similarQuery = useSimilarMovies(movieId);

    const isLoading = detailsQuery.isLoading || creditsQuery.isLoading || similarQuery.isLoading;
    const hasError = detailsQuery.error || creditsQuery.error || similarQuery.error;

    const refetchAll = async () => {
        await Promise.all([
            detailsQuery.refetch(),
            creditsQuery.refetch(),
            similarQuery.refetch()
        ]);
    };

    return {
        movie: detailsQuery.data,
        credits: creditsQuery.data,
        similar: similarQuery.data,
        isLoading,
        hasError,
        refetchAll
    };
};

// Hook para buscar informações completas de uma pessoa (detalhes + filmes)
export const usePersonComplete = (personId: string | number) => {
    const detailsQuery = usePersonDetails(personId);
    const moviesQuery = usePersonMovieCredits(personId);

    const isLoading = detailsQuery.isLoading || moviesQuery.isLoading;
    const hasError = detailsQuery.error || moviesQuery.error;

    const refetchAll = async () => {
        await Promise.all([
            detailsQuery.refetch(),
            moviesQuery.refetch()
        ]);
    };

    return {
        person: detailsQuery.data,
        movieCredits: moviesQuery.data,
        isLoading,
        hasError,
        refetchAll
    };
};

// ==================== UTILITÁRIOS PARA URLs DE IMAGENS ====================

export const image500 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;

export const image342 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w342${path}` : null;

export const image185 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w185${path}` : null;

export const image780 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w780${path}` : null;

export const imageOriginal = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/original${path}` : null;

// ==================== IMAGENS DE FALLBACK ====================

export const fallBackMoviePoster = require('../assets/images/MovieError.png');
export const fallBackPersonImage = require('../assets/images/ActorError.png');

// ==================== UTILITÁRIOS AUXILIARES ====================

// Função para formatar data
export const formatDate = (dateString: string, locale: string = 'pt-BR') => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(locale);
    } catch {
        return dateString;
    }
};

// Função para calcular idade
export const calculateAge = (birthday: string, deathday?: string) => {
    if (!birthday) return null;
    try {
        const birth = new Date(birthday);
        const end = deathday ? new Date(deathday) : new Date();
        return end.getFullYear() - birth.getFullYear();
    } catch {
        return null;
    }
};

// Função para formatar duração de filme
export const formatRuntime = (minutes: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
};

// Função para formatar gênero
export const formatGender = (gender: number) => {
    switch (gender) {
        case 1: return 'Feminino';
        case 2: return 'Masculino';
        case 3: return 'Não-binário';
        default: return 'Não especificado';
    }
};

// Função para formatar nota
export const formatRating = (rating: number) => {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
};

// Função para formatar popularidade
export const formatPopularity = (popularity: number) => {
    if (!popularity) return 'N/A';
    return popularity.toFixed(1);
};
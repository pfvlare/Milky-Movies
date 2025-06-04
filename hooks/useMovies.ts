import { useQuery } from '@tanstack/react-query';

const apiBaseUrl = 'https://api.themoviedb.org/3';
const apiKey = 'e904543c605644245d09f8df44a58e7b';

export const image500 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;
export const image342 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w342${path}` : null;
export const image185 = (path?: string) =>
    path ? `https://image.tmdb.org/t/p/w185${path}` : null;

export const fallBackMoviePoster = require('../assets/images/MovieError.png');
export const fallBackPersonImage = require('../assets/images/ActorError.png');

export const fetcher = async (path: string, params: Record<string, any> = {}) => {
    try {
        const url = new URL(`${apiBaseUrl}${path}`);
        url.searchParams.append('language', 'pt-BR');
        url.searchParams.append('api_key', apiKey);

        Object.entries(params).forEach(([key, value]) =>
            url.searchParams.append(key, value)
        );

        const response = await fetch(url.toString());
        const json = await response.json();
        return json;
    } catch (error) {
        console.error('❌ Fetch API Error:', error);
        return {};
    }
};

export const useTrendingMovies = (profileId?: string) =>
    useQuery({
        queryKey: ['trending-movies', profileId],
        queryFn: () => fetcher('/trending/movie/day'),
        enabled: !!profileId,
    });

export const useUpcomingMovies = (profileId?: string) =>
    useQuery({
        queryKey: ['upcoming-movies', profileId],
        queryFn: () => fetcher('/movie/upcoming'),
        enabled: !!profileId,
    });

export const useTopRatedMovies = (profileId?: string) =>
    useQuery({
        queryKey: ['top-rated-movies', profileId],
        queryFn: () => fetcher('/movie/top_rated'),
        enabled: !!profileId,
    });

export const useMovieDetails = (id: string | number) =>
    useQuery({
        queryKey: ['movie-details', id],
        queryFn: () => fetcher(`/movie/${id}`),
        enabled: !!id,
    });

export const useMovieCredits = (id: string | number) =>
    useQuery({
        queryKey: ['movie-credits', id],
        queryFn: () => fetcher(`/movie/${id}/credits`),
        enabled: !!id,
    });

export const useSimilarMovies = (id: string | number) =>
    useQuery({
        queryKey: ['similar-movies', id],
        queryFn: () => fetcher(`/movie/${id}/similar`),
        enabled: !!id,
    });

export const usePersonDetails = (id: string | number) =>
    useQuery({
        queryKey: ['person-details', id],
        queryFn: () => fetcher(`/person/${id}`),
        enabled: !!id,
    });

export const usePersonMovies = (id: string | number) =>
    useQuery({
        queryKey: ['person-movies', id],
        queryFn: () => fetcher(`/person/${id}/movie_credits`),
        enabled: !!id,
    });

export const useSearchMovies = (query: string) =>
    useQuery({
        queryKey: ['search-movies', query],
        queryFn: () => fetcher('/search/movie', { query }),
        enabled: !!query,
    });
export type RootStackParamList = {
    Welcome: undefined;
    Splash: undefined;
    Login: undefined;
    Register: {
        userToEdit?: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            phone: string;
            address: string;
            currentProfileId?: string;
        };
        selectedPlan?: {
            name: string;
            code: string;
            price: string;
        };
    } | undefined;
    Subscription: {
        userId: string;
        selectedPlan?: {
            name: string;
            code: string;
            price: string;
        };
        isUpdate?: boolean; // Indica se é uma atualização de assinatura
    };
    Home: undefined;
    Movie: {
        id: number;
        title?: string;
        name?: string;
        backdrop_path?: string;
        poster_path?: string;
        overview?: string;
        release_date?: string;
        first_air_date?: string;
        vote_average?: number;
        genre_ids?: number[];
        media_type?: 'movie' | 'tv';
    };
    Person: {
        id: number;
        name?: string;
        profile_path?: string;
        biography?: string;
        birthday?: string;
        place_of_birth?: string;
        known_for_department?: string;
    };
    Search: undefined;
    Favorites: undefined;
    Profile: undefined;
    ChoosePlan: {
        userId?: string;
        fromCancellation?: boolean; // Indica se veio de um cancelamento
    } | undefined;
    ChangePlan: {
        currentPlan?: {
            name: string;
            price: string;
        };
        userId?: string;
    };
    ConfirmCard: {
        cardData?: {
            cardNumber: string;
            nameCard: string;
            expiry: string;
            cvv: string;
        };
        planData?: {
            name: string;
            code: string;
            price: string;
        };
        userId: string;
    };
    PlayerScreen: {
        videoUrl: string;
        title?: string;
        subtitle?: string;
        movieId?: number;
        episodeInfo?: {
            season: number;
            episode: number;
            title: string;
        };
    };
    MovieListScreen: {
        title: string;
        data: Array<{
            id: number;
            title?: string;
            name?: string;
            poster_path?: string;
            backdrop_path?: string;
            overview?: string;
            release_date?: string;
            first_air_date?: string;
            vote_average?: number;
            media_type?: 'movie' | 'tv';
        }>;
        listType?: 'popular' | 'trending' | 'top_rated' | 'upcoming' | 'search' | 'favorites';
        genre?: {
            id: number;
            name: string;
        };
    };
    ChooseProfile: undefined;
    CreateProfiles: {
        maxProfiles: number;
        currentProfiles?: number;
        userId: string;
        planName?: string;
    };
};

// Tipos auxiliares para melhor tipagem
export type MovieData = {
    id: number;
    title?: string;
    name?: string;
    backdrop_path?: string;
    poster_path?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    media_type?: 'movie' | 'tv';
    genres?: Array<{
        id: number;
        name: string;
    }>;
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    number_of_episodes?: number;
    status?: string;
    tagline?: string;
    production_companies?: Array<{
        id: number;
        name: string;
        logo_path?: string;
    }>;
    spoken_languages?: Array<{
        iso_639_1: string;
        name: string;
    }>;
    credits?: {
        cast: Array<{
            id: number;
            name: string;
            character: string;
            profile_path?: string;
            order: number;
        }>;
        crew: Array<{
            id: number;
            name: string;
            job: string;
            department: string;
            profile_path?: string;
        }>;
    };
};

export type PersonData = {
    id: number;
    name: string;
    profile_path?: string;
    biography?: string;
    birthday?: string;
    deathday?: string;
    place_of_birth?: string;
    known_for_department?: string;
    also_known_as?: string[];
    gender: number;
    popularity: number;
    adult: boolean;
    imdb_id?: string;
    homepage?: string;
    movie_credits?: {
        cast: MovieData[];
        crew: MovieData[];
    };
    tv_credits?: {
        cast: MovieData[];
        crew: MovieData[];
    };
    combined_credits?: {
        cast: MovieData[];
        crew: MovieData[];
    };
};

export type UserData = {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    address: string;
    currentProfileId?: string;
    Subscription?: {
        id: string;
        plan: string;
        value: number;
        registeredAt: string;
        expiresAt: string;
        userId: string;
    };
    Profile?: Array<{
        id: string;
        name: string;
        color: string;
        userId: string;
    }>;
};

export type PlanData = {
    id: string;
    name: string;
    code: 'basic' | 'intermediary' | 'complete';
    price: string;
    features: string[];
    maxProfiles: number;
    maxDevices: number;
    quality: string;
    hasAds: boolean;
};

export type CardData = {
    id?: string;
    nameCard: string;
    cardNumber: string;
    expiresDate: string;
    securityCode: string;
    userId: string;
};

export type ProfileData = {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
};

// Tipos para navegação específica
export type NavigationParamList = RootStackParamList;

// Tipo para propriedades de navegação
export type NavigationProps<T extends keyof RootStackParamList> = {
    navigation: any; // Você pode tipificar mais especificamente se quiser
    route: {
        params: RootStackParamList[T];
    };
};

// Tipos para hooks de navegação
export type UseNavigationProp = any; // Você pode importar de @react-navigation/native

// Enum para tipos de mídia
export enum MediaType {
    MOVIE = 'movie',
    TV = 'tv',
    PERSON = 'person'
}

// Enum para qualidade de vídeo
export enum VideoQuality {
    SD = 'SD',
    HD = 'HD',
    FULL_HD = 'Full HD',
    ULTRA_HD = '4K'
}

// Enum para status de assinatura
export enum SubscriptionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled'
}

// Enum para planos disponíveis
export enum PlanType {
    BASIC = 'basic',
    INTERMEDIARY = 'intermediary',
    COMPLETE = 'complete'
}
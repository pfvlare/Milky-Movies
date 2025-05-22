export type Plan = {
    id: string;
    name: string;
    price: string;
};

export type RootStackParamList = {
    Welcome: undefined;
    Splash: undefined;
    Login: undefined;
    Register: { userToEdit?: any } | undefined; // Caso esteja usando para editar perfil
    Subscription: { userId: string };
    Home: undefined;
    Movie: any;
    Person: any;
    Search: undefined;
    Favorites: undefined;
    Profile: undefined;
    ChoosePlan: undefined;
    ChangePlan: {
        currentPlan: {
            name: string;
            price: string;
        };
    };
    ConfirmCard: undefined;
    PlayerScreen: {
        videoUrl: string;
    };

    // ✅ Adicionado para suportar o botão "Ver Mais"
    MovieListScreen: {
        title: string;
        data: any[];
    };
};

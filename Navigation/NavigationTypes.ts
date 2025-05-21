export type Plan = {
    id: string;
    name: string;
    price: string;
};

export type RootStackParamList = {
    Welcome: undefined;
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Subscription: undefined;
    Home: undefined;
    Movie: any;
    Person: any;
    Search: undefined;
    Favorites: undefined;
    Profile: undefined;
    ChoosePlan: undefined;
    ChangePlan: undefined;
    ConfirmCard: undefined;
    PlayerScreen: { videoUrl: string };
};

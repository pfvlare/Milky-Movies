export type RootStackParamList = {
    Welcome: undefined;
    Splash: undefined;
    Login: undefined;
    Register: { userToEdit?: any } | undefined;
    Subscription: { userId: string, selectedPlan?: any } | undefined;
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
    MovieListScreen: {
        title: string;
        data: any[];
    };

    ChooseProfile: undefined;
    CreateProfiles: {
        maxProfiles: number;
    };
};

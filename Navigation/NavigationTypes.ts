export type Plan = {
    id: string;
    name: string;
    price: string;
};

export type RootStackParamList = {
    Welcome: undefined;
    Splash: undefined;
    Login: undefined;
    Register: { selectedPlan: Plan; userToEdit?: any };
    Subscription: { userId: string };
    Home: undefined;
    Movie: { id: string };
    Person: { id: string };
    Search: undefined;
    Favorites: undefined;
    Profile: undefined;
    ChoosePlan: undefined;
    ChangePlan: undefined;
    ConfirmCard: undefined;
};

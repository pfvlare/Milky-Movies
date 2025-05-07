import { create } from "zustand";

interface Subscription {
    cardNumber?: string;
    expiry?: string;
}

interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    subscription?: Subscription;
}

interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    setSubscription: (subscription: Subscription) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,

    setUser: (user) => set({ user }),

    setSubscription: (subscription) =>
        set((state) =>
            state.user
                ? {
                    user: {
                        ...state.user,
                        subscription: {
                            ...state.user.subscription,
                            ...subscription,
                        },
                    },
                }
                : state
        ),

    clearUser: () => set({ user: null }),
}));

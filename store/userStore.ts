import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Subscription {
    cardNumber?: string;
    expiry?: string;
    planName?: string;
    planPrice?: string;
    isActive?: boolean;
    maxProfiles?: number;
}

interface Profile {
    id: string;
    name: string;
    color: string; // ✅ Adicionado para suporte ao avatar colorido
}

interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    subscription?: Subscription;
    profiles: Profile[];
    currentProfileId: string | null;
}

interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    setSubscription: (subscription: Subscription) => void;
    setCurrentProfile: (profileId: string) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
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

            setCurrentProfile: (profileId) =>
                set((state) =>
                    state.user
                        ? {
                            user: {
                                ...state.user,
                                currentProfileId: profileId,
                            },
                        }
                        : state
                ),

            clearUser: () => set({ user: null }),
        }),
        {
            name: "milky-user-store",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

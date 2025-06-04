import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/axios';

export interface Subscription {
    id: string;
    plan: string;
    value: number;
    registeredAt: string;
    expiresAt: string;
    userId: string;
}

export interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    address: string;
    password: string;
    Subscription: Subscription;
}

export function useRegister() {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/user/register', data)
            return response
        }
    });
}

export function useLogin() {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/user/login', data)
            return response.data
        }
    });
}

export function useFindById(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await api.get(`/user/find/${id}`);
            return response.data;
        },
    });
}

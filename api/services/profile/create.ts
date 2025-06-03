import { api } from '../../../utils/axios';

type CreateProfileInput = {
    name: string;
    color: string;
    userId: string;
};

export const createProfile = async (data: CreateProfileInput) => {
    const response = await api.post('/profiles', data);
    return response.data;
};

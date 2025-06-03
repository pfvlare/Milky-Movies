import { api } from '../../../utils/axios';

export const getProfilesByUser = async (userId: string) => {
    const response = await api.get(`/profiles/user/${userId}`);
    return response.data;
};

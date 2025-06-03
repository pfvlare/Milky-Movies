import { api } from '../../../utils/axios';

type EditProfileInput = {
    id: string;
    name: string;
    color: string;
};

export const editProfile = async (data: EditProfileInput) => {
    const { id, ...rest } = data;
    const response = await api.put(`/profiles/${id}`, rest);
    return response.data;
};

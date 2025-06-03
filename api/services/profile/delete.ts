import { api } from '../../../utils/axios';

export const deleteProfile = async (profileId: string) => {
    const response = await api.delete(`/profiles/${profileId}`);
    return response.data;
};

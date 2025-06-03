import axios from 'axios';
import { RegisterType } from '../../../schemas/register';
import { BACKEND_URL } from '@env';

export const registerUser = async (data: RegisterType) => {
    const response = await axios.post(`${BACKEND_URL}/user/register`, {
        ...data,
        email: data.email.toLowerCase(),
        plan: data.plan, // ✅ importante
    });

    return response.data;
};

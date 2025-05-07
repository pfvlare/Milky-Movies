import axios from 'axios';
import { RegisterType } from '../../../schemas/register';

export const registerUser = async (data: RegisterType) => {
    const response = await axios.post(`${process.env.BACKEND_URL}/user/register`, {
        ...data,
        email: data.email.toLowerCase(),
    });

    return response.data;
};

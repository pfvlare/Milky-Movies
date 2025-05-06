import axios from 'axios';
import { RegisterType } from '../../../schemas/register';

export const registerUser = async (data: RegisterType) => {
    const response = await axios.post('http://localhost:3000/user/register', {
        ...data,
        email: data.email.toLowerCase(),
    });

    return response.data;
};

import axios from "axios";
import { LoginType } from "../../../schemas/login";

type LoginResponse = {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    token?: string;
};

export const loginUser = async (payload: LoginType): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>("http://localhost:3000/user/login", payload);
        return response.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message || error?.message || "Erro desconhecido ao tentar logar.";
        throw new Error(message);
    }
};

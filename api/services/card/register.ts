import axios from "axios";
import { BACKEND_URL } from "@env";

type RegisterCardPayload = {
    cardNumber: string;
    securityCode: string;
    expiresDate: string;
    nameCard: string;
    userId: string;
};

type RegisterCardResponse = {
    id: string;
    cardNumber: string;
    securityCode: string;
    expiresDate: string;
    nameCard: string;
    userId: string;
};

export const registerCard = async (
    payload: RegisterCardPayload
): Promise<RegisterCardResponse> => {
    try {
        const response = await axios.post<RegisterCardResponse>(
            `${BACKEND_URL}/cards`,
            payload
        );
        return response.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Erro desconhecido ao cadastrar o cartão.";
        throw new Error(message);
    }
};

import axios from "axios";
import { BACKEND_URL } from "@env";

type RegisterCardPayload = {
    userId: string;
    data: {
        cardNumber: string;
        securityCode: string;
        expiresDate: string;
        nameCard: string;
    };
};

type RegisterCardResponse = {
    id: string;
    cardNumber: string;
    securityCode: string;
    expiresDate: string;
    nameCard: string;
    userId: string;
};

export const editCard = async (
    payload: RegisterCardPayload
): Promise<RegisterCardResponse> => {
    try {
        const response = await axios.post<RegisterCardResponse>(
            `${BACKEND_URL}/cards/${payload.userId}`,
            payload.data
        );
        return response.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Erro desconhecido ao editar o cartão.";
        throw new Error(message);
    }
};

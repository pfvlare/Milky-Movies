import axios from "axios";
import { BACKEND_URL } from "@env";

type EditCardPayload = {
    cardId: string;
    data: {
        cardNumber: string;
        securityCode: string;
        expiresDate: string;
        nameCard: string;
        userId: string;
    };
};

type EditCardResponse = {
    id: string;
    cardNumber: string;
    securityCode: string;
    expiresDate: string;
    nameCard: string;
    userId: string;
};

export const editCard = async (
    payload: EditCardPayload
): Promise<EditCardResponse> => {
    try {
        const response = await axios.put<EditCardResponse>(
            `${BACKEND_URL}/cards/${payload.cardId}`,
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

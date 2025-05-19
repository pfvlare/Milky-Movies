import axios from "axios";
import { BACKEND_URL } from "@env";

export type CardData = {
    id: string;
    cardNumber: string;
    nameCard: string;
    expiresDate: string;
    securityCode?: string;
    userId: string;
};

export const getCardByUserId = async (userId: string): Promise<CardData> => {
    try {
        const response = await axios.get<CardData>(`${BACKEND_URL}/cards/user/${userId}`);
        return response.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message || error?.message || "Erro ao buscar dados do cartão.";
        throw new Error(message);
    }
}
import { CardData } from "../api/services/card/get";

export function formatExpiresCard(card: CardData) {
    const date = new Date(card.expiresDate);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear()).slice(2);
    return `${month}/${year}`;
}

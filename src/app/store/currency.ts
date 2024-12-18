import { create } from "zustand";

interface CurrencyState {
    selectedCurrency: string;
    currencies: string[];
    setCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
    selectedCurrency: "🇺🇸 USD",
    currencies: [
        "🇺🇸 USD",
        "🇰🇷 KRW",
        "🇪🇺 EUR",
        "🇬🇧 GBP",
        "🇯🇵 JPY",
        "🇨🇦 CAD",
        "🇦🇺 AUD",
        "🇨🇳 CNY",
        "🇨🇭 CHF",
        "🇮🇳 INR",
        "🇸🇬 SGD",
    ],
    setCurrency: (currency) => set({ selectedCurrency: currency }),
}));
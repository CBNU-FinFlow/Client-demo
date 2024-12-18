"use client";

import { useState } from "react";
import { useCurrencyStore } from "@/app/store/currency.ts";
import {
    ArrowLeftRight,
    MessageCircle,
    Plus,
    Sparkle,
    Trash2,
} from "lucide-react";

// 실제 환경에서는 API에서 가져와야 하는 환율 데이터
const exchangeRates = {
    "🇺🇸 USD": 1,
    "🇰🇷 KRW": 1344.5,
    "🇪🇺 EUR": 0.92,
    "🇬🇧 GBP": 0.79,
    "🇯🇵 JPY": 151.62,
    "🇨🇦 CAD": 1.35,
    "🇦🇺 AUD": 1.52,
    "🇨🇳 CNY": 7.24,
    "🇨🇭 CHF": 0.89,
    "🇮🇳 INR": 83.35,
    "🇸🇬 SGD": 1.34,
};

// 통화별 심볼 매핑
const currencySymbols = {
    "🇺🇸 USD": "$",
    "🇰🇷 KRW": "₩",
    "🇪🇺 EUR": "€",
    "🇬🇧 GBP": "£",
    "🇯🇵 JPY": "¥",
    "🇨🇦 CAD": "C$",
    "🇦🇺 AUD": "A$",
    "🇨🇳 CNY": "¥",
    "🇨🇭 CHF": "CHF",
    "🇮🇳 INR": "₹",
    "🇸🇬 SGD": "S$",
};

export default function PortfolioTable() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();
    const [showAIAdvice, setShowAIAdvice] = useState(false);

    // 계좌 목록 및 선택된 계좌 상태
    const [accounts, setAccounts] = useState([
        { id: 0, name: "계좌 합계" },
        { id: 1, name: "계좌1" },
        { id: 2, name: "계좌2" },
    ]);
    const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);

    // 샘플 포트폴리오 데이터 (구매 통화 정보 포함)
    const tableData = [
        {
            id: 1,
            name: "Apple Inc",
            symbol: "AAPL",
            logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            quantity: 10,
            purchasePrice: 243.04,
            purchaseCurrency: "🇺🇸 USD",
            totalPurchase: 2430.4,
            currentPrice: 2428.4,
            dividend: 10.0,
            dividendYield: 0.41,
            totalProfit: -2.0,
            dailyProfit: -2.0,
        },
        {
            id: 2,
            name: "Tesla, Inc",
            symbol: "TSLA",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/1920px-Tesla_T_symbol.svg.png",
            quantity: 10,
            purchasePrice: 350.0,
            purchaseCurrency: "🇺🇸 USD",
            totalPurchase: 3500.0,
            currentPrice: 3892.2,
            dividend: 0.0,
            dividendYield: 0,
            totalProfit: 392.2,
            dailyProfit: 197.3,
        },
    ];

    // 통화 변환 함수
    const convertAmount = (
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ) => {
        const baseAmount = amount / exchangeRates[fromCurrency];
        return baseAmount * exchangeRates[toCurrency];
    };

    // 통화 형식 지정 함수
    const formatCurrency = (amount: number, currency: string) => {
        const symbol = currencySymbols[currency];
        const formattedAmount = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return `${symbol}${formattedAmount}`;
    };

    // 푸터에 표시될 총계 계산 (통화 변환 포함)
    const totals = tableData.reduce(
        (acc, item) => {
            const convertedPurchase = convertAmount(
                item.totalPurchase,
                item.purchaseCurrency,
                selectedCurrency
            );
            const convertedCurrent = convertAmount(
                item.currentPrice,
                item.purchaseCurrency,
                selectedCurrency
            );
            const convertedDividend = convertAmount(
                item.dividend,
                item.purchaseCurrency,
                selectedCurrency
            );
            const convertedTotalProfit = convertAmount(
                item.totalProfit,
                item.purchaseCurrency,
                selectedCurrency
            );
            const convertedDailyProfit = convertAmount(
                item.dailyProfit,
                item.purchaseCurrency,
                selectedCurrency
            );

            return {
                quantity: acc.quantity + item.quantity,
                totalPurchase: acc.totalPurchase + convertedPurchase,
                currentPrice: acc.currentPrice + convertedCurrent,
                dividend: acc.dividend + convertedDividend,
                dividendYield:
                    acc.dividendYield +
                    (item.dividendYield * convertedPurchase) / 100,
                totalProfit: acc.totalProfit + convertedTotalProfit,
                dailyProfit: acc.dailyProfit + convertedDailyProfit,
            };
        },
        {
            quantity: 0,
            totalPurchase: 0,
            currentPrice: 0,
            dividend: 0,
            dividendYield: 0,
            totalProfit: 0,
            dailyProfit: 0,
        }
    );

    // 드롭다운 토글 함수
    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    // 드롭다운 외부 클릭 처리
    const handleClickOutside = () => {
        setOpenDropdownId(null);
    };

    // 드롭다운 메뉴 액션 처리
    const handleMenuAction = (action, itemId) => {
        switch (action) {
            case "add":
                console.log("거래 추가:", itemId);
                break;
            case "transfer":
                console.log("전송:", itemId);
                break;
            case "delete":
                console.log("삭제:", itemId);
                break;
        }
        setOpenDropdownId(null);
    };

    const handleDelete = () => {
        console.log("Delete items:", selectedItems);
        setSelectedItems([]);
    };

    const handleTransfer = () => {
        console.log("Transfer items:", selectedItems);
        setSelectedItems([]);
    };

    // AI 조언 생성 함수
    const generateAIAdvice = () => {
        const totalValue = totals.currentPrice;
        const totalProfit = totals.totalProfit;
        const profitPercentage =
            (totalProfit / (totalValue - totalProfit)) * 100;

        if (profitPercentage < 0) {
            return "포트폴리오의 수익률이 마이너스를 기록하고 있습니다. 현재 보유 중인 주식들의 실적과 전망을 재검토하고, 분산 투자를 통해 리스크를 관리하는 것을 추천드립니다.";
        } else if (profitPercentage < 5) {
            return "안정적인 수익률을 보이고 있지만, 배당주 비중을 높여 정기적인 수익을 확보하는 것을 고려해보세요.";
        } else {
            return "훌륭한 포트폴리오 운용을 하고 계십니다! 지속적인 모니터링과 함께 정기적인 리밸런싱을 통해 수익을 관리하세요.";
        }
    };

    // 평균 배당 수익률 계산
    totals.dividendYield = (totals.dividend / totals.totalPurchase) * 100;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-6">
                    {/* 계좌 선택 버튼 그룹 */}
                    <div className="bg-slate-100 rounded-[0.5rem] p-1 drop-shadow-sm">
                        <div className="flex space-x-1">
                            {accounts.map((account) => (
                                <button
                                    key={account.id}
                                    onClick={() =>
                                        setSelectedAccount(account.id)
                                    }
                                    className={`px-3 py-2 rounded-[0.5rem] text-sm font-medium transition-all ${
                                        selectedAccount === account.id
                                            ? "bg-white text-slate-900"
                                            : "text-slate-400 hover:bg-slate-100"
                                    }`}
                                >
                                    {account.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* 계좌 관리 버튼 */}
                    <button className="bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            height="14"
                            width="14"
                            viewBox="0 0 489.8 489.8"
                        >
                            <g>
                                <g>
                                    <g>
                                        <path
                                            d="M469.1,182.95h-38.2c-3.1-8.3-6.2-16.6-10.3-23.8l26.9-26.9c8.3-8.2,8.3-20.6,0-28.9l-60-60c-8.2-8.3-20.6-8.3-28.9,0
                        l-27.9,27.9c-7.2-3.1-15.5-6.2-22.7-9.3v-39.3c0-11.4-9.3-20.7-20.7-20.7h-84.8c-11.4,0-20.7,9.3-20.7,20.7v37.1
                        c-8.2,3.1-15.5,6.2-22.7,9.3l-27.9-27.9c-8.2-8.3-20.6-8.3-28.9,0l-60,60c-8.3,8.2-8.3,20.6,0,28.9l26.9,26.9
                        c-4.1,8.3-7.2,15.5-10.3,23.8H20.7c-11.4,0-20.7,9.3-20.7,20.7v84.8c0,11.4,9.3,20.7,20.7,20.7h35.1c3.1,8.3,6.2,16.5,10.3,24.8
                        l-25.8,25.8c-4.1,4.1-11.6,16.3,0,28.9l60,60c8.2,8.3,20.6,8.3,28.9,0l24.8-24.8c8.2,5.2,16.5,8.3,25.8,11.4v34.1
                        c0,11.4,9.3,20.7,20.7,20.7h84.8c11.4,0,20.7-9.3,19.7-18.5v-34.1c8.2-3.1,17.5-7.3,25.8-11.4l24.8,24.8c8.2,8.3,20.6,8.3,28.9,0
                        l60-60c8.3-8.2,8.3-20.6,0-28.9l-25.8-25.8c4.1-8.3,7.2-16.5,10.3-24.8h40.1c11.4,0,20.7-9.3,20.7-20.7v-84.8
                        C489.8,192.25,480.5,182.95,469.1,182.95z M445.6,266.75h-31c-9.3,0-17.5,6.2-19.6,15.5c-4.2,15.5-9.3,30-17.6,43.4
                        c-5.2,8.3-3.1,18.6,3.1,24.8l21.7,21.7l-31,31l-20.7-20.7c-6.2-7.2-16.5-8.3-24.8-3.1c-14.5,8.3-29,14.5-44.5,18.6
                        c-9.3,2-15.5,10.3-15.5,19.6v30h-44.5v-0.1h-1v-30c0-9.3-6.2-17.5-15.5-19.6c-15.6-4.1-31.1-10.3-44.5-18.6
                        c-8.3-5.2-18.6-3.1-24.8,3.1l-20.7,20.7l-31-31l21.7-21.7c6.2-7.2,8.3-16.5,3.1-24.8c-8.3-13.4-14.5-27.9-17.6-43.4
                        c-2-9.3-10.3-15.5-19.6-15.5h-31v-44.5h33.1c9.3,0,17.5-6.2,19.6-15.5c3.1-14.5,9.3-28,17.6-41.4c5.2-8.3,3.1-18.6-3.1-24.8
                        l-23.8-23.8l31-31l23.8,23.8c7.2,6.2,16.5,8.3,24.8,3.1c13.5-7.2,26.9-13.4,41.4-16.5c9.3-2,15.5-10.3,15.5-19.6v-34.1h44.5v35.2
                        c0,9.3,6.2,17.5,15.5,19.6c14.5,3.1,29,9.3,41.4,16.5c8.3,5.2,18.6,3.1,24.8-3.1l24.8-24.8l31,31l-23.8,23.8
                        c-7.2,6.2-8.3,16.5-3.1,24.8c7.3,12.5,13.5,26.9,17.6,41.4c2,9.3,10.3,15.5,19.6,15.5h33.1V266.75z"
                                        />
                                        <path
                                            d="M242.9,132.25c-62,0-112.7,50.7-112.7,112.7s50.7,112.7,112.7,112.7c62.1,0,112.7-50.7,112.7-112.7
                        S304.9,132.25,242.9,132.25z M242.9,317.35c-39.3,0-72.4-32.1-72.4-72.4c0-39.3,32.1-72.4,72.4-72.4c40.3,0,72.4,32.1,72.4,72.4
                        C315.3,284.25,282.2,317.35,242.9,317.35z"
                                        />
                                    </g>
                                </g>
                            </g>
                        </svg>
                        계좌 관리
                    </button>
                </div>
                {/* 투자 추가 버튼 */}
                <button className="bg-white hover:bg-slate-100 text-slate-700 flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all drop-shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle
                            fill="currentColor"
                            opacity="0.3"
                            cx="12"
                            cy="12"
                            r="10"
                        ></circle>
                        <path
                            d="M11,11 L11,7 C11,6.44771525 11.4477153,6 12,6 C12.5522847,6 13,6.44771525 13,7 L13,11 L17,11 C17.5522847,11 18,11.4477153 18,12 C18,12.5522847 17.5522847,13 17,13 L13,13 L13,17 C13,17.5522847 12.5522847,18 12,18 C11.4477153,18 11,17.5522847 11,17 L11,13 L7,13 C6.44771525,13 6,12.5522847 6,12 C6,11.4477153 6.44771525,11 7,11 L11,11 Z"
                            fill="currentColor"
                        ></path>
                    </svg>
                    투자 추가
                </button>
            </div>
            {/* 포트폴리오 테이블 */}
            <div className="p-10 bg-white rounded-2xl drop-shadow-xl">
                {/* 선택 작업 버튼 영역 */}
                <div
                    className={`transform transition-all duration-300 ease-out ${
                        selectedItems.length > 0
                            ? "opacity-100 translate-y-0 mb-8"
                            : "opacity-0 -translate-y-4 mb-0 invisible h-0"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            삭제 ({selectedItems.length})
                        </button>
                        <button
                            onClick={handleTransfer}
                            className="bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            전송 ({selectedItems.length})
                        </button>
                    </div>
                </div>
                <div className="w-full">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                {/* 체크박스 열 */}
                                <th className="w-[50px] px-4 pb-3 text-left font-normal align-middle">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem] relative border-2 border-transparent checked:border-transparent checked:bg-[#3699FE] checked:before:block checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
                                        checked={
                                            selectedItems.length ===
                                            tableData.length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(
                                                    tableData.map(
                                                        (item) => item.id
                                                    )
                                                );
                                            } else {
                                                setSelectedItems([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    보유 금융 자산
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    보유량
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    구매가
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    총 구매가
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    현재가
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    배당금
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    배당 수익률
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    총 수익
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal">
                                    일간 수익
                                </th>
                                <th className="pb-3 text-left text-slate-400 font-normal"></th>
                            </tr>
                        </thead>
                        {/* 테이블 본문 */}
                        <tbody>
                            {tableData.map((item) => {
                                // 각 데이터 항목에 대한 통화 변환
                                const convertedPurchasePrice = convertAmount(
                                    item.purchasePrice,
                                    item.purchaseCurrency,
                                    selectedCurrency
                                );
                                const convertedTotalPurchase = convertAmount(
                                    item.totalPurchase,
                                    item.purchaseCurrency,
                                    selectedCurrency
                                );
                                const convertedCurrentPrice = convertAmount(
                                    item.currentPrice,
                                    item.purchaseCurrency,
                                    selectedCurrency
                                );
                                const convertedDividend = convertAmount(
                                    item.dividend,
                                    item.purchaseCurrency,
                                    selectedCurrency
                                );
                                const convertedTotalProfit = convertAmount(
                                    item.totalProfit,
                                    item.purchaseCurrency,
                                    selectedCurrency
                                );
                                const convertedDailyProfit = convertAmount(
                                    item.dailyProfit,
                                    item.purchaseCurrency,
                                    selectedCurrency
                                );

                                return (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-slate-100"
                                    >
                                        {/* 항목 체크박스 */}
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem] relative border-2 border-transparent checked:border-transparent checked:bg-[#3699FE] checked:before:block checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
                                                checked={selectedItems.includes(
                                                    item.id
                                                )}
                                                onChange={() => {
                                                    setSelectedItems((prev) =>
                                                        prev.includes(item.id)
                                                            ? prev.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      item.id
                                                              )
                                                            : [...prev, item.id]
                                                    );
                                                }}
                                            />
                                        </td>
                                        {/* 자산 정보 */}
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={item.logo}
                                                    alt={`${item.name} Logo`}
                                                    className="w-6 h-6 object-contain"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.symbol}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* 수량 */}
                                        <td className="py-3 text-slate-700">
                                            {item.quantity}
                                        </td>
                                        {/* 구매가 */}
                                        <td className="py-3 text-slate-700">
                                            {formatCurrency(
                                                convertedPurchasePrice,
                                                selectedCurrency
                                            )}
                                        </td>
                                        {/* 총 구매가 */}
                                        <td className="py-3 text-slate-700">
                                            {formatCurrency(
                                                convertedTotalPurchase,
                                                selectedCurrency
                                            )}
                                        </td>
                                        {/* 현재가 */}
                                        <td className="py-3 text-slate-700">
                                            {formatCurrency(
                                                convertedCurrentPrice,
                                                selectedCurrency
                                            )}
                                        </td>
                                        {/* 배당금 */}
                                        <td className="py-3 text-slate-700">
                                            {formatCurrency(
                                                convertedDividend,
                                                selectedCurrency
                                            )}
                                        </td>
                                        {/* 배당 수익률 */}
                                        <td className="py-3 text-slate-700">
                                            {item.dividendYield.toFixed(2)}%
                                        </td>
                                        {/* 총 수익 */}
                                        <td
                                            className={`py-3 ${
                                                convertedTotalProfit >= 0
                                                    ? "text-[#1bc5bd]"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {convertedTotalProfit >= 0
                                                ? "+"
                                                : ""}
                                            {formatCurrency(
                                                convertedTotalProfit,
                                                selectedCurrency
                                            )}
                                        </td>
                                        {/* 일간 수익 */}
                                        <td
                                            className={`py-3 ${
                                                convertedDailyProfit >= 0
                                                    ? "text-[#1bc5bd]"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {convertedDailyProfit >= 0
                                                ? "+"
                                                : ""}
                                            {formatCurrency(
                                                convertedDailyProfit,
                                                selectedCurrency
                                            )}
                                        </td>
                                        {/* 더보기 버튼 */}
                                        <td className="py-3 relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDropdown(item.id);
                                                }}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 text-gray-400 hover:text-gray-600 rounded-[0.5rem] transition-all"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 256 256"
                                                >
                                                    <g>
                                                        <path
                                                            fill="#7E8299"
                                                            d="M10,128c0,13.4,10.9,24.3,24.3,24.3s24.2-10.9,24.2-24.3s-10.9-24.3-24.3-24.3S10,114.6,10,128z"
                                                        />
                                                        <path
                                                            fill="#7E8299"
                                                            d="M103.7,128c0,13.4,10.9,24.3,24.3,24.3c13.4,0,24.3-10.9,24.3-24.3s-10.9-24.3-24.3-24.3C114.6,103.7,103.7,114.6,103.7,128L103.7,128z"
                                                        />
                                                        <path
                                                            fill="#7E8299"
                                                            d="M197.5,128c0,13.4,10.9,24.3,24.3,24.3c13.4,0,24.3-10.9,24.3-24.3c0-13.4-10.9-24.3-24.3-24.3C208.3,103.7,197.5,114.6,197.5,128z"
                                                        />
                                                    </g>
                                                </svg>
                                            </button>

                                            {/* 드롭다운 메뉴 */}
                                            {openDropdownId === item.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0"
                                                        onClick={
                                                            handleClickOutside
                                                        }
                                                    />
                                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-[0.5rem] shadow-lg z-10 py-1">
                                                        <button
                                                            onClick={() =>
                                                                handleMenuAction(
                                                                    "add",
                                                                    item.id
                                                                )
                                                            }
                                                            className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-100 flex items-center gap-2"
                                                        >
                                                            <Plus
                                                                className="w-4 h-4"
                                                                color="#b5b5c3"
                                                            />
                                                            거래 추가
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleMenuAction(
                                                                    "transfer",
                                                                    item.id
                                                                )
                                                            }
                                                            className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-100 flex items-center gap-2"
                                                        >
                                                            <ArrowLeftRight
                                                                className="w-4 h-4"
                                                                color="#b5b5c3"
                                                            />
                                                            전송
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleMenuAction(
                                                                    "delete",
                                                                    item.id
                                                                )
                                                            }
                                                            className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-slate-100 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            삭제
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {/* 테이블 푸터 (총계) */}
                        <tfoot className="border-t">
                            <tr>
                                <td className="py-3"></td>
                                <td className="py-3 font-medium text-slate-700">
                                    Total
                                </td>
                                <td className="py-3 font-medium text-slate-700">
                                    {totals.quantity}
                                </td>
                                <td className="py-3 font-medium text-slate-700"></td>
                                <td className="py-3 font-medium text-slate-700">
                                    {formatCurrency(
                                        totals.totalPurchase,
                                        selectedCurrency
                                    )}
                                </td>
                                <td className="py-3 font-medium text-slate-700">
                                    {formatCurrency(
                                        totals.currentPrice,
                                        selectedCurrency
                                    )}
                                </td>
                                <td className="py-3 font-medium text-slate-700">
                                    {formatCurrency(
                                        totals.dividend,
                                        selectedCurrency
                                    )}
                                </td>
                                <td className="py-3 font-medium text-slate-700">
                                    {totals.dividendYield.toFixed(2)}%
                                </td>
                                <td
                                    className={`py-3 font-medium ${
                                        totals.totalProfit >= 0
                                            ? "text-[#1bc5bd]"
                                            : "text-red-500"
                                    }`}
                                >
                                    {totals.totalProfit >= 0 ? "+" : ""}
                                    {formatCurrency(
                                        totals.totalProfit,
                                        selectedCurrency
                                    )}
                                </td>
                                <td
                                    className={`py-3 font-medium ${
                                        totals.dailyProfit >= 0
                                            ? "text-[#1bc5bd]"
                                            : "text-red-500"
                                    }`}
                                >
                                    {totals.dailyProfit >= 0 ? "+" : ""}
                                    {formatCurrency(
                                        totals.dailyProfit,
                                        selectedCurrency
                                    )}
                                </td>
                                <td className="py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <button
                onClick={() => setShowAIAdvice(!showAIAdvice)}
                className="my-4 float-end bg-[#b641ff] hover:bg-[#9736d4] text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all"
            >
                <Sparkle className="w-4 h-4" />
                AI 컨설턴트
            </button>

            <div
                className={`
                        clear-both w-80 transform transition-all duration-300 ease-out float-end
                        ${
                            showAIAdvice
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-4 invisible pointer-events-none"
                        }
                    `}
            >
                <div className="relative bg-[#f8f5ff] border border-[#b641ff] p-4 rounded-[0.5rem] transform transition-all duration-300 ease-out origin-top-right animate-fade-scale">
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-[#f8f5ff] border-t border-l border-[#b641ff] rotate-45 transition-transform duration-200 ease-out scale-0 animate-pop"></div>
                    <div className="flex items-start gap-2 text-[#b641ff]">
                        <MessageCircle className="w-4 h-4 mt-1 flex-shrink-0 animate-bounce" />
                        <p className="text-sm flex-grow transform transition-all duration-300 delay-150 animate-fade-up">
                            {generateAIAdvice()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

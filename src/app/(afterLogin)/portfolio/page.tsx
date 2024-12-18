"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrencyStore } from "@/app/store/currency.ts";
import { ArrowLeftRight, MessageCircle, Plus, Sparkle, Trash2 } from "lucide-react";
import axios from "axios";

interface AssetData {
	logo: string;
	name: string;
	symbol: string;
	amount: number;
	buyPrice: number;
	totalBuyPrice: number;
	currentPrice: number;
	dividend: number;
	dividendYield: number;
	totalProfit: number;
	dailyProfit: number;
	currency: string; // DB에서 불러오는 통화 (이모지 없는 코드, 예: "USD", "KRW")
}

interface SearchResult {
	logo?: string;
	name?: string;
	symbol?: string;
	currency: string; // 원래 백엔드에서 오는 통화 코드 (이모지 없는 형태로 가정)
	currentPrice?: number;
	changePercent?: number;
	high52Week?: number;
	low52Week?: number;
}

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

const currencySymbols = {
	USD: "$",
	KRW: "₩",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	CAD: "C$",
	AUD: "A$",
	CNY: "¥",
	CHF: "CHF",
	INR: "₹",
	SGD: "S$",
};

// 통화명에서 이모지 제거 함수 ("🇺🇸 USD" -> "USD")
function getCurrencyCodeFromName(name: string) {
	return name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]?\s*/gu, "").trim();
}

function StockPrice({ symbol }: { symbol: string }) {
	const [currentPrice, setCurrentPrice] = useState<number | null>(null);

	useEffect(() => {
		const fetchCurrentPrice = async () => {
			try {
				const token = localStorage.getItem("access_token");
				const response = await axios.get(`http://localhost:8000/stockPrice?ticker=${symbol}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setCurrentPrice(response.data.currentPrice);
			} catch (error) {
				console.error("Error fetching current price:", error);
			}
		};

		fetchCurrentPrice(); // 비동기 함수 호출
	}, [symbol]); // symbol이 변경될 때마다 실행

	return (
		<div>
			{currentPrice !== null ? (
				<p>
					The current price of {symbol} is ${currentPrice}
				</p>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
}

// 특정 통화를 다른 통화로 변환하는 함수
function convertAmount(amount: number, fromCurrency: string, toCurrency: string) {
	// fromCurrency, toCurrency는 "USD", "KRW" 처럼 이모지 없는 코드 가정
	const fromRate = Object.entries(exchangeRates).find(([key]) => getCurrencyCodeFromName(key) === fromCurrency);
	const toRate = Object.entries(exchangeRates).find(([key]) => getCurrencyCodeFromName(key) === toCurrency);

	const fRate = fromRate ? fromRate[1] : 1;
	const tRate = toRate ? toRate[1] : 1;

	const baseAmount = amount / fRate;
	return baseAmount * tRate;
}

function Modal({ children }: { children: React.ReactNode }) {
	return <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">{children}</div>;
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange?: (e: any) => void }) {
	return (
		<input
			type="checkbox"
			className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem]
        relative border-2 border-transparent checked:border-transparent
        checked:bg-[#3699FE] checked:before:block checked:before:content-['✓']
        checked:before:absolute checked:before:inset-0 checked:before:text-white
        checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
			checked={checked}
			onChange={onChange}
		/>
	);
}

// 티커 검색 모달
function SearchModal({
	ticker,
	setTicker,
	onSearch,
	onClose,
	searchResult,
	onAddSuccess,
	selectedCurrency,
}: {
	ticker: string;
	setTicker: (v: string) => void;
	onSearch: (ticker: string) => void;
	onClose: () => void;
	searchResult: SearchResult | null;
	onAddSuccess: (newStock: AssetData) => void;
	selectedCurrency: string;
}) {
	const [quantity, setQuantity] = useState<number>(1);
	const [purchaseCurrency, setPurchaseCurrency] = useState<string>(selectedCurrency);
	const [successModalOpen, setSuccessModalOpen] = useState(false);
	const [successModalMessage, setSuccessModalMessage] = useState<string | null>(null);
	const [isClosing, setIsClosing] = useState(false);

	const convertedCurrentPrice = useMemo(() => {
		if (!searchResult?.currentPrice) return 0;
		const from = searchResult.currency || "USD";
		const to = getCurrencyCodeFromName(purchaseCurrency);
		return convertAmount(searchResult.currentPrice, from, to);
	}, [searchResult, purchaseCurrency]);

	const [purchasePrice, setPurchasePrice] = useState<number>(convertedCurrentPrice);

	useEffect(() => {
		setPurchasePrice(convertedCurrentPrice);
	}, [convertedCurrentPrice]);

	const convertedHigh52Week = useMemo(() => {
		if (!searchResult?.high52Week) return 0;
		const from = searchResult.currency || "USD";
		const to = getCurrencyCodeFromName(purchaseCurrency);
		return convertAmount(searchResult.high52Week, from, to);
	}, [searchResult, purchaseCurrency]);

	const convertedLow52Week = useMemo(() => {
		if (!searchResult?.low52Week) return 0;
		const from = searchResult.currency || "USD";
		const to = getCurrencyCodeFromName(purchaseCurrency);
		return convertAmount(searchResult.low52Week, from, to);
	}, [searchResult, purchaseCurrency]);

	function getPureCurrencyCode(fullName: string) {
		return getCurrencyCodeFromName(fullName);
	}

	// 주식 추가 함수 내부
	const addStockToPortfolio = async () => {
		if (!searchResult) return;
		if (quantity < 1) {
			alert("수량은 1 이상의 정수를 입력해주세요.");
			return;
		}

		try {
			await axios.post(
				"http://localhost:8000/portfolio",
				{
					symbol: searchResult.symbol,
					name: searchResult.name,
					currentPrice: purchasePrice, // 구매 시점의 구매가격(이 값은 DB에 기록만 함)
					currency: getPureCurrencyCode(purchaseCurrency),
					quantity: quantity,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
					},
				}
			);

			const newStock = {
				logo: searchResult.logo || "https://via.placeholder.com/50",
				name: searchResult.name || "Unknown",
				symbol: searchResult.symbol || "Unknown",
				amount: quantity,
				buyPrice: purchasePrice,
				totalBuyPrice: purchasePrice * quantity,
				dividend: 0,
				dividendYield: 0,
				totalProfit: 0,
				dailyProfit: 0,
				currency: getPureCurrencyCode(purchaseCurrency),
			};

			onAddSuccess(newStock); // 여기서 onAddSuccess() 안에서 fetchPortfolio()를 호출하도록 한다.
			setSuccessModalMessage(`${searchResult.name} 주식 ${quantity}주가 계좌에 추가되었습니다.`);
			setSuccessModalOpen(true);
		} catch (error) {
			console.error(error);
			alert("계좌에 주식을 추가하는 데 실패했습니다.");
		}
	};

	const symbol = currencySymbols[getCurrencyCodeFromName(purchaseCurrency)] || "";

	return (
		<Modal>
			<div className="bg-white p-6 rounded-[1rem] shadow-lg w-[400px] text-center animate-fade-up">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-slate-700">티커 검색</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<input
					type="text"
					value={ticker}
					onChange={(e) => setTicker(e.target.value)}
					placeholder="티커를 입력하세요..."
					className="w-full border border-slate-200 p-2.5 rounded-lg mb-4 focus:ring focus:ring-blue-200 outline-none transition-shadow"
				/>
				<div className="flex justify-end gap-2 mb-4">
					<button onClick={() => onSearch(ticker)} className="bg-[#3699ff] hover:bg-[#1a73e8] text-white px-4 py-2 rounded-lg transition-colors shadow-md">
						검색
					</button>
					<button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-md">
						닫기
					</button>
				</div>

				{searchResult && (
					<div className="mt-6">
						<h3 className="text-lg font-semibold text-slate-700 mb-4">검색 결과:</h3>
						<div className="bg-white p-6 rounded-[1rem] shadow-lg border border-slate-200 text-left">
							<div className="flex items-center gap-4 mb-4">
								<img src={searchResult.logo || "https://via.placeholder.com/50"} alt={`${searchResult.name} Logo`} className="w-12 h-12 rounded-full" />
								<div>
									<p className="text-xl font-semibold text-slate-700">{searchResult.name || "Company Name"}</p>
									<p className="text-sm text-slate-500">{searchResult.symbol || "TICKER"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm mb-4">
								<div>
									<p className="text-slate-500">현재 가격</p>
									<p className="font-semibold text-slate-700">{searchResult.currentPrice ? `${symbol}${convertedCurrentPrice.toFixed(2)}` : "N/A"}</p>
								</div>
								<div>
									<p className="text-slate-500">변동률</p>
									<p className={`font-semibold ${searchResult.changePercent && searchResult.changePercent > 0 ? "text-[#1bc5bd]" : "text-red-500"}`}>
										{searchResult.changePercent ? `${searchResult.changePercent}%` : "N/A"}
									</p>
								</div>
								<div>
									<p className="text-slate-500">52주 최고가</p>
									<p className="font-semibold text-slate-700">{searchResult.high52Week ? `${symbol}${convertedHigh52Week.toFixed(2)}` : "N/A"}</p>
								</div>
								<div>
									<p className="text-slate-500">52주 최저가</p>
									<p className="font-semibold text-slate-700">{searchResult.low52Week ? `${symbol}${convertedLow52Week.toFixed(2)}` : "N/A"}</p>
								</div>
							</div>
							<div className="mb-4">
								<label htmlFor="quantity" className="text-slate-600 block mb-1">
									수량
								</label>
								<input
									id="quantity"
									type="number"
									min={1}
									value={quantity || ""}
									onChange={(e) => {
										const value = parseInt(e.target.value, 10);
										setQuantity(Number.isNaN(value) ? 1 : value);
									}}
									className="w-full border border-slate-200 p-2 rounded-lg focus:ring focus:ring-blue-200 outline-none transition-shadow"
								/>
							</div>
							<div className="mb-4">
								<label htmlFor="purchaseCurrency" className="text-slate-600 block mb-1">
									구매 통화
								</label>
								<select
									id="purchaseCurrency"
									value={purchaseCurrency}
									onChange={(e) => setPurchaseCurrency(e.target.value)}
									className="w-full border border-slate-200 p-2 rounded-lg focus:ring focus:ring-blue-200 outline-none transition-shadow"
								>
									{Object.keys(exchangeRates).map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
							</div>
							<div className="mb-4">
								<label htmlFor="purchasePrice" className="text-slate-600 block mb-1">
									구매 가격 ({purchaseCurrency})
								</label>
								<input
									id="purchasePrice"
									type="number"
									step="0.01"
									value={purchasePrice}
									onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
									className="w-full border border-slate-200 p-2 rounded-lg focus:ring focus:ring-blue-200 outline-none transition-shadow"
								/>
							</div>
							<button onClick={addStockToPortfolio} className="mt-4 w-full bg-[#1bc5bd] hover:bg-[#159b8c] text-white px-4 py-2 rounded-lg transition-colors shadow-md">
								계좌에 추가
							</button>

							{successModalOpen && (
								<Modal>
									<div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center animate-fade-up">
										<div className="bg-white p-6 rounded-[1rem] shadow-lg w-[400px] text-center">
											<div className="flex justify-center items-center mb-4">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-green-500 animate-bounce">
													<path fill="currentColor" d="M9 19a1 1 0 0 1-.707-.293l-5-5a1 1 0 0 1 1.414-1.414L9 16.586l10.293-10.293a1 1 0 0 1 1.414 1.414l-11 11A1 1 0 0 1 9 19Z" />
												</svg>
											</div>
											<h2 className="text-xl font-semibold text-slate-700 mb-4">성공</h2>
											<p className="text-slate-500 mb-6">{successModalMessage}</p>
											<button onClick={() => setSuccessModalOpen(false)} className="bg-[#3699ff] text-white px-6 py-2 rounded-lg transition-all">
												닫기
											</button>
										</div>
									</div>
								</Modal>
							)}
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}

function AssetRow({
	item,
	selectedCurrency,
	selectedItems,
	setSelectedItems,
	openDropdownId,
	toggleDropdown,
	handleClickOutside,
	handleMenuAction,
}: {
	item: AssetData;
	selectedCurrency: string;
	selectedItems: number[];
	setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>;
	openDropdownId: string | null;
	toggleDropdown: (id: string) => void;
	handleClickOutside: () => void;
	handleMenuAction: (action: string, symbol: string) => void;
}) {
	const itemId = item.symbol;
	const fromCur = item.currency;
	const toCur = getCurrencyCodeFromName(selectedCurrency);

	// item.currentPrice가 이미 최신화된 값
	const nowPrice = item.currentPrice;

	const convertedBuyPrice = convertAmount(item.buyPrice, fromCur, toCur);
	const convertedTotalBuyPrice = convertAmount(item.totalBuyPrice, fromCur, toCur);
	const convertedCurrentPrice = convertAmount(nowPrice, fromCur, toCur);
	const convertedDividend = convertAmount(item.dividend, fromCur, toCur);
	const convertedTotalProfit = convertAmount(item.totalProfit, fromCur, toCur);
	const convertedDailyProfit = convertAmount(item.dailyProfit, fromCur, toCur);

	const profitColor = convertedTotalProfit >= 0 ? "text-[#1bc5bd]" : "text-red-500";
	const dailyProfitColor = convertedDailyProfit >= 0 ? "text-[#1bc5bd]" : "text-red-500";

	const symbolCurrency = currencySymbols[toCur] || "";

	function formatCurrency(amount: number) {
		const formattedAmount = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `${symbolCurrency}${formattedAmount}`;
	}

	return (
		<tr className="border-b hover:bg-slate-100">
			<td className="px-4 py-3">
				<Checkbox
					checked={selectedItems.includes(itemId.charCodeAt(0))}
					onChange={() => {
						setSelectedItems((prev) => (prev.includes(itemId.charCodeAt(0)) ? prev.filter((id) => id !== itemId.charCodeAt(0)) : [...prev, itemId.charCodeAt(0)]));
					}}
				/>
			</td>
			<td className="py-3">
				<div className="flex items-center gap-2">
					<img src={item.logo} alt={`${item.name} Logo`} className="w-6 h-6 object-contain" />
					<div>
						<p className="font-medium text-slate-700">{item.name}</p>
						<p className="text-xs text-slate-500">{item.symbol}</p>
					</div>
				</div>
			</td>
			<td className="py-3 text-slate-700">{item.amount}</td>
			<td className="py-3 text-slate-700">{formatCurrency(convertedBuyPrice)}</td>
			<td className="py-3 text-slate-700">{formatCurrency(convertedTotalBuyPrice)}</td>
			<td className="py-3 text-slate-700">{formatCurrency(convertedCurrentPrice)}</td>
			<td className="py-3 text-slate-700">{formatCurrency(convertedDividend)}</td>
			<td className="py-3 text-slate-700">{item.dividendYield.toFixed(2)}%</td>
			<td className={`py-3 ${profitColor}`}>
				{convertedTotalProfit >= 0 ? "+" : ""}
				{formatCurrency(convertedTotalProfit)}
			</td>
			<td className={`py-3 ${dailyProfitColor}`}>
				{convertedDailyProfit >= 0 ? "+" : ""}
				{formatCurrency(convertedDailyProfit)}
			</td>
			<td className="py-3 relative">
				<button
					onClick={(e) => {
						e.stopPropagation();
						toggleDropdown(itemId);
					}}
					className="p-2 bg-slate-100 hover:bg-slate-200 text-gray-400 hover:text-gray-600 rounded-[0.5rem] transition-all"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256">
						<g>
							<path fill="#7E8299" d="M10,128c0,13.4,10.9,24.3,24.3,24.3s24.2-10.9,24.2-24.3s-10.9-24.3-24.3-24.3S10,114.6,10,128z" />
							<path fill="#7E8299" d="M103.7,128c0,13.4,10.9,24.3,24.3,24.3c13.4,0,24.3-10.9,24.3-24.3s-10.9-24.3-24.3-24.3C114.6,103.7,103.7,114.6,103.7,128L103.7,128z" />
							<path fill="#7E8299" d="M197.5,128c0,13.4,10.9,24.3,24.3,24.3c13.4,0,24.3-10.9,24.3-24.3c0-13.4-10.9-24.3-24.3-24.3C208.3,103.7,197.5,114.6,197.5,128z" />
						</g>
					</svg>
				</button>

				{openDropdownId === itemId && (
					<>
						<div className="fixed inset-0" onClick={handleClickOutside} />
						<div className="absolute right-0 mt-2 w-32 bg-white rounded-[0.5rem] shadow-lg z-10 py-1">
							<button onClick={() => handleMenuAction("add", item.symbol)} className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-100 flex items-center gap-2">
								<Plus className="w-4 h-4" color="#b5b5c3" />
								거래 추가
							</button>
							<button onClick={() => handleMenuAction("transfer", item.symbol)} className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-100 flex items-center gap-2">
								<ArrowLeftRight className="w-4 h-4" color="#b5b5c3" />
								전송
							</button>
							<button onClick={() => handleMenuAction("delete", item.symbol)} className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-slate-100 flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								삭제
							</button>
						</div>
					</>
				)}
			</td>
		</tr>
	);
}

function PortfolioHeader({
	accounts,
	selectedAccount,
	setSelectedAccount,
	setIsSearchModalOpen,
}: {
	accounts: { id: number; name: string }[];
	selectedAccount: number;
	setSelectedAccount: (v: number) => void;
	setIsSearchModalOpen: (v: boolean) => void;
}) {
	return (
		<div className="flex justify-between items-center mb-4">
			<div className="flex items-center gap-6">
				<div className="bg-slate-100 rounded-[0.5rem] p-1 drop-shadow-sm">
					<div className="flex space-x-1">
						{accounts.map((account) => (
							<button
								key={account.id}
								onClick={() => setSelectedAccount(account.id)}
								className={`px-3 py-2 rounded-[0.5rem] text-sm font-medium transition-all ${account.id === selectedAccount ? "bg-white text-slate-900" : "text-slate-400 hover:bg-slate-100"}`}
							>
								{account.name}
							</button>
						))}
					</div>
				</div>
				<button className="bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all">
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="14" width="14" viewBox="0 0 489.8 489.8">
						<g>
							<g>
								<g>
									<path
										d="M469.1,182.95h-38.2c-3.1-8.3-6.2-16.6-10.3-23.8l26.9-26.9c8.3-8.2,8.3-20.6,0-28.9l-60-60
										c-8.2-8.3-20.6-8.3-28.9,0l-27.9,27.9c-7.2-3.1-15.5-6.2-22.7-9.3v-39.3c0-11.4-9.3-20.7-20.7-20.7h-84.8
										c-11.4,0-20.7,9.3-20.7,20.7v37.1c-8.2,3.1-15.5,6.2-22.7,9.3l-27.9-27.9c-8.2-8.3-20.6-8.3-28.9,0l-60,60
										c-8.3,8.2-8.3,20.6,0,28.9l26.9,26.9c-4.1,8.3-7.2,15.5-10.3,23.8H20.7c-11.4,0-20.7,9.3-20.7,20.7v84.8
										c0,11.4,9.3,20.7,20.7,20.7h35.1c3.1,8.3,6.2,16.5,10.3,24.8l-25.8,25.8c-4.1,4.1-11.6,16.3,0,28.9l60,60
										c8.2,8.3,20.6,8.3,28.9,0l24.8-24.8c8.2,5.2,16.5,8.3,25.8,11.4v34.1c0,11.4,9.3,20.7,20.7,20.7h84.8
										c11.4,0,20.7-9.3,19.7-18.5v-34.1c8.2-3.1,17.5-7.3,25.8-11.4l24.8,24.8c8.2,8.3,20.6,8.3,28.9,0l60-60
										c8.3-8.2,8.3-20.6,0-28.9l-25.8-25.8c4.1-8.3,7.2-16.5,10.3-24.8h40.1c11.4,0,20.7-9.3,20.7-20.7v-84.8
										C489.8,192.25,480.5,182.95,469.1,182.95z"
									/>
									<path
										d="M242.9,132.25c-62,0-112.7,50.7-112.7,112.7s50.7,112.7,112.7,112.7c62.1,0,112.7-50.7,112.7-112.7
										S304.9,132.25,242.9,132.25z M242.9,317.35c-39.3,0-72.4-32.1-72.4-72.4c0-39.3,32.1-72.4,72.4-72.4
										c40.3,0,72.4,32.1,72.4,72.4C315.3,284.25,282.2,317.35,242.9,317.35z"
									/>
								</g>
							</g>
						</g>
					</svg>
					계좌 관리
				</button>
			</div>
			<button
				onClick={() => setIsSearchModalOpen(true)}
				className="bg-white hover:bg-slate-100 text-slate-700 flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all drop-shadow-sm"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<circle fill="currentColor" opacity="0.3" cx="12" cy="12" r="10"></circle>
					<path
						d="M11,11 L11,7 C11,6.44771525 11.4477153,6 12,6 C12.5522847,6 13,6.44771525 13,7 L13,11 L17,11 
						C17.5522847,11 18,11.4477153 18,12 C18,12.5522847 17.5522847,13 17,13 L13,13 L13,17 
						C13,17.5522847 12.5522847,18 12,18 C11.4477153,18 11,17.5522847 11,17 L11,13 
						L7,13 C6.44771525,13 6,12.5522847 6,12 
						C6,11.4477153 6.44771525,11 7,11 L11,11 Z"
						fill="currentColor"
					></path>
				</svg>
				투자 추가
			</button>
		</div>
	);
}

function PortfolioTableContent({
	portfolioData,
	selectedItems,
	setSelectedItems,
	selectedCurrency,
	handleClickOutside,
	openDropdownId,
	toggleDropdown,
	handleMenuAction,
}: {
	portfolioData: AssetData[];
	selectedItems: number[];
	setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>;
	selectedCurrency: string;
	handleClickOutside: () => void;
	openDropdownId: string | null;
	toggleDropdown: (id: string) => void;
	handleMenuAction: (action: string, symbol: string) => void;
}) {
	const toCur = getCurrencyCodeFromName(selectedCurrency);
	const symbolCurrency = currencySymbols[toCur] || "";

	const totals = useMemo(() => {
		let quantity = 0;
		let totalPurchase = 0;
		let currentPrice = 0;
		let dividend = 0;
		let dividendYield = 0;
		let totalProfit = 0;
		let dailyProfit = 0;

		for (const item of portfolioData) {
			const fromCur = item.currency;
			const q = item.amount;
			quantity += q;

			const cTotalPurchase = convertAmount(item.totalBuyPrice, fromCur, toCur);
			const cCurrentPrice = convertAmount(item.currentPrice * q, fromCur, toCur);
			const cDividend = convertAmount(item.dividend, fromCur, toCur);
			const cTotalProfit = convertAmount(item.totalProfit, fromCur, toCur);
			const cDailyProfit = convertAmount(item.dailyProfit, fromCur, toCur);

			totalPurchase += cTotalPurchase;
			currentPrice += cCurrentPrice;
			dividend += cDividend;
			dividendYield += item.dividendYield;
			totalProfit += cTotalProfit;
			dailyProfit += cDailyProfit;
		}

		const avgDividendYield = portfolioData.length > 0 ? dividendYield / portfolioData.length : 0;

		return { quantity, totalPurchase, currentPrice, dividend, avgDividendYield, totalProfit, dailyProfit };
	}, [portfolioData, selectedCurrency]);

	function formatCurrency(amount: number) {
		const formattedAmount = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `${symbolCurrency}${formattedAmount}`;
	}

	return (
		<div className="p-10 bg-white rounded-2xl drop-shadow-xl">
			<div className={`transform transition-all duration-300 ease-out ${selectedItems.length > 0 ? "opacity-100 translate-y-0 mb-8" : "opacity-0 -translate-y-4 mb-0 invisible h-0"}`}>
				<div className="flex items-center gap-2">
					<button
						onClick={() => handleMenuAction("delete", "")}
						className="bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all"
					>
						<Trash2 className="w-4 h-4" />
						삭제 ({selectedItems.length})
					</button>
					<button
						onClick={() => handleMenuAction("transfer", "")}
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
							<th className="w-[50px] px-4 pb-3 text-left font-normal align-middle">
								<Checkbox
									checked={selectedItems.length === portfolioData.length && portfolioData.length > 0}
									onChange={(e) => {
										if (e.target.checked) {
											setSelectedItems(portfolioData.map((item) => item.symbol.charCodeAt(0)));
										} else {
											setSelectedItems([]);
										}
									}}
								/>
							</th>
							<th className="pb-3 text-left text-slate-400 font-normal">보유 금융 자산</th>
							<th className="pb-3 text-left text-slate-400 font-normal">보유량</th>
							<th className="pb-3 text-left text-slate-400 font-normal">구매가</th>
							<th className="pb-3 text-left text-slate-400 font-normal">총 구매가</th>
							<th className="pb-3 text-left text-slate-400 font-normal">현재가</th>
							<th className="pb-3 text-left text-slate-400 font-normal">배당금</th>
							<th className="pb-3 text-left text-slate-400 font-normal">배당 수익률</th>
							<th className="pb-3 text-left text-slate-400 font-normal">총 수익</th>
							<th className="pb-3 text-left text-slate-400 font-normal">일간 수익</th>
							<th className="pb-3 text-left text-slate-400 font-normal"></th>
						</tr>
					</thead>
					<tbody>
						{portfolioData.map((item) => (
							<AssetRow
								key={item.symbol}
								item={item}
								selectedCurrency={selectedCurrency}
								selectedItems={selectedItems}
								setSelectedItems={setSelectedItems}
								openDropdownId={openDropdownId}
								toggleDropdown={toggleDropdown}
								handleClickOutside={handleClickOutside}
								handleMenuAction={handleMenuAction}
							/>
						))}
					</tbody>
					<tfoot className="border-t">
						<tr>
							<td className="py-3"></td>
							<td className="py-3 font-medium text-slate-700">Total</td>
							<td className="py-3 font-medium text-slate-700">{totals.quantity}</td>
							<td className="py-3 font-medium text-slate-700"></td>
							<td className="py-3 font-medium text-slate-700">{formatCurrency(totals.totalPurchase)}</td>
							<td className="py-3 font-medium text-slate-700">{formatCurrency(totals.currentPrice)}</td>
							<td className="py-3 font-medium text-slate-700">{formatCurrency(totals.dividend)}</td>
							<td className="py-3 font-medium text-slate-700">{totals.avgDividendYield.toFixed(2)}%</td>
							<td className={`py-3 font-medium ${totals.totalProfit >= 0 ? "text-[#1bc5bd]" : "text-red-500"}`}>
								{totals.totalProfit >= 0 ? "+" : ""}
								{formatCurrency(totals.totalProfit)}
							</td>
							<td className={`py-3 font-medium ${totals.dailyProfit >= 0 ? "text-[#1bc5bd]" : "text-red-500"}`}>
								{totals.dailyProfit >= 0 ? "+" : ""}
								{formatCurrency(totals.dailyProfit)}
							</td>
							<td className="py-3"></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}

export default function PortfolioTable() {
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
	const { selectedCurrency } = useCurrencyStore();
	const [showAIAdvice, setShowAIAdvice] = useState(false);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
	const [deleteTargetSymbol, setDeleteTargetSymbol] = useState<string | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [portfolioData, setPortfolioData] = useState<AssetData[]>([]);
	const [deleteSuccessModal, setDeleteSuccessModal] = useState<boolean>(false); // 삭제 성공 모달

	const [accounts, setAccounts] = useState([
		{ id: 0, name: "계좌 합계" },
		{ id: 1, name: "계좌1" },
		{ id: 2, name: "계좌2" },
	]);
	const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);

	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const [ticker, setTicker] = useState("");
	const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

	useEffect(() => {
		const storedToken = localStorage.getItem("access_token");
		if (storedToken) {
			setToken(storedToken);
		} else {
			setIsModalOpen(true);
			setTimeout(() => {
				window.location.href = "/auth/login";
			}, 2000);
		}
	}, []);

	const fetchPortfolio = async () => {
		if (!token) return;
		try {
			const response = await axios.get("http://localhost:8000/portfolio", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setPortfolioData(response.data.portfolio || []);
		} catch (error) {
			console.error(error);
			alert("포트폴리오 데이터를 가져오는 데 실패했습니다.");
		}
	};

	useEffect(() => {
		fetchPortfolio();
	}, [token]);

	const fetchTickerData = async (ticker: string) => {
		try {
			const response = await axios.get(`http://localhost:8000/searchStocks?query=${ticker}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("access_token")}`,
				},
			});
			setSearchResult(response.data);
		} catch (error) {
			console.error(error);
			alert("티커 정보를 가져오는 데 실패했습니다.");
		}
	};

	// 실시간으로 모든 종목의 현재가 가져오기
	useEffect(() => {
		const fetchPortfolio = async () => {
			if (!token) return;
			try {
				const response = await axios.get("http://localhost:8000/portfolio", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				let data: AssetData[] = response.data.portfolio || [];

				// 모든 종목에 대해 nowPrice fetch
				const tokenFromStorage = localStorage.getItem("access_token");
				const updatedData = await Promise.all(
					data.map(async (item) => {
						const nowPriceRes = await axios.get(`http://localhost:8000/stockPrice?ticker=${item.symbol}`, {
							headers: { Authorization: `Bearer ${tokenFromStorage}` },
						});
						const nowPrice = nowPriceRes.data; // 현재가

						// totalProfit과 dailyProfit 재계산(예시)
						const currentValue = nowPrice * item.amount;
						const totalProfit = currentValue - item.totalBuyPrice;
						// dailyProfit 계산을 위해 기준 가격(예: item.currentPrice)를 사용한다고 가정
						// 여기서는 현재 DB에서 주어지는 item.currentPrice를 이전 기준가로 간주
						const dailyProfit = (nowPrice - item.currentPrice) * item.amount;

						return {
							...item,
							currentPrice: nowPrice,
							totalProfit: totalProfit,
							dailyProfit: dailyProfit,
						};
					})
				);

				setPortfolioData(updatedData);
			} catch (error) {
				console.error(error);
				alert("포트폴리오 데이터를 가져오는 데 실패했습니다.");
			}
		};

		fetchPortfolio();
	}, [token]);

	const handleAddSuccess = () => {
		// 주식 추가 후 포트폴리오 재조회하여 최신 데이터 반영
		fetchPortfolio();
	};

	const toggleDropdown = (id: string) => {
		setOpenDropdownId(openDropdownId === id ? null : id);
	};

	const handleClickOutside = () => {
		setOpenDropdownId(null);
	};

	const handleMenuAction = (action: string, symbol: string) => {
		switch (action.toLowerCase()) {
			case "add":
				console.log("거래 추가:", symbol);
				break;
			case "transfer":
				console.log("전송:", symbol);
				break;
			case "delete":
				setDeleteTargetSymbol(symbol || null);
				setConfirmDeleteModal(true);
				break;
			default:
				console.log("Unknown action:", action);
				break;
		}
		setOpenDropdownId(null);
	};

	const performDelete = async () => {
		try {
			if (deleteTargetSymbol) {
				await axios.delete(`http://localhost:8000/portfolio/${deleteTargetSymbol}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
					},
				});
			} else {
				// 다중 삭제
				const selectedSymbols = selectedItems
					.map((id) => {
						return portfolioData.find((item) => item.symbol.charCodeAt(0) === id)?.symbol;
					})
					.filter(Boolean) as string[];

				for (const sym of selectedSymbols) {
					await axios.delete(`http://localhost:8000/portfolio/${sym}`, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem("access_token")}`,
						},
					});
				}
			}
			setSelectedItems([]);
			setConfirmDeleteModal(false);
			setDeleteTargetSymbol(null);
			fetchPortfolio();
			// 삭제 성공 모달 표시
			setDeleteSuccessModal(true);
		} catch (error) {
			console.error(error);
			alert("삭제에 실패했습니다.");
		}
	};

	const generateAIAdvice = () => {
		const totalValue = portfolioData.reduce((acc, i) => acc + i.currentPrice * i.amount, 0);
		const totalProfit = portfolioData.reduce((acc, i) => acc + i.totalProfit, 0);
		const profitPercentage = (totalProfit / (totalValue - totalProfit)) * 100 || 0;

		if (profitPercentage < 0) {
			return "포트폴리오의 수익률이 마이너스를 기록하고 있습니다. 현재 보유 중인 주식들의 실적과 전망을 재검토하고, 분산 투자를 통해 리스크를 관리하는 것을 추천드립니다.";
		} else if (profitPercentage < 5) {
			return "안정적인 수익률을 보이고 있지만, 배당주 비중을 높여 정기적인 수익을 확보하는 것을 고려해보세요.";
		} else {
			return "훌륭한 포트폴리오 운용을 하고 계십니다! 지속적인 모니터링과 함께 정기적인 리밸런싱을 통해 수익을 관리하세요.";
		}
	};

	if (isModalOpen) {
		return (
			<Modal>
				<div className="bg-white p-6 rounded-[1rem] shadow-lg w-[400px] text-center animate-fade-up">
					<div className="flex justify-center mb-4">
						<div className="relative w-14 h-14 flex items-center justify-center bg-[#FFE2E5] rounded-full">
							<svg className="absolute top-0 left-0 w-full h-full animate-ping opacity-75 text-[#F64E60]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<circle cx="12" cy="12" r="10" strokeWidth="2" />
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#F64E60" className="w-8 h-8">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
							</svg>
						</div>
					</div>
					<h2 className="text-xl font-semibold text-slate-700 mb-4">토큰 없음</h2>
					<p className="text-slate-500 mb-6">로그인 화면으로 이동합니다...</p>
				</div>
			</Modal>
		);
	}

	if (!token) {
		return null;
	}

	return (
		<div>
			<PortfolioHeader accounts={accounts} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} setIsSearchModalOpen={setIsSearchModalOpen} />
			<PortfolioTableContent
				portfolioData={portfolioData}
				selectedItems={selectedItems}
				setSelectedItems={setSelectedItems}
				selectedCurrency={selectedCurrency}
				handleClickOutside={handleClickOutside}
				openDropdownId={openDropdownId}
				toggleDropdown={toggleDropdown}
				handleMenuAction={handleMenuAction}
			/>
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
					${showAIAdvice ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 invisible pointer-events-none"}
				`}
			>
				<div className="relative bg-[#f8f5ff] border border-[#b641ff] p-4 rounded-[0.5rem] transform transition-all duration-300 ease-out origin-top-right animate-fade-scale">
					<div className="absolute -top-2 right-6 w-4 h-4 bg-[#f8f5ff] border-t border-l border-[#b641ff] rotate-45 transition-transform duration-200 ease-out scale-0 animate-pop"></div>
					<div className="flex items-start gap-2 text-[#b641ff]">
						<MessageCircle className="w-4 h-4 mt-1 flex-shrink-0 animate-bounce" />
						<p className="text-sm flex-grow transform transition-all duration-300 delay-150 animate-fade-up">{generateAIAdvice()}</p>
					</div>
				</div>
			</div>

			{isSearchModalOpen && (
				<SearchModal
					ticker={ticker}
					setTicker={setTicker}
					onSearch={fetchTickerData}
					onClose={() => setIsSearchModalOpen(false)}
					searchResult={searchResult}
					onAddSuccess={handleAddSuccess}
					selectedCurrency={selectedCurrency}
				/>
			)}

			{confirmDeleteModal && (
				<Modal>
					<div className="bg-white p-6 rounded-[1rem] shadow-lg w-[400px] text-center animate-fade-up">
						<h2 className="text-xl font-semibold text-slate-700 mb-4">삭제 확인</h2>
						<p className="text-slate-500 mb-6">선택된 항목을 삭제하시겠습니까?</p>
						<div className="flex gap-4 justify-center">
							<button onClick={performDelete} className="bg-[#F64E60] hover:bg-[#D63745] text-white px-6 py-2 rounded-lg transition-all">
								삭제
							</button>
							<button
								onClick={() => {
									setConfirmDeleteModal(false);
									setDeleteTargetSymbol(null);
								}}
								className="bg-gray-300 hover:bg-gray-400 text-slate-700 px-6 py-2 rounded-lg transition-all"
							>
								취소
							</button>
						</div>
					</div>
				</Modal>
			)}

			{deleteSuccessModal && (
				<Modal>
					<div className="bg-white p-6 rounded-[1rem] shadow-lg w-[400px] text-center animate-fade-up">
						<div className="flex justify-center items-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-green-500 animate-bounce">
								<path fill="currentColor" d="M9 19a1 1 0 0 1-.707-.293l-5-5a1 1 0 0 1 1.414-1.414L9 16.586l10.293-10.293a1 1 0 0 1 1.414 1.414l-11 11A1 1 0 0 1 9 19Z" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-slate-700 mb-4">삭제 성공</h2>
						<p className="text-slate-500 mb-6">선택된 항목이 성공적으로 삭제되었습니다.</p>
						<button
							onClick={() => {
								setDeleteSuccessModal(false);
							}}
							className="bg-[#3699ff] text-white px-6 py-2 rounded-lg transition-all"
						>
							확인
						</button>
					</div>
				</Modal>
			)}
		</div>
	);
}

"use client";

import Image from "next/image";
import Logo from "../../../../public/images/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCurrencyStore } from "@/app/store/currency.ts";
import { useRouter } from "next/navigation"; // useRouter 추가
import Modal from "@/app/(afterLogin)/components/Modal"; // Modal 컴포넌트 가져오기

export default function Navbar() {
	const pathname = usePathname();
	const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();
	const [currencyOpen, setCurrencyOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [logoutModalOpen, setLogoutModalOpen] = useState(false); // 로그아웃 모달 상태
	const router = useRouter(); // 페이지 이동을 위한 useRouter

	const getLinkClassName = (path: string) => {
		return pathname === path
			? "px-3 py-[0.4rem] rounded-[0.4rem] bg-slate-100 text-[#3699ff]"
			: "px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all";
	};

	const toggleCurrencyDropdown = () => {
		setCurrencyOpen(!currencyOpen);
		setProfileOpen(false);
	};

	const toggleProfileDropdown = () => {
		setProfileOpen(!profileOpen);
		setCurrencyOpen(false);
	};

	const handleLogout = () => {
		localStorage.clear(); // localStorage 삭제
		setLogoutModalOpen(true); // 로그아웃 성공 모달 열기
	};

	return (
		<nav className="w-full h-[4.25rem] fixed bg-white flex justify-between items-center drop-shadow-xl z-50">
			<div className="mx-40 flex gap-[2rem] items-center">
				<Link href="/">
					<Image src={Logo} alt="logo" width={180} />
				</Link>
				<Link href="/" className={getLinkClassName("/")}>
					홈
				</Link>
				<Link href="/news" className={getLinkClassName("/news")}>
					뉴스
				</Link>
				<Link href="/stats" className={getLinkClassName("/stats")}>
					분석
				</Link>
				<Link href="/portfolio" className={getLinkClassName("/portfolio")}>
					포트폴리오
				</Link>
				<Link href="/community" className={getLinkClassName("/community")}>
					커뮤니티
				</Link>
			</div>
			<div className="mx-40 flex gap-[1.5rem] items-center">
				{/* Currency Dropdown */}
				<div className="relative">
					<button onClick={toggleCurrencyDropdown} className="flex items-center px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all">
						{selectedCurrency}
						<svg className={`-mr-1 size-5 text-gray-400 transition-transform ${currencyOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
						</svg>
					</button>
					{currencyOpen && (
						<div
							className="absolute right-0 mt-1 w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-y-auto"
							style={{ maxHeight: "200px" }} // 스크롤 높이 제한
						>
							<div className="py-1" role="menu">
								{currencies.map((currency) => (
									<button
										key={currency}
										onClick={() => {
											setCurrency(currency);
											setCurrencyOpen(false);
										}}
										className="block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left"
										role="menuitem"
									>
										{currency}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Profile Dropdown */}
				<div className="relative">
					<button onClick={toggleProfileDropdown} className="p-1 rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all">
						<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
								<path d="M12,11 C9.79,11 8,9.21 8,7 C8,4.79 9.79,3 12,3 C14.21,3 16,4.79 16,7 C16,9.21 14.21,11 12,11 Z" fill="currentColor" opacity="0.3"></path>
								<path
									d="M3,20.2 C3.39,15.43 7.26,13 11.98,13 C16.77,13 20.7,15.29 21,20.2 C21.01,20.4 21,21 20.25,21 C16.54,21 11.03,21 3.72,21 C3.48,21 2.98,20.46 3,20.2 Z"
									fill="currentColor"
								></path>
							</g>
						</svg>
					</button>
					{profileOpen && (
						<div className="absolute right-0 mt-1 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
							<div className="py-1" role="menu">
								{["프로필 정보", "내 계정", "알림", "FAQ", "로그아웃"].map((item) => (
									<button
										key={item}
										onClick={() => {
											if (item === "로그아웃") {
												handleLogout();
											}
										}}
										className="block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left"
										role="menuitem"
									>
										{item}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
			{/* 로그아웃 성공 모달 */}
			{logoutModalOpen && (
				<Modal>
					<div className="bg-white p-6 rounded-[1rem] shadow-lg w-[400px] text-center animate-fade-up">
						<div className="flex justify-center items-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-green-500 animate-bounce">
								<path fill="currentColor" d="M9 19a1 1 0 0 1-.707-.293l-5-5a1 1 0 0 1 1.414-1.414L9 16.586l10.293-10.293a1 1 0 0 1 1.414 1.414l-11 11A1 1 0 0 1 9 19Z" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-slate-700 mb-4">로그아웃 성공</h2>
						<p className="text-slate-500 mb-6">홈페이지로 이동합니다.</p>
						<button
							onClick={() => {
								setLogoutModalOpen(false);
								router.push("/");
							}}
							className="w-full bg-[#3699ff] hover:bg-[#1086ff] text-white px-4 py-2 rounded-lg transition-colors shadow-md"
						>
							확인
						</button>
					</div>
				</Modal>
			)}
		</nav>
	);
}

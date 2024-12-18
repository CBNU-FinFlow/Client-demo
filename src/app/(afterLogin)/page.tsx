"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import SideImage from "../../../public/images/profit-and-loss.png";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        AOS.init();
    }, []);

    return (
        <>
            <div className="flex justify-between items-center px-36 mb-9">
                <div>
                    <h1
                        className="text-5xl font-bold text-slate-700 mb-5"
                        data-aos="fade-right"
                        data-aos-duration="800"
                        data-aos-delay="100"
                    >
                        포트폴리오 관리,
                    </h1>
                    <p
                        className="text-3xl text-slate-700 mb-9"
                        data-aos="fade-right"
                        data-aos-duration="800"
                        data-aos-delay="300"
                    >
                        이제 AI와 함께 더 똑똑하게
                    </p>
                    <button
                        className="bg-[#3699ff] hover:bg-[#1086ff] px-6 py-3 text-sm text-white rounded-[0.75rem]"
                        data-aos="fade-up"
                        data-aos-duration="800"
                        data-aos-delay="500"
                        onClick={() => router.push('/portfolio')}
                    >
                        바로 시작하기
                    </button>
                </div>
                <Image src={SideImage} alt="side_image" width={390} />
            </div>
            <div className="flex justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="67.5"
                    viewBox="0 -960 960 960"
                    width="67.5"
                    fill="#939baa"
                    className="animate-[bounce_1.5s_infinite]"
                >
                    <path d="M480-385.077q-6.462 0-11.923-2.115-5.462-2.116-10.692-7.346L281.846-570.077q-5.615-5.615-6-13.769-.385-8.154 6-14.539 6.385-6.384 14.154-6.384t14.154 6.384L480-428.539l169.846-169.846q5.615-5.615 13.769-6 8.154-.384 14.539 6 6.385 6.385 6.385 14.154 0 7.77-6.385 14.154L502.615-394.538q-5.23 5.23-10.692 7.346-5.461 2.115-11.923 2.115Z"></path>
                </svg>
            </div>
        </>
    );
}

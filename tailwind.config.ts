import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            dropShadow: {
                xl: "0 10px 15px rgba(0, 0, 0, 0.07)",
            },
            keyframes: {
                "fade-scale": {
                    "0%": {
                        opacity: "0",
                        transform: "scale(0.95)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "scale(1)",
                    },
                },
                pop: {
                    "0%": { transform: "rotate(45deg) scale(0)" },
                    "80%": { transform: "rotate(45deg) scale(1.2)" },
                    "100%": { transform: "rotate(45deg) scale(1)" },
                },
                "fade-up": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(10px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
            },
            animation: {
                "fade-scale": "fade-scale 0.3s ease-out",
                pop: "pop 0.3s ease-out forwards",
                "fade-up": "fade-up 0.3s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

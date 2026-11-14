import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lupetti: {
          teal: "#4EA898",
          tealLight: "#E6F6F3",
          tealDark: "#388577",
          sky: "#56ACE0",
          skyLight: "#EAF6FD",
          skyDark: "#398BBF",
          pink: "#F2A4C0",
          pinkLight: "#FDF0F5",
          peach: "#F3C1B5",
          charcoal: "#334155",
        },
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "sans-serif"],
        display: ["Fredoka", "Nunito", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px -8px rgba(78, 168, 152, 0.14)",
        card: "0 8px 24px -6px rgba(86, 172, 224, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;


import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Original names for form compatibility
        navy: {
          DEFAULT: "#0C193D", // Marine profond
          light: "#112046",   // Marine moyen
          elevated: "#1a2c5a",
          dark: "#050b1a",
        },
        "green-serma": "#378964", // Vert tech

        // Exact Colors defined in CDC
        marine: {
          profond: "#0C193D",
          moyen: "#112046",
        },
        orange: {
          DEFAULT: "#E07F0A", // Orange logo
          logo: "#E07F0A",
          sature: "#E58A10",
          contrast: "#C86E09", // For text-on-white contrast
          hover: "#E58A10",
        },
        vert: {
          tech: "#378964",
          DEFAULT: "#378964",
        },
        gris: {
          bleute: "#F4F6FB",
          texte: "#4A4E69",
        },
        muted: "#4A4E69",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        dmsans: ["var(--font-dmsans)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        // Compatibility mappings
        syne: ["var(--font-playfair)", "serif"], // Maps old syne usage to Playfair Display
      },
      boxShadow: {
        orange: "0 0 24px rgba(224,127,10,0.35), 0 4px 12px rgba(224,127,10,0.15)",
        "orange-sm": "0 0 12px rgba(224,127,10,0.25)",
        card: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(224,127,10,0.07) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 90% 110%, rgba(55,137,100,0.04) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};
export default config;

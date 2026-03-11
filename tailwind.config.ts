import type { Config } from "tailwindcss";

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        parchment: "#F0EBE1",
        "warm-brown": "#3D2B1F",
        charcoal: "#4A3728",
        muted: "#6B5D52",
        terracotta: "#C0634C",
        "terra-light": "#F5E6E1",
      },
      fontFamily: {
        sans: ["DM Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
} satisfies Config;

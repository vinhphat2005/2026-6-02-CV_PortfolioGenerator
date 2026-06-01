import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))"
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"]
      },
      boxShadow: {
        page: "0 18px 40px rgba(15, 23, 42, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;

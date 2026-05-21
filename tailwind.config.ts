import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Noto Sans JP を標準フォントに設定
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'sans-serif'],
      },
      // パスピカ専用のブランドカラー（ロゴ抽出色）
      colors: {
        brand: {
          50: '#fffbf0',
          100: '#fef3d1',
          200: '#fde392',
          300: '#fbc94d',
          400: '#f9aa16',
          500: '#F5A623', // ロゴのベースカラーに近い色
          600: '#d76503',
          700: '#b24406',
          800: '#8f350c',
          900: '#762d0e',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
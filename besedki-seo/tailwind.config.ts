import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF6EF',
        surface: '#FFFFFF',
        text: { DEFAULT: '#2B2A26', muted: '#6B6558' },
        accent: { DEFAULT: '#3F6E52', hover: '#335A43', alt: '#B5652F' },
        border: '#E6DFD1',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1280px',
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [typography],
};

export default config;

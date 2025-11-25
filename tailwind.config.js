/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Mapping user provided colors to Tailwind scale
        primary: {
          50: '#F4ECFF',  // Lavender Mist
          100: '#E2D4FF', // Lilac Glow
          200: '#D5C2FF', // Interpolated
          300: '#C8AFFF', // Soft Orchid
          400: '#B696FF', // Interpolated
          500: '#A377FF', // Amethyst (Primary)
          600: '#7B3FE4', // Royal Purple (Hover)
          700: '#522099', // Deep Violet
          800: '#2E1247', // Midnight Plum
          900: '#16091F', // Inked Eggplant
          950: '#0B0410', // Darker Inked Eggplant
        },
        purple: {
          50: '#F4ECFF',  // Lavender Mist
          100: '#E2D4FF', // Lilac Glow
          200: '#D5C2FF', // Interpolated
          300: '#C8AFFF', // Soft Orchid
          400: '#B696FF', // Interpolated
          500: '#A377FF', // Amethyst (Primary)
          600: '#7B3FE4', // Royal Purple (Hover)
          700: '#522099', // Deep Violet
          800: '#2E1247', // Midnight Plum
          900: '#16091F', // Inked Eggplant
          950: '#0B0410', // Darker Inked Eggplant
        },
        // Overwrite other colors to force purple vibes if used accidentally
        indigo: {
          50: '#F4ECFF', 100: '#E2D4FF', 500: '#7B3FE4', 600: '#522099', 900: '#16091F'
        },
        violet: {
          50: '#F4ECFF', 100: '#E2D4FF', 500: '#A377FF', 600: '#7B3FE4', 900: '#2E1247'
        },
        fuchsia: {
          50: '#F4ECFF', 100: '#E2D4FF', 500: '#A377FF', 600: '#7B3FE4', 900: '#2E1247'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
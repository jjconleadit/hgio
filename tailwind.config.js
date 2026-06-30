/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#EDE8DC',
        ink: '#15120F',
        riot: '#FF4D1C',
        mustard: '#D9A92B',
        slate: '#3D4654',
        paper: '#F7F3E9',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
        body: ['var(--font-body)'],
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-2px,1px)' },
          '40%': { transform: 'translate(2px,-1px)' },
          '60%': { transform: 'translate(-1px,2px)' },
          '80%': { transform: 'translate(1px,-2px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glitch: 'glitch 0.25s steps(2) infinite',
        marquee: 'marquee 22s linear infinite',
        blink: 'blink 1s step-start infinite',
        rise: 'rise 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};

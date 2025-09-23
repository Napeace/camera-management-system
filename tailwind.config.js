/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Dark theme colors berdasarkan design
        dark: {
          bg: '#0a1628',          // Background utama (sangat gelap)
          card: '#1a2332',        // Background untuk card/panel
          border: '#2d3748',      // Border color
        },
        // Sidebar-specific colors - sesuai design
        sidebar: {
          bg: '#0f172a',          // slate-900 (original)
          floating: '#1e293b',    // slate-800 - warna untuk floating sidebar
          border: '#334155',      // slate-700
          hover: '#475569',       // slate-600 - lebih terang untuk hover
          toggle: '#4b5563',      // gray-600
          'toggle-hover': '#6b7280', // gray-500
        }
      },
      spacing: {
        // Sidebar-specific spacing
        'sidebar-collapsed': '4rem',    // 64px (w-16)
        'sidebar-expanded': '16rem',    // 256px (w-64)
        'toggle-btn': '1.5rem',         // 24px (w-6 h-6)
      },
      width: {
        'sidebar-collapsed': '4rem',
        'sidebar-expanded': '16rem',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'slide-up': 'slide-up 0.7s ease-out',
        'slide-up-delay-200': 'slide-up 0.7s ease-out 0.2s both',
        'slide-up-delay-300': 'slide-up 0.7s ease-out 0.3s both',
        'bounce-subtle': 'bounce-subtle 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Sidebar-specific animations
        'sidebar-slide': 'sidebar-slide 0.3s ease-in-out',
        'menu-expand': 'menu-expand 0.2s ease-out',
        // Notification animation
        'slideDown': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(10px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        'slide-up': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          }
        },
        'bounce-subtle': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        },
        'scale-in': {
          'from': { 
            opacity: '0', 
            transform: 'scale(0.9)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'scale(1)' 
          }
        },
        // Sidebar-specific keyframes
        'sidebar-slide': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' }
        },
        'menu-expand': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(-10px) scale(0.95)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          }
        },
        // Notification keyframe
        'slideDown': {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      transitionDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      // Sidebar-specific utilities
      backdropBlur: {
        'sidebar': '8px',
      },
      boxShadow: {
        'sidebar': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'toggle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        // Enhanced shadow untuk floating effect
        'floating': '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.3)',
      },
      zIndex: {
        'sidebar': '40',
        'sidebar-overlay': '30',
        'sidebar-toggle': '50',
        'notification': '9999',  // Tambah ini untuk notification
        'notification-overlay': '9998'  // Dan ini untuk overlay
      }
    },
  },
  plugins: [
    // Custom plugin for sidebar utilities
    function({ addUtilities, theme }) {
      const sidebarUtilities = {
        '.sidebar-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.slate.600'),
            'border-radius': '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.slate.500'),
          },
        },
      }
      
      addUtilities(sidebarUtilities)
    }
  ],
}
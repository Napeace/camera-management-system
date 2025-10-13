/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
        // Login page animations
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        // Eye icon animations
        'eye-fade-in': 'eye-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'eye-fade-out': 'eye-fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'eye-reveal': 'eye-reveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'eye-hide': 'eye-hide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-in': {
          'from': { 
            opacity: '0', 
          },
          'to': { 
            opacity: '1', 
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
        },
        // Login page keyframes
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)'
          },
          '33%': {
            transform: 'translateY(-10px) rotate(1deg)'
          },
          '66%': {
            transform: 'translateY(5px) rotate(-1deg)'
          }
        },
        // Eye icon keyframes - smooth transitions
        'eye-fade-in': {
          'from': {
            opacity: '0',
            transform: 'scale(0.8) rotate(-10deg)'
          },
          'to': {
            opacity: '1',
            transform: 'scale(1) rotate(0deg)'
          }
        },
        'eye-fade-out': {
          'from': {
            opacity: '1',
            transform: 'scale(1) rotate(0deg)'
          },
          'to': {
            opacity: '0',
            transform: 'scale(0.8) rotate(10deg)'
          }
        },
        'eye-reveal': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.7) translateY(8px) rotate(-15deg)'
          },
          '50%': {
            opacity: '0.5',
            transform: 'scale(1.1) translateY(-2px) rotate(5deg)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0px) rotate(0deg)'
          }
        },
        'eye-hide': {
          '0%': {
            opacity: '1',
            transform: 'scale(1) translateY(0px) rotate(0deg)'
          },
          '50%': {
            opacity: '0.5',
            transform: 'scale(1.1) translateY(-2px) rotate(-5deg)'
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.7) translateY(8px) rotate(15deg)'
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
        'glass': '12px',
      },
      boxShadow: {
        'sidebar': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'toggle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        // Enhanced shadow untuk floating effect
        'floating': '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.3)',
        // Glassmorphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      },
      zIndex: {
        'sidebar': '40',
        'sidebar-overlay': '30',
        'sidebar-toggle': '50',
        'notification': '9999',
        'notification-overlay': '9998'
      },
      // Background gradients
      backgroundImage: {
        'login-gradient': 'linear-gradient(-45deg, #0f172a, #1e293b, #3730a3, #6366f1)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backgroundSize: {
        'login-bg': '400% 400%',
      },
      // Transition timing functions untuk eye animations
      transitionTimingFunction: {
        'eye-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'eye-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [
    // Plugin untuk glassmorphism utilities
    function({ addUtilities }) {
      const glassUtilities = {
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-card-hover': {
          background: 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.eye-transition': {
          'transition-property': 'opacity, transform',
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '300ms',
        }
      }
      
      addUtilities(glassUtilities)
    }
  ],
}
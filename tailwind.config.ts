import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx,js,jsx}",
		"./components/**/*.{ts,tsx,js,jsx}",
		"./app/**/*.{ts,tsx,js,jsx}",
		"./src/**/*.{ts,tsx,js,jsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Plus Jakarta Sans', 'sans-serif'],
				display: ['Syne', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					dark: 'hsl(var(--primary-dark))',
					darker: 'hsl(var(--primary-darker))',
					hover: 'hsl(var(--primary-hover))',
					light: 'hsl(var(--primary-light))',
					glow: 'hsl(var(--primary-glow))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				surface: {
					1: 'hsl(var(--surface-1))',
					2: 'hsl(var(--surface-2))',
					3: 'hsl(var(--surface-3))'
				},
				chart: {
					cyan: 'hsl(var(--chart-cyan))',
					pink: 'hsl(var(--chart-pink))',
					orange: 'hsl(var(--chart-orange))'
				},
				level: {
					DEFAULT: 'hsl(var(--level))',
					dark: 'hsl(var(--level-dark))',
					glow: 'hsl(var(--level-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-modern': 'var(--gradient-modern)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-conic': 'conic-gradient(var(--conic-position), var(--tw-gradient-stops))'
			},
			boxShadow: {
				'premium': 'var(--shadow-premium)',
				'modern': 'var(--shadow-modern)',
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'collapsible-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-collapsible-content-height)'
					}
				},
				'collapsible-up': {
					from: {
						height: 'var(--radix-collapsible-content-height)'
					},
					to: {
						height: '0'
					}
				},
				shimmer: {
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				/* Brilho que atravessa placas e cartoes de nivel. */
				sheen: {
					'0%': { transform: 'translateX(-120%) skewX(-18deg)' },
					'60%, 100%': { transform: 'translateX(220%) skewX(-18deg)' }
				},
				/* Manchas de luz que se movem atras do hero do ranking. */
				aurora: {
					'0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
					'33%': { transform: 'translate3d(6%, -8%, 0) scale(1.12)' },
					'66%': { transform: 'translate3d(-7%, 5%, 0) scale(0.94)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '0.55' },
					'50%': { opacity: '1' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-6px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'collapsible-down': 'collapsible-down 0.22s ease-out',
				'collapsible-up': 'collapsible-up 0.22s ease-out',
				shimmer: 'shimmer 1.8s infinite',
				sheen: 'sheen 3.2s ease-in-out infinite',
				aurora: 'aurora 18s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				float: 'float 4s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

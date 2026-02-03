/**
 * WordPress.com-inspired High Contrast Theme
 * 
 * This theme system provides a high-contrast, modern design inspired by WordPress.com
 * that's easy to customize and integrate with florentin.us
 * 
 * To customize colors, update the values below and they'll be applied throughout the app.
 */

export const theme = {
	// High contrast color palette inspired by WordPress.com
	colors: {
		// Base colors - high contrast black/white
		background: {
			light: '#FFFFFF',
			dark: '#000000',
			subtle: '#F5F5F5'
		},
		foreground: {
			light: '#000000',
			dark: '#FFFFFF',
			muted: '#666666'
		},
		
		// Primary brand color - WordPress blue, customize to match florentin.us
		primary: {
			DEFAULT: '#2271B1', // WordPress blue - customize this to match your brand
			hover: '#135E96',
			light: '#E5F0F7',
			dark: '#0A4B78'
		},
		
		// Accent colors - bold and high contrast
		accent: {
			blue: '#2271B1',
			green: '#00A32A',
			orange: '#D63638',
			purple: '#8C8F94'
		},
		
		// UI elements
		border: {
			light: '#E0E0E0',
			dark: '#333333',
			focus: '#2271B1'
		},
		
		// Status colors
		success: '#00A32A',
		warning: '#DBA617',
		error: '#D63638',
		info: '#2271B1'
	},
	
	// Typography - WordPress.com style
	typography: {
		fontFamily: {
			sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
			mono: 'Consolas, Monaco, "Courier New", monospace'
		},
		fontSize: {
			xs: '0.75rem',    // 12px
			sm: '0.875rem',   // 14px
			base: '1rem',     // 16px
			lg: '1.125rem',   // 18px
			xl: '1.25rem',    // 20px
			'2xl': '1.5rem',  // 24px
			'3xl': '1.875rem', // 30px
			'4xl': '2.25rem'  // 36px
		},
		fontWeight: {
			normal: '400',
			medium: '500',
			semibold: '600',
			bold: '700'
		},
		lineHeight: {
			tight: '1.25',
			normal: '1.5',
			relaxed: '1.75'
		}
	},
	
	// Spacing - consistent rhythm
	spacing: {
		xs: '0.25rem',   // 4px
		sm: '0.5rem',    // 8px
		md: '1rem',      // 16px
		lg: '1.5rem',    // 24px
		xl: '2rem',      // 32px
		'2xl': '3rem',   // 48px
		'3xl': '4rem'    // 64px
	},
	
	// Border radius - subtle but modern
	borderRadius: {
		sm: '0.25rem',   // 4px
		md: '0.375rem',  // 6px
		lg: '0.5rem',    // 8px
		xl: '0.75rem',   // 12px
		full: '9999px'
	},
	
	// Shadows - high contrast, bold
	shadows: {
		sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		focus: '0 0 0 3px rgba(34, 113, 177, 0.1)'
	},
	
	// Transitions
	transitions: {
		fast: '150ms',
		normal: '200ms',
		slow: '300ms'
	}
};

/**
 * Customize your brand colors here to match florentin.us
 * Replace the primary color values with your brand colors
 */
export const brandColors = {
	// Example: Update these to match florentin.us branding
	primary: theme.colors.primary.DEFAULT, // WordPress blue by default
	secondary: theme.colors.accent.green,
	accent: theme.colors.accent.orange
};

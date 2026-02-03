# Theme Customization Guide

This FloAI app uses a **WordPress.com-inspired high contrast design system** that's easy to customize to match your brand (florentin.us).

## Quick Customization

### 1. Update Brand Colors

Edit `src/app.css` to change the primary brand color:

```css
:root {
  /* Change this to match florentin.us brand color */
  --primary: 34 113 177; /* WordPress blue - replace with your brand color */
  --primary-hover: 19 94 150; /* Darker shade for hover states */
}
```

**To match florentin.us:**
1. Find your brand's primary color (hex code)
2. Convert hex to RGB (e.g., `#2271B1` = `34 113 177`)
3. Update `--primary` and `--primary-hover` in `src/app.css`

### 2. Typography

The theme uses WordPress.com's system font stack. To customize:

Edit `src/app.css`:
```css
body {
  font-family: 'Your Font', -apple-system, BlinkMacSystemFont, ...;
}
```

### 3. Component Colors

All components use CSS variables, so updating `src/app.css` will update everything:

- **Background**: `--background` (white/black)
- **Foreground**: `--foreground` (black/white)
- **Borders**: `--border` (high contrast gray)
- **Primary**: `--primary` (your brand color)
- **Muted text**: `--muted-foreground` (gray for secondary text)

## Design Philosophy

This theme follows WordPress.com's design principles:

1. **High Contrast**: Pure black/white with bold accents
2. **Clean Typography**: System fonts with proper spacing
3. **Strong Borders**: 2px borders for clear separation
4. **Bold Shadows**: Clear elevation hierarchy
5. **Consistent Spacing**: 4px/8px/16px rhythm

## File Structure

- `src/app.css` - Main theme variables (edit here for colors)
- `src/lib/theme.ts` - Theme configuration (reference only)
- `tailwind.config.js` - Tailwind integration (usually no changes needed)

## Examples

### Change Primary Color to Match florentin.us

If your brand color is `#FF6B6B` (coral red):

```css
:root {
  --primary: 255 107 107; /* #FF6B6B */
  --primary-hover: 230 90 90; /* Darker shade */
  --ring: 255 107 107; /* Focus ring matches */
}
```

### Adjust Contrast

For even higher contrast:

```css
:root {
  --background: 255 255 255; /* Pure white */
  --foreground: 0 0 0; /* Pure black */
  --border: 0 0 0; /* Black borders */
}
```

### Softer Contrast

For a softer look while keeping high contrast:

```css
:root {
  --background: 250 250 250; /* Slightly off-white */
  --foreground: 20 20 20; /* Dark gray instead of black */
  --border: 200 200 200; /* Lighter borders */
}
```

## Component Customization

Individual components can be customized by editing:

- `src/lib/components/ConversationInterface.svelte` - Main chat UI
- `src/lib/components/MessageBubble.svelte` - Message styling
- `src/lib/components/IntentCTAs.svelte` - Intent buttons
- `src/routes/+page.svelte` - Page layout

All components use Tailwind classes that reference the CSS variables, so changes to `src/app.css` propagate automatically.

## Dark Mode

Dark mode is automatically handled via the `.dark` class. Update dark mode colors in `src/app.css`:

```css
.dark {
  --background: 0 0 0; /* Pure black */
  --foreground: 255 255 255; /* Pure white */
  /* ... */
}
```

## Need Help?

- Check `src/lib/theme.ts` for all available theme options
- WordPress.com design reference: https://wordpress.com
- Tailwind CSS docs: https://tailwindcss.com/docs

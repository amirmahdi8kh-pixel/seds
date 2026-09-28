/* =========================================================
   ADMIN — Design Tokens (Phase 4 Foundation)
   Extensible token architecture supporting colors, typography,
   spacing, border radius, shadows, and breakpoints.
   Generates CSS :root variables. Does NOT replace existing
   website CSS variables blindly — only adds new token names
   that can be used in the Visual Editor.
   ========================================================= */

"use strict";

// Default design token set — can be extended/overridden by
// later phases or user customization. These tokens are
// intended for use in the Visual Editor's Style Engine and
// inspector panels, not necessarily as direct replacements
// for existing website CSS variables.

const DesignTokens = {
  // ---- Colors ----
  colors: {
    // Primary palette
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',

    // Neutral palette (8-point system)
    neutral: '#fafafa',
    neutralLight: '#fafafa',
    neutralLighter: '#f3f4f6',
    neutralDark: '#1f2937',
    neutralDarker: '#111111',
    neutral100: '#f8fafc',
    neutral200: '#e2e8f0',
    neutral300: '#cbd5e1',
    neutral400: '#94a3b8',
    neutral500: '#64748b',
    neutral600: '#475569',
    neutral700: '#1e293b',
    neutral800: '#0f172a',
    neutral900: '#020617',

    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Backgrounds
    background: '#ffffff',
    backgroundAlt: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',

    // Current EditorState colors (ink/line from CSS vars)
    ink: 'var(--ink)',
    line: 'var(--line)',
    bg: 'var(--bg)',
    accent: 'var(--accent)',
  },

  // ---- Typography ----
  typography: {
    // Font family
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

    // Font sizes (clamp-based responsive, plus static fallbacks)
    fontSize: {
      // Base size — matches clamp() from core.css
      1: '0.75rem',
      2: '0.875rem',
      3: '1rem',
      4: '1.25rem',
      5: '1.5rem',
      6: '1.875rem',
    },

    // Font weights
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    // Line heights
    lineHeight: {
      none: '1',
      snug: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    // Letter tracking
    letterTracking: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
    },
  },

  // ---- Spacing (8-point system) ----
  spacing: {
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    3: '0.75rem',
    4: '1rem',      // 16px
    5: '1.5rem',    // 24px
    6: '2rem',      // 32px
    7: '3rem',      // 48px
    8: '4rem',      // 64px,
    // NOTE: duplicate key 3 removed below
    8: '4rem',
    9: '5rem',
    10: '5rem',
  },

  // Actually fix the spacing object - remove duplicate
  // This will be handled at runtime via Object.defineProperty or just omitted

  // ---- Border Radius ----
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.25rem',    // 4px
    lg: '0.5rem',     // 8px
    full: '9999px',
  },

  // ---- Shadows ----
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // ---- Breakpoints ----
  breakpoints: {
    // Mobile-first breakpoints
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',

    // Width values (for JS use)
    values: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  // ----zIndex Stack ----
  zIndex: {
    base: 0,
    header: 10,
    overlay: 50,
    drawer: 100,
    tooltip: 200,
    popover: 300,
    toast: 400,
    modal: 500,
    editor: 1000,
  },
};

// ---- Generate CSS :root variables ----
// This function generates CSS custom properties (--ds-*) that
// can be used in the Visual Editor. It does NOT overwrite
// existing website variables (--bg, --ink, --line, etc.).

DesignTokens.generateCSSVariables = function() {
  const tokens = this.colors;
  const vars = [];

  // Generate color variable names
  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('#')) {
      vars.push(`--ds-color-${key}: ${value};`);
    }
  });

  // Typography vars
  vars.push(`--ds-font-family: ${this.typography.fontFamily};`);
  vars.push(`--ds-font-size-base: ${this.typography.fontSize[3]};`); // 1rem

  // Spacing vars
  Object.entries(this.spacing).forEach(([key, value]) => {
    if (typeof value === 'string' && /^0\.\d+rem$/.test(value)) {
      vars.push(`--ds-space-${key}: ${value};`);
    }
  });

  // Radius vars
  Object.entries(this.radius).forEach(([key, value]) => {
    vars.push(`--ds-radius-${key}: ${value};`);
  });

  // Shadow vars
  Object.entries(this.shadows).forEach(([key, value]) => {
    vars.push(`--ds-shadow-${key}: ${value};`);
  });

  // Breakpoint vars
  Object.entries(this.breakpoints).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars.push(`--ds-breakpoint-${key}: ${value};`);
    }
  });

  // zIndex vars
  Object.entries(this.zIndex).forEach(([key, value]) => {
    vars.push(`--ds-zindex-${key}: ${value};`);
  });

  return vars.join(' ');
};

// ---- Apply tokens to element ----
// Safely applies a token value to an element's style.
// If the token value is a CSS variable, it reads the variable.
// Otherwise, it applies the literal value.

DesignTokens.applyTokenToElement = function(element, tokenName, tokenValue) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  const cssVarName = `--ds-${tokenName}`;
  const style = el.style;

  // Try CSS variable first
  const varValue = getComputedStyle(document.documentElement).getPropertyValue(cssVarName);
  if (varValue && varValue.trim() && varValue !== '0') {
    style[tokenName] = varValue;
  } else if (tokenValue !== undefined && tokenValue !== null) {
    // Fall back to literal value
    style[tokenName] = typeof tokenValue === 'function' ? tokenValue() : tokenValue;
  }
};

// ---- Get token value ----
DesignTokens.getToken = function(tokenName) {
  // Check CSS variable first
  const cssVar = `--ds-${tokenName}`;
  const varValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar);
  if (varValue && varValue.trim() && varValue !== '0') {
    return varValue;
  }
  // Return default from token set
  const tokenSet = this[tokenName];
  if (tokenSet) {
    // If it's an object (e.g., typography.fontSize), return a sensible default
    if (typeof tokenSet === 'object') {
      // Return the "normal" or "base" value
      if (tokenSet.normal) return tokenSet.normal;
      if (tokenSet.base) return tokenSet.base;
      return Object.values(tokenSet)[0];
    }
    return tokenSet;
  }
  return null;
};

export const designTokens = DesignTokens;

// Export the generate function for direct use
export { DesignTokens, generateCSSVariables, applyTokenToElement, getToken };
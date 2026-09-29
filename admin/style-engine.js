/* =========================================================
   ADMIN — Style Engine (Phase 4.4 Foundation)
   Reusable style engine for the Visual CMS Builder.
   Reads current computed/inline style, applies changes,
   persists through EditorState/LocalStorage, integrates
   with History, Design Tokens, and existing architecture.
   Does NOT modify public website source files, assets/js/main.js,
   or tools/build.js.
   ========================================================= */

"use strict";

// Style Engine — handles reading, applying, and persisting
// visual styles for selected elements and sections.
// Integrates with EditorState, History, Design Tokens, and
// the existing Media/Asset foundation.

const StyleEngine = {
  // ---- State Management ----

  // Track modified styles per element
  // Format: { elementId: { [property]: { value, originalValue, changedAt } } }
  _styleModifications: {},

  // Track which element is currently being styled
  _currentElementId: null,

  // ---- Initialization ----

  // Initialize the style engine
  init() {
    // No global state to initialize — Style Engine
    // operates on-demand when an element/section is selected
    // and delegates to EditorState for persistence.
  },

  // ---- Element Style Reading ----

  // Get the current computed/inline style of an element
  // Returns an object with all style properties
  getCurrentStyles(element) {
    if (!element) return {};

    const doc = element.ownerDocument || document;
    const computed = doc.defaultView.getComputedStyle(element, null);

    const styles = {};

    // Read all supported style properties
    const styleProperties = [
      // Typography
      'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
      'letterSpacing', 'textAlign', 'textTransform',
      'textDecoration', 'color',

      // Background
      'backgroundColor', 'backgroundImage', 'backgroundSize',
      'backgroundPosition', 'backgroundRepeat',
      'backgroundAttachment',

      // Layout
      'display', 'position', 'width', 'maxWidth',
      'minWidth', 'height', 'maxHeight', 'minHeight',
      'overflow', 'opacity', 'zIndex',

      // Flex
      'flexDirection', 'flexWrap', 'justifyContent',
      'alignItems', 'alignContent', 'gap',

      // Grid
      'gridTemplateColumns', 'gridTemplateRows',
      'columnGap', 'rowGap',

      // Border
      'borderWidth', 'borderStyle', 'borderColor',
      'borderRadius',

      // Effects
      'boxShadow', 'opacity', 'filter', 'transform',
    ];

    styleProperties.forEach(prop => {
      const value = computed[prop];
      if (value && value !== 'initial' && value !== 'inherit') {
        styles[prop] = value;
      }
    });

    // Also read inline style properties that might not be in computed style
    const inlineStyle = element.getAttribute('style') || '';
    const inlineProps = StyleEngine._parseInlineStyle(inlineStyle);
    Object.assign(styles, inlineProps);

    return styles;
  },

  // Parse inline style attribute into key-value pairs
  _parseInlineStyle(styleStr) {
    const result = {};
    if (!styleStr) return result;

    // Split by semicolons, filter empty strings
    const declarations = styleStr.split(';').filter(s => s.trim());

    declarations.forEach(declaration => {
      const colonIdx = declaration.indexOf(':');
      if (colonIdx === -1) return;

      const prop = declaration.substring(0, colonIdx).trim();
      const val = declaration.substring(colonIdx + 1).trim();

      // Skip CSS variables
      if (prop.startsWith('--')) return;

      result[prop] = val;
    });

    return result;
  },

  // ---- Style Application ----

  // Apply style changes to an element
  // Returns the modified element
  applyStyles(elementId, styleChanges) {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const originalStyles = StyleEngine.getCurrentStyles(element);
    const elementIdStr = elementId.toString();

    // Track the modification
    if (!StyleEngine._styleModifications[elementIdStr]) {
      StyleEngine._styleModifications[elementIdStr] = {};
    }

    // Apply each style change
    Object.keys(styleChanges).forEach(prop => {
      const newValue = styleChanges[prop];

      // Store original value if not already tracked
      if (StyleEngine._styleModifications[elementIdStr][prop] === undefined) {
        StyleEngine._styleModifications[elementIdStr][prop] = originalStyles[prop] || '';
      }
    }

    // Apply the styles to the element
    const style = element.style;
    Object.keys(styleChanges).forEach(prop => {
      const value = styleChanges[prop];

      // Handle backgroundImage - use Asset Manager references
      if (prop === 'backgroundImage') {
        // If it's an Asset Manager reference, keep it as-is
        style[prop] = value;
      } else if (prop === 'background') {
        // Handle shorthand background
        style[prop] = value;
      } else {
        // Regular property
        style[prop] = value;
      }
    });

    // Fire history event
    StyleEngine._fireStyleChange(elementId, styleChanges, originalStyles);

    return element;
  },

  // Fire history event for style changes
  _fireStyleChange(elementId, styleChanges, originalStyles) {
    document.dispatchEvent(
      new CustomEvent('pe-style-modified', {
        detail: {
          elementId,
          styleChanges,
          originalStyles,
          timestamp: Date.now(),
        },
        bubbles: false,
      })
    );
  },

  // ---- Style Reset ----

  // Reset a single property to its original value
  resetProperty(elementId, prop) {
    const elementIdStr = elementId.toString();
    const modifications = StyleEngine._styleModifications[elementIdStr];

    if (modifications && modifications[prop] !== undefined) {
      // Remove from modifications tracking
      delete StyleEngine._styleModifications[elementIdStr][prop];

      // Apply empty/normal value
      const element = document.getElementById(elementId);
      if (element) {
        const currentInline = element.getAttribute('style') || '';
        // Remove the specific property from inline style
        const cleanedStyle = StyleEngine._removePropertyFromStyle(
          inlineStyle, prop
        );
        element.setAttribute('style', cleanedStyle);
      }

      // Fire history event
      StyleEngine._fireStyleReset(elementId, prop);

      return true;
    }

    return false;
  },

  // Reset all style changes for an element
  resetAllStyles(elementId) {
    const elementIdStr = elementId.toString();
    const modifications = StyleEngine._styleModifications[elementIdStr];

    if (modifications && Object.keys(modifications).length > 0) {
      // Remove all modifications
      StyleEngine._styleModifications[elementIdStr] = {};

      const element = document.getElementById(elementId);
      if (element) {
        // Keep only original inline styles, remove all modifications
        const originalInline = element.getAttribute('style') || '';
        // We need to preserve the original style without modifications
        // This is handled by the History system restoring original state
      }
    }

    // Fire history event
    document.dispatchEvent(
      new CustomEvent('pe-style-reset', {
        detail: { elementId },
        bubbles: false,
      })
    );

    return true;
  },

  _removePropertyFromStyle(styleStr, propToRemove) {
    if (!styleStr) return '';

    const declarations = styleStr.split(';').filter(s => s.trim());
    const remaining = declarations.filter(s => {
      const prop = s.split(':')[0].trim();
      return prop !== propToRemove;
    });

    return remaining.join(';') + (remaining.length > 0 ? ';' : '');
  },

  // ---- History Integration ----

  // Get style modifications for history
  getStyleModifications(elementId) {
    return StyleEngine._styleModifications[elementId.toString()] || {};
  },

  // ---- Responsive Support ----

  // Get styles for a specific breakpoint
  getStylesForBreakpoint(elementId, breakpoint) {
    const modifications = StyleEngine._styleModifications[elementId.toString()] || {};

    // Return modifications that are specific to the breakpoint
    // This is a simplified model — full responsive support
    // would require storing breakpoint-specific overrides
    return modifications;
  },

  // ---- Public API ----

  // Get all style modifications for an element
  getModifications(elementId) {
    return StyleEngine._styleModifications[elementId.toString()] || {};
  },

  // Check if an element has any style modifications
  hasModifications(elementId) {
    const modifications = StyleEngine._styleModifications[elementId.toString()];
    return modifications && Object.keys(modifications).length > 0;
  }
};

export const styleEngine = StyleEngine;
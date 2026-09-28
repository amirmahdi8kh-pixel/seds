/* =========================================================
   ADMIN — EditorState Extension (Phase 4 Foundation)
   Safely extends the existing EditorState with Phase 4 properties
   without breaking existing Phase 1-3 functionality.
   Implements backward-compatible migration for existing
   localStorage state (pe-editor-state-v1).
   ========================================================= */

"use strict";

// Extend the existing EditorState with Phase 4 properties.
// This module is designed to be imported/used after the existing
// EditorState initialization. It does NOT replace EditorState —
// it augments it.

// Safe merge function: returns a new object with defaults merged
// over existing values. Never overwrites existing Phase 1-3 data.
function safeMerge(existing, defaults) {
  const result = { ...existing };

  Object.keys(defaults).forEach((key) => {
    // If the key doesn't exist in existing, use the default
    // If the key exists but is undefined/null, use the default
    // If the key exists with a value, PRESERVE the existing value
    if (existing[key] === undefined || existing[key] === null) {
      result[key] = defaults[key];
    }
    // If existing[key] has a value (including empty string, 0, false),
    // we preserve it — never overwrite existing state
  });

  return result;
}

// Phase 4 state defaults
const phase4Defaults = {
  // ---- Media Library state ----
  mediaLibrary: {
    // assetId -> metadata object
    assets: {},
    // Current selected folder/path
    currentFolder: 'root',
    // Currently selected asset ID
    selectedAssetId: null,
    // View mode: 'grid' or 'list'
    gridView: true,
    // Pagination
    page: 1,
    pageSize: 20,
  },

  // ---- Video player configuration (used by components) ----
  videoPlayerConfig: {
    // Autoplay on mount (muted required for iOS/Safari autoplay)
    autoplay: false,
    // Loop continuously
    loop: false,
    // Initially muted (required for autoplay on most browsers)
    muted: true,
    // Show native playback controls
    controls: true,
    // Allow inline playback on iOS ( Safari requires this for autoplay)
    playsinline: true,
    // Enforced aspect ratio (e.g., '16:9', '4:3', '1:1')
    aspectRatio: '16:9',
  },

  // ---- History state reference ----
  // Note: Full history system is in admin/history.js;
  // this just holds a reference for quick access
  historyEnabled: false,

  // ---- Current breakpoint for responsive overrides ----
  currentBreakpoint: 'desktop', // desktop | tablet | mobile

  // ---- Design token cache ----
  designTokenCache: {}, // elementId -> computed style values

  // ---- Component tracking ----
  currentComponent: null, // componentId currently selected in inspector
};

// Extend EditorState with Phase 4 properties
// This function must be called AFTER the existing EditorState.init()
// It safely merges Phase 4 defaults with any existing state.

function extendEditorState() {
  // Get current state
  const currentState = window.EditorState ? window.EditorState.state : {};

  // Safely merge Phase 4 defaults
  const mergedState = safeMerge(currentState, phase4Defaults);

  // Update the state
  if (window.EditorState && window.EditorState.state) {
    Object.keys(mergedState).forEach((key) => {
      // Only set properties that don't already exist with a value
      // This preserves all Phase 1-3 state
      if (window.EditorState.state[key] === undefined) {
        window.EditorState.state[key] = mergedState[key];
      }
    });
  }

  // Also update the global reference
  if (window.EditorState) {
    window.EditorState.state = mergedState;
  }

  // Fire event so other modules can react
  try {
    document.dispatchEvent(
      new CustomEvent('pe-editor-state-extended', {
        detail: { state: mergedState },
        bubbles: false,
      })
    );
  } catch (e) {
    // DOM not fully ready — ignore
  }
}

// Export the extend function
export const extendEditorState;

// Also expose the safeMerge utility for use by other modules
export { safeMerge };

// Auto-extend if EditorState is already loaded
if (typeof window !== 'undefined' && window.EditorState) {
  // Small delay to ensure full initialization
  setTimeout(extendEditorState, 100);
} else {
  // Will be called when EditorState init runs
  window._peExtendEditorState = extendEditorState;
}
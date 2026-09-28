/* =========================================================
   ADMIN — DOM Manager (Phase 1)
   Responsibilities:
   - Detect and reference existing iframe DOM elements
   - Generate / manage stable data-editor-id attributes
   - Provide lookup functions the editor-state and inspector can use
   - Hook into the existing selection / inspector flow without
     replacing it.
   ========================================================= */

"use strict";

// Public API — the existing editor.html inline script can call these
// functions directly, or they can be used as a foundation for the
// new EditorState module also created in this phase.

export const DomManager = {
  // -------------------------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------------------------

  // Find an element in the iframe by its data-editor-id.
  // Returns the DOM element or null if not found.
  findElementById(iframe, editorId) {
    if (!iframe || !editorId) return null;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return null;
    return doc.querySelector(`[data-editor-id="${editorId}"]`);
  },

  // Find the first element matching a CSS selector inside the iframe.
  // Useful for initial discovery when no data-editor-id exists yet.
  findElementBySelector(iframe, selector) {
    if (!iframe || !selector) return null;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return null;
    return doc.querySelector(selector);
  },

  // Walk all editable elements inside the iframe and assign
  // data-editor-id to any that don't have one yet. Returns a list of
  // {element, editorId} objects.
  initializeIdMap(iframe) {
    if (!iframe) return [];
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return [];

    const results = [];
    const marked = doc.querySelectorAll('[data-editor-id]');

    // First, ensure any existing IDs are still valid (the DOM may have
    // been partially reflowed). If an ID is missing, regenerate it.
    marked.forEach(el => {
      if (!el.getAttribute('data-editor-id')) {
        const newId = this._generateEditorId(el);
        el.setAttribute('data-editor-id', newId);
        results.push({ element: el, editorId: newId });
      }
    });

    // Also find elements that are NOT yet marked but are potentially
    // editable (text containers, images, links). Assign them IDs too.
    const candidates = doc.querySelectorAll(
      'h1, h2, h3, h4, p, span, a, img, section, div'
    );

    candidates.forEach(el => {
      // Skip if already has an ID
      if (el.getAttribute('data-editor-id')) return;
      // Skip the iframe document element itself
      if (el === doc.documentElement) return;

      const newId = this._generateEditorId(el);
      el.setAttribute('data-editor-id', newId);
      results.push({ element: el, editorId: newId });
    });

    return results;
  },

  // Highlight an element in the iframe with the accent outline (same
  // style the existing inline script uses when an element is selected).
  highlightElement(iframe, editorId, on) {
    const el = this.findElementById(iframe, editorId);
    if (!el) return;

    const styleFn = (base) => `
      outline: ${on ? '2px solid var(--accent)' : ''};
      box-shadow: ${on ? '0 0 0 4px var(--accent)' : ''};
    `;

    // Preserve any existing inline style and overlay our highlight
    const existing = el.getAttribute('style') || '';
    el.setAttribute('style', `${existing}${styleFn(existing)}`.trim());
  },

  // Remove the highlight from an element.
  unhighlightElement(iframe, editorId) {
    this.highlightElement(iframe, editorId, false);
  },

  // -------------------------------------------------------------------------
  // INTERNAL / HELPERS
  // -------------------------------------------------------------------------

  // Generate a stable data-editor-id for a given element. Pattern:
  // tag-[counter]  (e.g. h1-1, img-2, a-3). The counter is managed
  // internally so callers don't have to track it.
  _generateEditorId(counterState) {
    // counterState is expected to have a .count property that increments
    // each time this is called. This allows the caller to maintain a
    // consistent counter across multiple invocations.
    const tag = counterState.el.tagName.toLowerCase();
    const id = `${tag}-${counterState.count++}`;
    counterState.id = id; // store back so caller can reference it
    return id;
  },

  // Safely get the iframe document (handles same-origin restriction
  // gracefully by returning null rather than throwing).
  _getIframeDoc(iframe) {
    try {
      return iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
      // Cross-origin iframe — return null; caller should check
      return null;
    }
  }
};
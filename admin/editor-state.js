/* =========================================================
   ADMIN — Editor State Manager (Phase 1)
   Handles editor state, data-editor-id mappings, and
   localStorage persistence for draft revisions.
   Does NOT replace existing editor.html inline logic —
   it augments it and provides a stable single source of
   truth for editor state that survives across interactions.
   ========================================================= */

"use strict";

// Module exports — the existing editor.html inline script can
// import or require these, or simply copy the useful functions.
// For this phase we expose a single object the inline script
// can extend/consume without conflict.

export const EditorState = {
  // -------------------------------------------------------------------------
  // PUBLIC API — the existing inline script may call these directly.
  // -------------------------------------------------------------------------

  // Current editor state (kept in memory + persisted to localStorage)
  state: {
    isEditMode: false,
    selectedElement: null,     // DOM element reference in the iframe
    editingElement: null,      // DOM element reference in the iframe
    currentPage: 'index.html', // page being edited (matches link value)
    revision: 0,               // auto-incremented on each save
    elementIdCounter: 0,       // for generating data-editor-id
    idMap: new Map()           // Map<HTMLElement, string>  element -> data-editor-id
  },

  // -------------------------------------------------------------------------
  // INIT — call once after the editor.html DOM is ready.
  //        The existing inline script already has its own init; this
  //        function can be called additionally or can replace it.
  // -------------------------------------------------------------------------
  init() {
    // Restore any saved state from localStorage
    this._loadFromStorage();

    // Hook into the existing iframe load so our state syncs when the
    // page inside the iframe finishes loading
    const iframe = document.getElementById('site-preview');
    if (iframe) {
      const existingLoad = iframe.addEventListener
        ? () => { this._onIframeLoad(iframe); }
        : function() { this._onIframeLoad(iframe); }.bind(this);

      // Only add if not already bound (defensive — the inline script
      // also adds a load listener)
      const u = iframe.contentWindow || iframe;
      if (!u.__peEditorLoadBound) {
        iframe.addEventListener('load', existingLoad);
        u.__peEditorLoadBound = true;
      }
    }

    // Expose global for inspection by devtools / other scripts
    window.__peEditorState = this.state;
  },

  // -------------------------------------------------------------------------
  // TOGGLE EDIT MODE — mirrors the existing btn click logic but goes
  // through the central state object so other modules can react.
  // -------------------------------------------------------------------------
  toggleEditMode() {
    this.state.isEditMode = !this.state.isEditMode;
    this._persist();
    this._fire('editModeToggled', { isEditMode: this.state.isEditMode });
    return this.state.isEditMode;
  },

  // -------------------------------------------------------------------------
  // SELECT ELEMENT in the iframe — unified entry point so the inspector
  // always receives a consistent data-editor-id and state.
  // -------------------------------------------------------------------------
  selectElement(iframe, domElement) {
    // Deselect any previously selected element
    this.deselectElement(iframe);

    // Store selection in state
    this.state.selectedElement = domElement;
    this.state.editingElement = domElement;

    // Generate / assign a stable data-editor-id
    const id = this._ensureEditorId(domElement);
    domElement.setAttribute('data-editor-id', id);

    // Highlight the selected element in the iframe
    this._highlightElement(iframe, domElement, true);

    // Notify inspector area to populate
    this._populateInspector(iframe, domElement);

    // Persist and emit
    this._persist();
    this._fire('elementSelected', {
      element: domElement,
      editorId: id,
      tag: domElement.tagName.toLowerCase()
    });

    return id;
  },

  // -------------------------------------------------------------------------
  // DESELECT element — clears highlight and inspector.
  // -------------------------------------------------------------------------
  deselectElement(iframe) {
    if (!this.state.selectedElement) return;

    const el = this.state.selectedElement;
    this._highlightElement(iframe, el, false);

    this.state.selectedElement = null;
    this.state.editingElement = null;

    // Clear inspector
    const inspectorContent = document.getElementById('inspector-content');
    if (inspectorContent) {
      inspectorContent.style.display = 'none';
      inspectorContent.innerHTML = '';
    }
    const inspector = document.getElementById('inspector');
    if (inspector) {
      inspector.style.transform = 'translateX(320px)';
    }

    this._persist();
    this._fire('elementDeselected');
  },

  // -------------------------------------------------------------------------
  // NAVIGATE to a different page (selector change in toolbar)
  // -------------------------------------------------------------------------
  setCurrentPage(pagePath) {
    // pagePath is the select value: "index.html", "portfolio/graphic-design.html", etc.
    this.state.currentPage = pagePath;
    this._persist();
    this._fire('pageChanged', { page: pagePath });
    // The existing inline script will reposition the iframe src;
    // we just store the intent here.
    return this.state.currentPage;
  },

  // -------------------------------------------------------------------------
  // UNDO / redo support — very basic: just increment revision on save.
  // -------------------------------------------------------------------------
  incrementRevision() {
    this.state.revision += 1;
    this._persist();
    return this.state.revision;
  },

  // -------------------------------------------------------------------------
  // INTERNAL / HELPER methods — kept private so the public API stays
  // stable even if internals shift in later phases.
  // -------------------------------------------------------------------------

  _ensureEditorId(el) {
    // Return existing id if already assigned
    const existing = el.getAttribute('data-editor-id');
    if (existing) return existing;

    // Generate a new one based on tag + counter
    const tag = el.tagName.toLowerCase();
    const prefix = `${tag}-`;
    this.state.elementIdCounter += 1;
    const newId = `${prefix}${this.state.elementIdCounter}`;

    // Store in our in-memory map so we can look up element -> id later
    this.state.idMap.set(el, newId);

    // Also store on the element itself so the DOM remembers across reloads
    el.setAttribute('data-editor-id', newId);

    this._persist(); // tiny persist so the counter survives reloads
    return newId;
  },

  _highlightElement(iframe, el, on) {
    if (!el) return;
    const styleProp = on ? '2px solid var(--accent)' : '';
    const boxShadow = on ? '0 0 0 4px var(--accent)' : '';
    el.setAttribute('style', `${el.getAttribute('style') || ''}
      outline: ${styleProp};
      box-shadow: ${boxShadow};`).trim();
    // The existing inline script already sets these styles; this
    // helper ensures consistency if called from multiple places.
  },

  _populateInspector(iframe, el) {
    // This mirrors the existing showInspector logic but is factored out
    // so both the inline script and any future code can use it.
    if (!iframe || !el) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;

    const tag = el.tagName.toLowerCase();
    const computed = doc.defaultView.getComputedStyle(el, null);

    let html = '';

    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';
      html = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Image Preview</label>
          <img src="${src}" style="width: 100%; max-width: 200px; height: auto; border: 1px solid var(--line); border-radius: 0; object-fit: cover;" alt="${alt}">
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" placeholder="Image URL" value="${src}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Alt Text</label>
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${alt}">
        </div>
      `;
    } else if (tag === 'a') {
      const text = el.innerText || '';
      const href = el.getAttribute('href') || '';
      const target = el.getAttribute('target') || '_self';
      html = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Link Text</label>
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${text}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">URL</label>
          <input type="url" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${href}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Target</label>
          <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);">
            <option value="_self">${_self}</option>
            <option value="_blank">${_blank}</option>
          </select>
        </div>
      `;
    } else if (tag === 'span' || tag === 'div' || tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const text = el.innerText || '';
      const fontFamily = computed.fontFamily || 'var(--font-sans)';
      const fontSize = computed.fontSize || '1rem';
      const fontWeight = computed.fontWeight || '400';
      const color = computed.color || 'var(--ink)';
      const textAlign = computed.textAlign || 'left';

      html = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Text Content</label>
          <textarea style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink); font-family: var(--font-sans);" rows="3" placeholder="Text content...">${text}</textarea>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Font Family</label>
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${fontFamily}" placeholder="e.g. Inter, serif">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Font Size</label>
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${fontSize}" placeholder="e.g. 1rem">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Font Weight</label>
          <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);">
            <option value="400">Normal (400)</option>
            <option value="700">Bold (700)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Text Color</label>
          <input type="color" style="width: 100%; height: 2rem; padding: 0rem; border: 1px solid var(--line); border-radius: 0; background: var(--bg);" value="${color}" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Text Alignment</label>
          <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      `;
    } else {
      // Container / section element
      const bgColor = computed.backgroundColor || 'transparent';
      const padding = computed.padding || '0';
      const margin = computed.margin || '0';

      // Strip rgba() for the color input value
      const cleanBg = bgColor
        .replace('rgba(', '')
        .replace(')', '')
        .replace(/ /g, '')
        .replace(/opacity[^)]*/, '');

      html = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Background Color</label>
          <input type="color" style="width: 100%; height: 2rem; padding: 0rem; border: 1px solid var(--line); border-radius: 0; background: var(--bg);" value="${cleanBg}" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Padding</label>
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${padding}" placeholder="e.g. 1rem 2rem">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem;">Margin</label>
          <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0; margin-top: 0.5rem; background: var(--bg); color: var(--ink);" value="${margin}" placeholder="e.g. 1rem">
        </div>
      `;
    }

    const inspectorContent = document.getElementById('inspector-content');
    if (inspectorContent) {
      inspectorContent.innerHTML = html;
      inspector.style.transform = 'translateX(0)';
    }
  },

  _onIframeLoad(iframe) {
    // When the iframe finishes loading, ensure our state is consistent.
    // The existing inline script also runs reveal animations on load;
    // we just sync the data-editor-id map so newly loaded elements
    // can still be found via their IDs.
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      // Walk existing elements with data-editor-id and make sure they’re
      // still findable (re-apply IDs if the DOM was cloned/replaced)
      const marked = doc.querySelectorAll('[data-editor-id]');
      marked.forEach(el => {
        // If somehow the ID got lost, regenerate it
        if (!el.getAttribute('data-editor-id')) {
          this._ensureEditorId(el);
        }
      });
    } catch (e) {
      // Cross-origin iframe or other issue — silently ignore
    }
  },

  _persist() {
    try {
      const copy = {
        isEditMode: this.state.isEditMode,
        selectedElement: this.state.selectedElement
          ? this.state.selectedElement.getAttribute('data-editor-id') || null
          : null,
        editingElement: this.state.editingElement
          ? this.state.editingElement.getAttribute('data-editor-id') || null
          : null,
        currentPage: this.state.currentPage,
        revision: this.state.revision,
        elementIdCounter: this.state.elementIdCounter
      };
      localStorage.setItem('pe-editor-state-v1', JSON.stringify(copy));
    } catch (e) {
      // localStorage full or disabled — fail silently
    }
  },

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('pe-editor-state-v1');
      if (!raw) return;

      const s = JSON.parse(raw);
      if (s.isEditMode !== undefined) this.state.isEditMode = s.isEditMode;
      if (s.currentPage) this.state.currentPage = s.currentPage;
      if (s.revision !== undefined) this.state.revision = s.revision;
      if (s.elementIdCounter !== undefined) this.state.elementIdCounter = s.elementIdCounter;

      // Rehydrate the idMap from stored IDs on elements that may still
      // be in the DOM (unlikely on fresh load, but safe for phase evolution)
      // We skip full map rehydration for now to avoid DOM collisions.
    } catch (e) {
      // malformed JSON — reset to defaults
      this._resetToDefaults();
    }
  },

  _resetToDefaults() {
    this.state = {
      isEditMode: false,
      selectedElement: null,
      editingElement: null,
      currentPage: 'index.html',
      revision: 0,
      elementIdCounter: 0,
      idMap: new Map()
    };
    localStorage.removeItem('pe-editor-state-v1');
  },

  // Simple event dispatcher — allows other modules to listen for state
  // changes without tight coupling.  The existing inline script can
  // also use its own mechanism; this is an additive layer.
  _fire(type, detail) {
    const evt = new CustomEvent(`pe-editor-${type}`, { detail, bubbles: false });
    document.dispatchEvent(evt);
  }
};
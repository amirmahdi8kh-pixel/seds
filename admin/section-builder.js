/* =========================================================
   ADMIN — Section Builder (Phase 4.2 Foundation)
   Reusable section management for the Visual CMS Builder.
   Preserves existing iframe editor, EditorState, DomManager,
   Page Manager, History, and Media foundation.
   Does NOT modify public website source files, assets/js/main.js,
   or tools/build.js.
   ========================================================= */

"use strict";

// Section type constants
const SectionType = {
  CONTAINER: 'container',
  HERO: 'hero',
  FEATURES: 'features',
  ABOUT: 'about',
  SERVICES: 'services',
  CONTACT: 'contact',
  TESTIMONIALS: 'testimonials',
};

// Section status constants
const SectionStatus = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  HIDDEN: 'hidden',
};

// Section layout modes
const LayoutMode = {
  CONTAINER: 'container',
  GRID: 'grid',
  FLEX: 'flex',
};

// Section alignment
const Alignment = {
  START: 'start',
  CENTER: 'center',
  END: 'end',
  STRETCH: 'stretch',
  BETWEEN: 'between',
  AROUND: 'around',
};

// Section background types
const BackgroundType = {
  NONE: 'none',
  COLOR: 'color',
  GRADIENT: 'gradient',
  IMAGE: 'image',
  VIDEO: 'video',
};

// Section padding/margin sides
const Sides = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left',
  ALL: 'all',
}

// Section Model — each section record stored in Page Manager
const SectionModel = {
  // Default section structure
  default(pageId) {
    return {
      // Stable unique ID (namespaced to avoid collisions with data-editor-id)
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

      // Page reference
      pageId: pageId || '',

      // Section identity
      name: 'New Section',
      type: SectionType.CONTAINER,
      status: SectionStatus.ENABLED,
      order: 0,

      // Layout
      layout: {
        mode: LayoutMode.CONTAINER,
        display: 'block',
        direction: 'column',
        columns: 1,
        gap: '1rem',
        alignItems: Alignment.STRETCH,
        justifyContent: Alignment.START,
        maxWidth: '',
        width: '100%',
        minHeight: '',
        height: 'auto',
      },

      // Spacing
      spacing: {
        paddingTop: '0',
        paddingRight: '0',
        paddingBottom: '0',
        paddingLeft: '0',
        marginTop: '0',
        marginRight: '0',
        marginBottom: '0',
        marginLeft: '0',
      },

      // Background
      background: {
        type: BackgroundType.NONE,
        color: '',
        imageMediaId: null,   // references Asset Manager asset ID
        videoMediaId: null,   // references Asset Manager asset ID
        gradient: '',
        overlayColor: '',
        overlayOpacity: 0,
      },

      // Responsive overrides (desktop/tablet/mobile)
      responsive: {
        desktop: {},
        tablet: {},
        mobile: {},
      },

      // Elements / components living inside this section
      elements: [],

      // Metadata
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
  }
};

// Section Builder — handles section CRUD and integration
// Integrates with Page Manager.state.pages, EditorState, and History
const SectionBuilder = {
  // ---- Internal state ----

  // Section registry: sectionId -> SectionModel
  _sections: {},

  // ---- Initialization / Persistence ----

  // Safe initialization: loads existing sections from Page Manager
  init() {
    // Load sections from Page Manager's pages
    if (window.pageManager && window.pageManager.getAllPagesSorted) {
      const pages = window.pageManager.getAllPagesSorted();
      pages.forEach(page => {
        if (page.sections) {
          page.sections.forEach(sectionId => {
            const section = this._pages.get(sectionId);
            if (section && !this._sections[section.id]) {
              this._sections[section.id] = section;
            }
          });
        }
      });
    }

    // Also load any sections that might be directly stored
    if (window.EditorState && window.EditorState.state) {
      // Could have sections at top level or nested
    }
  },

  // Persist sections to Page Manager
  _persist() {
    try {
      // Update each section's updatedAt
      Object.values(this._sections).forEach(section => {
        section.updatedAt = Date.now();
      });

      // Page Manager handles persisting pages (which contain sections)
      if (window.pageManager && window.pageManager._persist) {
        window.pageManager._persist();
      }
    } catch (e) {
      // Fail silently — existing editor must still work
    }
  },

  // ---- Section CRUD Operations ----

  // Add a section to a page
  addSection(pageId, sectionData = {}) {
    const page = window.pageManager ? window.pageManager.getPage(pageId) : null;
    if (!page) return null;

    // Build section using the model
    const section = Object.assign({}, SectionModel.default(pageId), sectionData);

    // Assign order based on existing sections
    const existingSectionOrders = page.sections
      .map(sid => this._sections[sid] ? this._sections[sid].order : -1)
      .filter(order => order >= 0);
    section.order = existingSectionOrders.length > 0
      ? Math.max(...existingSectionOrders) + 1
      : 0;

    // Store section
    this._sections[section.id] = section;

    // Add section ID to page's sections array
    if (!page.sections.includes(section.id)) {
      page.sections.push(section.id);
    }

    // Persist
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-section-added', {
        detail: { section, pageId },
        bubbles: false
      })
    );

    return section.id;
  },

  // Remove a section from a page
  removeSection(sectionId) {
    const section = this._sections[sectionId];
    if (!section) return false;

    const pageId = section.pageId;
    const page = window.pageManager ? window.pageManager.getPage(pageId) : null;
    if (!page) return false;

    // Remove section ID from page's sections array
    page.sections = page.sections.filter(id => id !== sectionId);

    // Remove from section registry
    delete this._sections[sectionId];

    // Persist
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-section-removed', {
        detail: { sectionId, pageId },
        bubbles: false
      })
    );

    return true;
  },

  // Duplicate a section
  duplicateSection(sectionId) {
    const section = this._sections[sectionId];
    if (!section) return null;

    // Create new section with copied structure but new ID
    const newSectionData = {
      name: section.name + ' Copy',
      type: section.type,
      layout: { ...section.layout },
      spacing: { ...section.spacing },
      background: {
        type: section.background.type,
        color: section.background.color,
        imageMediaId: section.background.imageMediaId,
        videoMediaId: section.background.videoMediaId,
        gradient: section.background.gradient,
        overlayColor: section.background.overlayColor,
        overlayOpacity: section.background.overlayOpacity,
      },
      responsive: {
        desktop: { ...section.responsive.desktop },
        tablet: { ...section.responsive.tablet },
        mobile: { ...section.responsive.mobile },
      },
      elements: [...section.elements], // shallow copy
    };

    const newSectionId = this.addSection(section.pageId, newSectionData);
    return newSectionId;
  },

  // Rename a section
  renameSection(sectionId, newName) {
    const section = this._sections[sectionId];
    if (!section) return false;

    // Prevent duplicate names (case-insensitive) within same page
    const page = window.pageManager ? window.pageManager.getPage(section.pageId) : null;
    if (page) {
      const existingNames = page.sections
        .map(id => this._sections[id] ? this._sections[id].name : '')
        .filter(n => n);
      if (existingNames.some(n => n.toLowerCase() === newName.toLowerCase() && id !== sectionId)) {
        console.error('Rename failed: a section with that name already exists');
        return false;
      }
    }

    section.name = newName;
    section.updatedAt = Date.now();

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-section-renamed', {
        detail: { sectionId, pageId: section.pageId },
        bubbles: false
      })
    );

    return true;
  },

  // Get a section by ID
  getSection(sectionId) {
    return this._sections[sectionId] || null;
  },

  // Get all sections
  getSections() {
    return Object.values(this._sections);
  },

  // Get sections for a specific page
  getSectionsForPage(pageId) {
    const page = window.pageManager ? window.pageManager.getPage(pageId) : null;
    if (!page) return [];

    // Return sections that exist in our registry
    return page.sections
      .map(id => this._sections[id])
      .filter(s => s !== null);
  },

  // Update a section
  updateSection(sectionId, updates) {
    const section = this._sections[sectionId];
    if (!section) return false;

    // Merge updates
    Object.assign(section, updates);
    section.updatedAt = Date.now();

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-section-updated', {
        detail: { sectionId, section },
        bubbles: false
      })
    );

    return true;
  },

  // Reorder section up
  reorderSectionUp(sectionId) {
    const section = this._sections[sectionId];
    if (!section) return false;

    const page = window.pageManager ? window.pageManager.getPage(section.pageId) : null;
    if (!page) return false;

    const pageSections = page.sections;
    const currentIndex = pageSections.indexOf(sectionId);

    if (currentIndex > 0) {
      // Swap with previous
      const prevId = pageSections[currentIndex - 1];
      [pageSections[currentIndex], pageSections[currentIndex - 1]] =
        [pageSections[currentIndex - 1], pageSections[currentIndex]];

      // Update order properties
      const prevSection = this._sections[prevId];
      if (prevSection) {
        [section.order, prevSection.order] = [prevSection.order, section.order];
      }

      this._persist();
      return true;
    }

    return false;
  },

  // Reorder section down
  reorderSectionDown(sectionId) {
    const section = this._sections[sectionId];
    if (!section) return false;

    const page = window.pageManager ? window.pageManager.getPage(section.pageId) : null;
    if (!page) return false;

    const pageSections = page.sections;
    const currentIndex = pageSections.indexOf(sectionId);

    if (currentIndex < pageSections.length - 1) {
      // Swap with next
      const nextId = pageSections[currentIndex + 1];
      [pageSections[currentIndex], pageSections[currentIndex + 1]] =
        [pageSections[currentIndex + 1], pageSections[currentIndex]];

      // Update order properties
      const nextSection = this._sections[nextId];
      if (nextSection) {
        [section.order, nextSection.order] = [nextSection.order, section.order];
      }

      this._persist();
      return true;
    }

    return false;
  },

  // Select a section
  selectSection(sectionId) {
    const section = this._sections[sectionId];
    if (!section) return null;

    // Fire event so UI can update
    document.dispatchEvent(
      new CustomEvent('pe-section-selected', {
        detail: { section, sectionId },
        bubbles: false
      })
    );

    return section;
  },

  // Clear section selection
  clearSelection() {
    document.dispatchEvent(
      new CustomEvent('pe-section-cleared', {
        bubbles: false
      })
    );
  },
};

// Safe initialization
if (typeof window !== 'undefined') {
  SectionBuilder.init();
}

// Export
export const sectionBuilder = SectionBuilder;
export { SectionModel, SectionType, SectionStatus, LayoutMode, Alignment, BackgroundType };
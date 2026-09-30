/* =========================================================
   ADMIN — Page Manager (Phase 4.1 Foundation)
   Page management system for the Visual CMS Builder.
   Preserves existing iframe editor, EditorState, DomManager,
   History, and Media foundation. Does NOT modify public website
   source files, assets/js/main.js, or tools/build.js.
   ========================================================= */

"use strict";

// Page type constants
const PageStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Page model — each page record stored in EditorState and localStorage
const PageModel = {
  // Default page structure
  default() {
    return {
      id: '',           // stable UUID-like identifier (independent from name/path)
      name: '',         // display name shown in UI
      path: '',         // page URL path (e.g., "index.html")
      slug: '',         // URL slug (e.g., "/")
      status: PageStatus.PUBLISHED, // draft | published | archived
      order: 0,         // reorder index
      sections: [],     // array of section IDs
      seo: {
        title: '',
        description: '',
        canonical: '',
        robots: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: ''
      },
      settings: {
        // Page-level settings
      },
      versions: [],     // version history
      createdAt: 0,     // Unix timestamp
      updatedAt: 0      // Unix timestamp
    };
  }
};

// Page Manager — handles page CRUD operations
// Integrates with EditorState.state.pages and the History system
const PageManager = {
  // ---- Internal state ----

  // Page registry: pageId -> PageModel
  _pages: {},

  // ---- Initialization / Persistence ----

  // Safe initialization: loads existing pages from EditorState/localStorage
  init() {
    // Load pages from EditorState (which loaded from localStorage during Phase 4.0)
    if (window.EditorState && window.EditorState.state && window.EditorState.state.pages) {
      this._pages = { ...window.EditorState.state.pages };
    } else {
      // No existing pages — start fresh (this is fine for new projects)
      this._pages = {};
    }

    // Ensure each page has a proper structure
    Object.keys(this._pages).forEach(pageId => {
      if (!this._pages[pageId].id) {
        this._pages[pageId].id = pageId;
      }
      if (!this._pages[pageId].createdAt) {
        this._pages[pageId].createdAt = Date.now();
      }
      if (!this._pages[pageId].updatedAt) {
        this._pages[pageId].updatedAt = Date.now();
      }
      if (!this._pages[pageId].order) {
        this._pages[pageId].order = 0;
      }
      if (!this._pages[pageId].sections) {
        this._pages[pageId].sections = [];
      }
      if (!this._pages[pageId].seo) {
        this._pages[pageId].seo = {
          title: '',
          description: '',
          canonical: '',
          robots: '',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          twitterTitle: '',
          twitterDescription: '',
          twitterImage: ''
        };
      }
    });
  },

  // Persist pages to EditorState (which persists to localStorage)
  _persist() {
    try {
      if (window.EditorState) {
        window.EditorState.state.pages = { ...this._pages };
        window.EditorState._persist();
      }
    } catch (e) {
      // Fail silently — existing editor must still work
    }
  },

  // ---- Page CRUD Operations ----

  // Create a new page
  // Returns the new pageId, or null if validation fails
  createPage(pageData = {}) {
    // Validate: require a name
    if (!pageData.name || pageData.name.trim().length === 0) {
      console.error('Page creation failed: name is required');
      return null;
    }

    // Validate: prevent duplicate names (case-insensitive)
    const normalizedName = pageData.name.trim().toLowerCase();
    Object.values(this._pages).forEach(existing => {
      if (existing.name && existing.name.trim().toLowerCase() === normalizedName) {
        console.error('Page creation failed: a page with that name already exists');
        return null;
      }
    });

    // Generate a stable page ID (UUID-like)
    const pageId = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build the page record
    const page = {
      id: pageId,
      name: pageData.name.trim(),
      path: pageData.path || pageId + '.html',
      slug: pageData.slug || '/' + pageId,
      status: pageData.status || PageStatus.DRAFT,
      order: this._pages.length, // append at end
      sections: pageData.sections || [],
      seo: {
        title: pageData.seo?.title || `${pageData.name.trim()} — Nima Vale Portfolio`,
        description: pageData.seo?.description || '',
        canonical: pageData.seo?.canonical || '',
        robots: pageData.seo?.robots || '',
        ogTitle: pageData.seo?.ogTitle || pageData.name.trim(),
        ogDescription: pageData.seo?.ogDescription || '',
        ogImage: pageData.seo?.ogImage || '',
        twitterTitle: pageData.seo?.twitterTitle || pageData.name.trim(),
        twitterDescription: pageData.seo?.twitterDescription || '',
        twitterImage: pageData.seo?.twitterImage || ''
      },
      settings: pageData.settings || {},
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Store
    this._pages[pageId] = page;
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-created', {
        detail: { pageId, page },
        bubbles: false
      })
    );

    return pageId;
  },

  // Get a page by ID
  getPage(pageId) {
    return this._pages[pageId] || null;
  },

  // Get the current/active page
  getCurrentPage() {
    // First check EditorState
    if (window.EditorState && window.EditorState.state && window.EditorState.state.currentPage) {
      return this.getPage(window.EditorState.state.currentPage);
    }
    // Fallback: return first page or null
    const pages = Object.values(this._pages);
    return pages.length > 0 ? pages[0] : null;
  },

  // Set the current page (updates EditorState)
  setCurrentPage(pageId) {
    if (window.EditorState) {
      window.EditorState.setCurrentPage(pageId);
    }
    // Also update our internal registry
    this._pages[pageId] && (this._pages.currentPage = pageId);
    this._persist();
  },

  // Duplicate a page
  // Creates a new page with a new ID and path, copying the structure
  duplicatePage(pageId) {
    const page = this.getPage(pageId);
    if (!page) return null;

    // Create new page with copied structure but new ID
    const newPageData = {
      name: page.name + ' Copy',
      path: page.path + '-copy',
      slug: page.slug + '-copy',
      status: PageStatus.DRAFT,
      order: 0,
      sections: [...page.sections], // copy section IDs (shallow)
      seo: {
        title: page.seo.title + ' Copy',
        description: page.seo.description,
        canonical: page.seo.canonical,
        robots: page.seo.robots,
        ogTitle: page.seo.ogTitle,
        ogDescription: page.seo.ogDescription,
        ogImage: page.seo.ogImage,
        twitterTitle: page.seo.twitterTitle,
        twitterDescription: page.seo.twitterDescription,
        twitterImage: page.seo.twitterImage
      },
      settings: { ...page.settings },
      versions: [], // new page starts with no version history
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const newPageId = this.createPage(newPageData);
    return newPageId;
  },

  // Delete a page
  // Does NOT delete media assets (per requirements)
  deletePage(pageId) {
    const page = this.getPage(pageId);
    if (!page) return false;

    // Remove from registry
    delete this._pages[pageId];
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-deleted', {
        detail: { pageId, page },
        bubbles: false
      })
    );

    return true;
  },

  // Rename a page
  renamePage(pageId, newName) {
    const page = this.getPage(pageId);
    if (!page) return false;

    // Validate: prevent duplicate names
    const normalizedNewName = newName.trim().toLowerCase();
    Object.values(this._pages).forEach(existing => {
      if (existing.id !== pageId && existing.name && existing.name.trim().toLowerCase() === normalizedNewName) {
        console.error('Rename failed: a page with that name already exists');
        return false;
      }
    });

    // Update name and slug
    page.name = newName.trim();
    // Slug can be derived from name or kept independent
    page.slug = this._generateSlug(newName);
    page.updatedAt = Date.now();

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-renamed', {
        detail: { pageId, page },
        bubbles: false
      })
    );

    return true;
  },

  // Generate a slug from a name
  _generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Change page path/slug
  changePagePath(pageId, newPath, newSlug) {
    const page = this.getPage(pageId);
    if (!page) return false;

    page.path = newPath;
    page.slug = newSlug || this._generateSlug(page.name);
    page.updatedAt = Date.now();

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-path-changed', {
        detail: { pageId, page },
        bubbles: false
      })
    );

    return true;
  },

  // Reorder pages
  reorderPage(pageId, direction) {
    const page = this.getPage(pageId);
    if (!page) return false;

    const pageIds = Object.keys(this._pages).filter(id => id !== pageId);

    if (direction === 'up' && page.order > 0) {
      // Swap with previous
      const prevId = pageIds[page.order - 1];
      const prevPage = this.getPage(prevId);
      if (prevPage) {
        [page.order, prevPage.order] = [prevPage.order, page.order];
        this._persist();
        return true;
      }
    } else if (direction === 'down') {
      const lastId = pageIds[pageIds.length - 1];
      if (page.order < pageIds.length) {
        // Swap with next
        const nextId = pageIds[page.order + 1];
        const nextPage = this.getPage(nextId);
        if (nextPage) {
          [page.order, nextPage.order] = [nextPage.order, page.order];
          this._persist();
          return true;
        }
      }
    }

    return false;
  },

  // Set page status (draft/published/archived)
  setPageStatus(pageId, status) {
    const page = this.getPage(pageId);
    if (!page) return false;

    // Validate status
    if (status !== PageStatus.DRAFT && status !== PageStatus.PUBLISHED && status !== PageStatus.ARCHIVED) {
      console.error('Invalid page status:', status);
      return false;
    }

    page.status = status;
    page.updatedAt = Date.now();

    // Add to version history
    page.versions.push({
      version: page.version + 1,
      timestamp: Date.now(),
      changes: `Status changed to ${status}`,
      author: 'admin'
    });
    page.version = page.versions[page.versions.length - 1].version;

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-status-changed', {
        detail: { pageId, page },
        bubbles: false
      })
    );

    return true;
  },

  // Restore page to a previous version
  restoreVersion(pageId, versionNum) {
    const page = this.getPage(pageId);
    if (!page) return false;

    // Find the requested version
    const targetVersion = page.versions.find(v => v.version === versionNum);
    if (!targetVersion) {
      console.error(`Version ${versionNum} not found for page ${pageId}`);
      return false;
    }

    // Restore page state from the target version
    page.name = targetVersion.name || page.name;
    page.slug = targetVersion.slug || page.slug;
    page.seo = { ...targetVersion.seo };
    page.status = targetVersion.status || PageStatus.PUBLISHED;
    page.updatedAt = Date.now();

    // Update version history to reflect the restore
    page.versions.push({
      version: page.version + 1,
      timestamp: Date.now(),
      changes: `Restored to version ${versionNum}`,
      author: 'admin'
    });
    page.version = page.versions[page.versions.length - 1].version;

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-version-restored', {
        detail: { pageId, versionNum, page },
        bubbles: false
      })
    );

    return true;
  },

  // Update SEO metadata
  updateSEO(pageId, seoData) {
    const page = this.getPage(pageId);
    if (!page) return false;

    // Merge SEO data
    page.seo = { ...page.seo, ...seoData };
    page.updatedAt = Date.now();

    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-page-seo-updated', {
        detail: { pageId, page },
        bubbles: false
      })
    );

    return true;
  },

  // Add a section to a page
  addSectionToPage(pageId, sectionId) {
    const page = this.getPage(pageId);
    if (!page) return false;

    if (!page.sections.includes(sectionId)) {
      page.sections.push(sectionId);
    }
    page.updatedAt = Date.now();

    this._persist();

    return true;
  },

  // Remove a section from a page
  removeSectionFromPage(pageId, sectionId) {
    const page = this.getPage(pageId);
    if (!page) return false;

    page.sections = page.sections.filter(id => id !== sectionId);
    page.updatedAt = Date.now();

    this._persist();

    return true;
  },

  // Get all pages sorted by order
  getAllPagesSorted() {
    return Object.values(this._pages).sort((a, b) => a.order - b.order);
  },

  // Get pages by status
  getPagesByStatus(status) {
    return Object.values(this._pages).filter(p => p.status === status);
  }
};

// Safe initialization
if (typeof window !== 'undefined') {
  PageManager.init();
}

// Export
export const pageManager = PageManager;
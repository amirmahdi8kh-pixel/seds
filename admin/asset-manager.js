/* =========================================================
   ADMIN — Asset Manager Foundation (Phase 4)
   Future-ready data model for images, videos, SVG/icons,
   and fonts. Does NOT build the UI — only the underlying
   data model and API so later phases can use it without
   redesigning the architecture.
   Preserves existing Phase 3 modificationHistory behavior.
   Does NOT modify public website files or assets/js/main.js.
   ========================================================= */

"use strict";

// Asset type constants
const AssetTypes = {
  IMAGE: 'image',
  VIDEO: 'video',
  SVG: 'svg',
  FONT: 'font',
  AUDIO: 'audio', // future-ready
};

// Media metadata schema
// Every asset in the system should conform to this shape
const AssetMetadata = {
  // Unique identifier
  id: '',

  // Type classification
  type: AssetTypes.IMAGE, // IMAGE | VIDEO | SVG | FONT | AUDIO

  // Human-readable filename (original uploaded name)
  filename: '',

  // URL where the asset is accessible
  url: '',

  // MIME type
  mimeType: '',

  // Dimensions (for images/video)
  width: 0,
  height: 0,

  // Duration in seconds (video/audio only)
  duration: 0,

  // File size in bytes
  fileSize: 0,

  // Poster image URL (video only)
  poster: '',

  // Accessibility / alt text
  altText: '',

  // User-defined tags for searching/filtering
  tags: [], // string[]

  // User-defined categories
  categories: [], // string[]

  // CDN-optimized URL (if applicable)
  cdnUrl: '',

  // Optimized format variants (e.g., webp, mp4-1080p)
  optimizedFormats: [], // string[]

  // Thumbnail/image preview URL
  thumbnail: '',

  // Creation timestamp
  createdAt: 0, // Unix timestamp in ms

  // Last updated timestamp
  updatedAt: 0, // Unix timestamp in ms

  // Status: active | archiving | deleted
  status: 'active',
};

// Default empty metadata
const defaultMetadata = () => ({
  id: '',
  type: AssetTypes.IMAGE,
  filename: '',
  url: '',
  mimeType: '',
  width: 0,
  height: 0,
  duration: 0,
  fileSize: 0,
  poster: '',
  altText: '',
  tags: [],
  categories: [],
  cdnUrl: '',
  optimizedFormats: [],
  thumbnail: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'active',
});

// Asset Manager Foundation
// This module provides the data model and API. The UI (Media Library)
// will be built in later phases. This foundation ensures the architecture
// is ready for video and all media types without requiring redesign.
const AssetManager = {
  // ---- Internal state ----

  // In-memory asset registry: assetId -> metadata
  _assets: {},

  // ---- Public API ----

  // Get all assets
  getAll() {
    return Object.values(this._assets);
  },

  // Get asset by ID
  getById(assetId) {
    return this._assets[assetId] || null;
  },

  // Add a new asset
  // Returns the assetId
  add(metadata) {
    // Merge with defaults
    const metadataComplete = { ...defaultMetadata(), ...metadata };
    metadataComplete.id = metadataComplete.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    metadataComplete.createdAt = metadataComplete.createdAt || Date.now();
    metadataComplete.updatedAt = Date.now();

    // Store in memory
    this._assets[metadataComplete.id] = metadataComplete;

    // Persist to localStorage
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-asset-added', {
        detail: metadataComplete,
        bubbles: false,
      })
    );

    return metadataComplete.id;
  },

  // Update an existing asset
  update(assetId, partialMetadata) {
    const asset = this.getById(assetId);
    if (!asset) return null;

    // Merge partial metadata
    const updated = { ...asset, ...partialMetadata, updatedAt: Date.now() };

    // Store
    this._assets[assetId] = updated;

    // Persist
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-asset-updated', {
        detail: updated,
        bubbles: false,
      })
    );

    return updated.id;
  },

  // Remove an asset
  remove(assetId) {
    const asset = this.getById(assetId);
    if (!asset) return false;

    // Remove from memory
    delete this._assets[assetId];

    // Persist
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-asset-removed', {
        detail: asset,
        bubbles: false,
      })
    );

    return true;
  },

  // Search assets by query (matches against filename, tags, categories)
  search(query) {
    if (!query || query.trim() === '') return this.getAll();

    const lowerQuery = query.trim().toLowerCase();
    return this.getAll().filter((asset) => {
      const searchable = [
        asset.filename.toLowerCase(),
        ...(asset.tags || []).map((t) => t.toLowerCase()),
        ...(asset.categories || []).map((c) => c.toLowerCase()),
      ];

      return searchable.some((term) => term.includes(lowerQuery));
    });
  },

  // Filter assets by type
  filterByType(type) {
    return this.getAll().filter((asset) => asset.type === type);
  },

  // Filter assets by category
  filterByCategory(category) {
    return this.getAll().filter((asset) => asset.categories && asset.categories.includes(category));
  },

  // Get assets by types (array)
  filterByTypes(types) {
    return this.getAll().filter((asset) => types.includes(asset.type));
  },

  // ---- Internal / Persistence ----

  // Persist asset state to localStorage
  _persist() {
    try {
      localStorage.setItem('pe-asset-manager-v1', JSON.stringify(this._assets));
    } catch (e) {
      // localStorage full or disabled — fail silently
    }
  },

  // Load asset state from localStorage (backward compatible)
  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('pe-asset-manager-v1');
      if (!raw) return;

      const stored = JSON.parse(raw);

      // Merge with existing: new assets take precedence,
      // but existing assets are preserved
      if (typeof stored === 'object' && !Array.isArray(stored)) {
        Object.keys(stored).forEach((key) => {
          // Only overwrite if the new asset doesn't have critical fields
          if (!this._assets[key]) {
            // Minimal merge: just copy the metadata
            this._assets[key] = {
              ...defaultMetadata(),
              ...stored[key],
              id: key, // ensure ID matches the key
              createdAt: stored[key].createdAt || Date.now(),
              updatedAt: Date.now(),
            };
          }
        });
      }
    } catch (e) {
      // Malformed JSON — start fresh
      this._assets = {};
    }
  },

  // ---- Initialize ----

  // Safe initialization that won't break existing state
  init() {
    // Load any existing assets from localStorage
    this._loadFromStorage();

    // Ensure default structure exists
    if (Object.keys(this._assets).length === 0) {
      // No existing assets — nothing to migrate
    }
  },
};

// Safe initialization
if (typeof window !== 'undefined') {
  AssetManager.init();
}

export const assets = AssetManager;
export { AssetTypes, AssetMetadata, defaultMetadata };
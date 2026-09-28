/* =========================================================
   ADMIN — History System (Phase 4 Foundation)
   Operation-based undo/redo architecture.
   Safely integrates with EditorState and localStorage.
   Prevents uncontrolled history growth.
   Preserves existing Phase 3 modificationHistory behavior.
   ========================================================= */

"use strict";

// History state structure
// Stored in EditorState.state.history or standalone localStorage key 'pe-editor-history-v1'

const History = {
  // ---- Public API ----

  // Record a new operation
  // operation: { id, type, elementId, property, oldValue, newValue, action, timestamp }
  record(operation) {
    // Initialize history state if not exists
    if (!window.__peHistory) {
      this._init();
    }

    // Assign ID if not provided
    if (!operation.id) {
      operation.id = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Timestamp
    operation.timestamp = operation.timestamp || Date.now();

    // Add to undo stack
    window.__peHistory.undoStack.push(operation);

    // Clear redo stack when new operation recorded
    window.__peHistory.redoStack = [];

    // Prevent uncontrolled growth: limit undo stack to 100 operations
    if (window.__peHistory.undoStack.length > 100) {
      window.__peHistory.undoStack.shift(); // remove oldest
    }

    // Persist to localStorage
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-history-recorded', {
        detail: operation,
        bubbles: false,
      })
    );

    return operation.id;
  },

  // Undo last operation
  undo() {
    if (!window.__peHistory || window.__peHistory.undoStack.length === 0) {
      return false;
    }

    const operation = window.__peHistory.undoStack.pop();

    // Add to redo stack
    if (window.__peHistory) {
      window.__peHistory.redoStack.push(operation);
    }

    // Execute undo action
    this._executeUndo(operation);

    // Persist
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-history-undone', {
        detail: operation,
        bubbles: false,
      })
    );

    return true;
  },

  // Redo last undone operation
  redo() {
    if (!window.__peHistory || window.__peHistory.redoStack.length === 0) {
      return false;
    }

    const operation = window.__peHistory.redoStack.pop();

    // Add back to undo stack
    if (window.__peHistory) {
      window.__peHistory.undoStack.push(operation);
    }

    // Execute redo action
    this._executeRedo(operation);

    // Persist
    this._persist();

    // Fire event
    document.dispatchEvent(
      new CustomEvent('pe-history-redone', {
        detail: operation,
        bubbles: false,
      })
    );

    return true;
  },

  // Check if undo is available
  canUndo() {
    return !!(window.__peHistory && window.__peHistory.undoStack && window.__peHistory.undoStack.length > 0);
  },

  // Check if redo is available
  canRedo() {
    return !!(window.__peHistory && window.__peHistory.redoStack && window.__peHistory.redoStack.length > 0);
  },

  // Get current history state
  getHistory() {
    return window.__peHistory || {
      undoStack: [],
      redoStack: [],
    };
  },

  // Clear all history
  clear() {
    if (window.__peHistory) {
      window.__peHistory.undoStack = [];
      window.__peHistory.redoStack = [];
      this._persist();
    }
  },

  // ---- Internal / Helper methods ----

  // Initialize history state
  _init() {
    window.__peHistory = {
      undoStack: [],
      redoStack: [],
    };

    // Try to load existing history from localStorage
    this._loadFromStorage();
  },

  // Load history from localStorage
  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('pe-editor-history-v1');
      if (!raw) return;

      const stored = JSON.parse(raw);

      // Merge with existing: only keep operations from current session
      // and preserve any that predate this version
      if (stored.undoStack) {
        // Filter out operations older than a reasonable threshold
        // (e.g., operations from more than 30 days ago)
        const now = Date.now();
        const recentOps = stored.undoStack.filter(op => {
          return now - (op.timestamp || 0) < 30 * 24 * 60 * 60 * 1000;
        });
        window.__peHistory.undoStack = (window.__peHistory.undoStack || []).concat(recentOps);
      }
      if (stored.redoStack) {
        window.__peHistory.redoStack = stored.redoStack || [];
      }
    } catch (e) {
      // Malformed JSON — start fresh
      window.__peHistory = { undoStack: [], redoStack: [] };
    }
  },

  // Persist history to localStorage
  _persist() {
    try {
      if (!window.__peHistory) return;
      localStorage.setItem('pe-editor-history-v1', JSON.stringify(window.__peHistory));
    } catch (e) {
      // localStorage full or disabled — fail silently
    }
  },

  // ---- Undo/Redo execution helpers ----

  // Execute undo for an operation
  _executeUndo(operation) {
    // The actual undo logic is handled by the caller
    // (e.g., ElementState.recordModification reverse, etc.)
    // This method just validates the operation structure
    if (!operation || !operation.id) return false;

    // Store the original operation for potential redo
    return true;
  },

  // Execute redo for an operation
  _executeRedo(operation) {
    // The actual redo logic is handled by the caller
    // This method just validates the operation structure
    if (!operation || !operation.id) return false;
    return true;
  },
};

// Initialize on module load (defensive — will be re-initialized by EditorState if needed)
if (typeof window !== 'undefined' && !window.__peHistory) {
  History._init();
}

export const editorHistory = History;
/**
 * StateManager - Manages application state for the Flex Builder
 */
import { FlexTemplate } from '../models/FlexTemplate.js';

export class StateManager {
  constructor() {
    this.state = {
      currentTemplate: null,
      selectedPart: null,
      selectedPlacement: 'body',
      previewMode: 'mobile',
      isDirty: false,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50
    };
    
    this.listeners = new Map();
    this.eventTypes = [
      'template-changed',
      'part-selected',
      'part-added',
      'part-removed',
      'part-moved',
      'part-updated',
      'placement-changed',
      'preview-mode-changed',
      'dirty-state-changed',
      'history-changed'
    ];
  }

  // Event system
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(eventType, data = null) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // State getters
  getCurrentTemplate() {
    return this.state.currentTemplate;
  }

  getSelectedPart() {
    return this.state.selectedPart;
  }

  getSelectedPlacement() {
    return this.state.selectedPlacement;
  }

  getPreviewMode() {
    return this.state.previewMode;
  }

  isDirty() {
    return this.state.isDirty;
  }

  canUndo() {
    return this.state.historyIndex > 0;
  }

  canRedo() {
    return this.state.historyIndex < this.state.history.length - 1;
  }

  // Template management
  setCurrentTemplate(template) {
    if (template && !(template instanceof FlexTemplate)) {
      template = FlexTemplate.fromJSON(template);
    }
    
    this.state.currentTemplate = template;
    this.state.selectedPart = null;
    this.setDirty(false);
    this.saveToHistory('template-loaded');
    this.emit('template-changed', template);
  }

  createNewTemplate(category = 'statement') {
    const template = new FlexTemplate({
      category: category,
      name: this.getDefaultTemplateName(category)
    });
    
    this.setCurrentTemplate(template);
    return template;
  }

  getDefaultTemplateName(category) {
    const names = {
      statement: '明細通知テンプレート',
      confirm: '確認メッセージテンプレート',
      refund: 'キャンセル・返金通知テンプレート'
    };
    return names[category] || '新しいテンプレート';
  }

  // Part management
  selectPart(part) {
    this.state.selectedPart = part;
    this.emit('part-selected', part);
  }

  addPart(placement, partType, props = {}) {
    if (!this.state.currentTemplate) return null;
    
    const part = this.state.currentTemplate.layout.addPart(placement, partType, props);
    this.setDirty(true);
    this.saveToHistory('part-added');
    this.emit('part-added', { part, placement });
    return part;
  }

  removePart(placement, partId) {
    if (!this.state.currentTemplate) return;
    
    // Clear selection if removing selected part
    if (this.state.selectedPart && this.state.selectedPart.id === partId) {
      this.state.selectedPart = null;
      this.emit('part-selected', null);
    }
    
    this.state.currentTemplate.layout.removePart(placement, partId);
    this.setDirty(true);
    this.saveToHistory('part-removed');
    this.emit('part-removed', { partId, placement });
  }

  movePart(placement, partId, newOrder) {
    if (!this.state.currentTemplate) return;
    
    this.state.currentTemplate.layout.movePart(placement, partId, newOrder);
    this.setDirty(true);
    this.saveToHistory('part-moved');
    this.emit('part-moved', { partId, placement, newOrder });
  }

  updatePart(partId, updates) {
    if (!this.state.currentTemplate) return;
    
    const part = this.findPart(partId);
    if (part) {
      // Update part properties
      Object.keys(updates).forEach(key => {
        if (key === 'props') {
          Object.assign(part.props, updates.props);
        } else if (key === 'style') {
          Object.assign(part.style, updates.style);
        } else {
          part[key] = updates[key];
        }
      });
      
      this.setDirty(true);
      this.saveToHistory('part-updated');
      this.emit('part-updated', { part, updates });
    }
  }

  findPart(partId) {
    if (!this.state.currentTemplate) return null;
    
    const layout = this.state.currentTemplate.layout;
    const allParts = [...layout.header, ...layout.body, ...layout.footer];
    return allParts.find(part => part.id === partId);
  }

  // Placement management
  setSelectedPlacement(placement) {
    this.state.selectedPlacement = placement;
    this.emit('placement-changed', placement);
  }

  // Preview mode
  setPreviewMode(mode) {
    this.state.previewMode = mode;
    this.emit('preview-mode-changed', mode);
  }

  // Dirty state management
  setDirty(dirty) {
    if (this.state.isDirty !== dirty) {
      this.state.isDirty = dirty;
      this.emit('dirty-state-changed', dirty);
    }
  }

  // History management
  saveToHistory(action) {
    if (!this.state.currentTemplate) return;
    
    const snapshot = {
      action: action,
      timestamp: Date.now(),
      template: JSON.parse(JSON.stringify(this.state.currentTemplate.toJSON()))
    };
    
    // Remove any history after current index (for redo functionality)
    this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    
    // Add new snapshot
    this.state.history.push(snapshot);
    this.state.historyIndex = this.state.history.length - 1;
    
    // Limit history size
    if (this.state.history.length > this.state.maxHistorySize) {
      this.state.history.shift();
      this.state.historyIndex--;
    }
    
    this.emit('history-changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  undo() {
    if (!this.canUndo()) return;
    
    this.state.historyIndex--;
    const snapshot = this.state.history[this.state.historyIndex];
    this.state.currentTemplate = FlexTemplate.fromJSON(snapshot.template);
    this.state.selectedPart = null;
    this.setDirty(true);
    
    this.emit('template-changed', this.state.currentTemplate);
    this.emit('part-selected', null);
    this.emit('history-changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  redo() {
    if (!this.canRedo()) return;
    
    this.state.historyIndex++;
    const snapshot = this.state.history[this.state.historyIndex];
    this.state.currentTemplate = FlexTemplate.fromJSON(snapshot.template);
    this.state.selectedPart = null;
    this.setDirty(true);
    
    this.emit('template-changed', this.state.currentTemplate);
    this.emit('part-selected', null);
    this.emit('history-changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  // Template operations
  updateTemplateMetadata(updates) {
    if (!this.state.currentTemplate) return;
    
    Object.keys(updates).forEach(key => {
      this.state.currentTemplate[key] = updates[key];
    });
    
    this.state.currentTemplate.updateTimestamp();
    this.setDirty(true);
    this.saveToHistory('template-metadata-updated');
    this.emit('template-changed', this.state.currentTemplate);
  }

  updateTemplateTheme(themeUpdates) {
    if (!this.state.currentTemplate) return;
    
    Object.keys(themeUpdates).forEach(key => {
      this.state.currentTemplate.layout.theme[key] = themeUpdates[key];
    });
    
    this.setDirty(true);
    this.saveToHistory('theme-updated');
    this.emit('template-changed', this.state.currentTemplate);
  }

  // Validation
  validateCurrentTemplate() {
    if (!this.state.currentTemplate) {
      return { valid: false, errors: ['テンプレートが選択されていません'] };
    }
    
    const errors = [];
    const template = this.state.currentTemplate;
    
    // Check required fields
    if (!template.name || template.name.trim().length === 0) {
      errors.push('テンプレート名は必須です');
    }
    
    if (!template.altText || template.altText.trim().length === 0) {
      errors.push('代替テキストは必須です');
    }
    
    // Check if template has at least one part
    const layout = template.layout;
    const totalParts = layout.header.length + layout.body.length + layout.footer.length;
    if (totalParts === 0) {
      errors.push('テンプレートには最低1つのコンポーネントが必要です');
    }
    
    // Validate individual parts
    const allParts = [...layout.header, ...layout.body, ...layout.footer];
    allParts.forEach((part, index) => {
      // Add part-specific validation here
      if (!part.type) {
        errors.push(`コンポーネント ${index + 1}: タイプが指定されていません`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  // Reset state
  reset() {
    this.state = {
      currentTemplate: null,
      selectedPart: null,
      selectedPlacement: 'body',
      previewMode: 'mobile',
      isDirty: false,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50
    };
    
    this.emit('template-changed', null);
    this.emit('part-selected', null);
    this.emit('placement-changed', 'body');
    this.emit('preview-mode-changed', 'mobile');
    this.emit('dirty-state-changed', false);
    this.emit('history-changed', { canUndo: false, canRedo: false });
  }
}

// Singleton instance
export const stateManager = new StateManager();


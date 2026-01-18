/**
 * FlexTemplate - Main template data model
 */
export class FlexTemplate {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '新しいテンプレート';
    this.category = data.category || 'statement'; // 'statement' | 'confirm' | 'refund'
    this.altText = data.altText || 'メッセージが届きました';
    this.schemaVersion = data.schemaVersion || '1.0';
    this.layout = new FlexLayout(data.layout);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateTimestamp() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      altText: this.altText,
      schemaVersion: this.schemaVersion,
      layout: this.layout.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new FlexTemplate(data);
  }

  clone() {
    const cloned = FlexTemplate.fromJSON(this.toJSON());
    cloned.id = this.generateId();
    cloned.name = this.name + ' のコピー';
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();
    return cloned;
  }
}

/**
 * FlexLayout - Layout configuration for header, body, footer
 */
export class FlexLayout {
  constructor(data = {}) {
    this.bubbleSize = data.bubbleSize || 'mega';
    this.header = (data.header || []).map(part => Part.fromJSON(part));
    this.body = (data.body || []).map(part => Part.fromJSON(part));
    this.footer = (data.footer || []).map(part => Part.fromJSON(part));
    this.theme = new FlexTheme(data.theme);
  }

  addPart(placement, partType, props = {}) {
    const part = new Part({
      type: partType,
      props: props,
      placement: placement,
      order: this[placement].length
    });
    this[placement].push(part);
    return part;
  }

  removePart(placement, partId) {
    const index = this[placement].findIndex(part => part.id === partId);
    if (index !== -1) {
      this[placement].splice(index, 1);
      this.reorderParts(placement);
    }
  }

  movePart(placement, partId, newOrder) {
    const part = this[placement].find(p => p.id === partId);
    if (part) {
      this.removePart(placement, partId);
      part.order = newOrder;
      this[placement].splice(newOrder, 0, part);
      this.reorderParts(placement);
    }
  }

  reorderParts(placement) {
    this[placement].forEach((part, index) => {
      part.order = index;
    });
  }

  toJSON() {
    return {
      bubbleSize: this.bubbleSize,
      header: this.header.map(part => part.toJSON()),
      body: this.body.map(part => part.toJSON()),
      footer: this.footer.map(part => part.toJSON()),
      theme: this.theme.toJSON()
    };
  }
}

/**
 * FlexTheme - Color and styling theme
 */
export class FlexTheme {
  constructor(data = {}) {
    this.primaryColor = data.primaryColor || '#06b6d4';
    this.secondaryColor = data.secondaryColor || '#0891b2';
    this.textColor = data.textColor || '#111827';
    this.bgColor = data.bgColor || '#ffffff';
    this.borderColor = data.borderColor || '#e5e7eb';
    this.successColor = data.successColor || '#10b981';
    this.warningColor = data.warningColor || '#f59e0b';
    this.errorColor = data.errorColor || '#ef4444';
  }

  toJSON() {
    return {
      primaryColor: this.primaryColor,
      secondaryColor: this.secondaryColor,
      textColor: this.textColor,
      bgColor: this.bgColor,
      borderColor: this.borderColor,
      successColor: this.successColor,
      warningColor: this.warningColor,
      errorColor: this.errorColor
    };
  }
}

// Import Part class
import { Part } from './Part.js';


/**
 * ComponentRegistry - Manages available component types and their configurations
 */
import { PART_TYPES } from '../models/Part.js';

export class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.categories = new Map();
    this.initializeDefaultComponents();
  }

  initializeDefaultComponents() {
    // Register all default part types
    Object.entries(PART_TYPES).forEach(([type, config]) => {
      this.registerComponent(type, config);
    });

    // Initialize categories
    this.categories.set('content', {
      name: 'コンテンツ',
      description: 'テキストや情報を表示するコンポーネント',
      order: 1
    });
    this.categories.set('action', {
      name: 'アクション',
      description: 'ユーザーの操作を受け付けるコンポーネント',
      order: 2
    });
    this.categories.set('media', {
      name: 'メディア',
      description: '画像や動画などのメディアコンポーネント',
      order: 3
    });
    this.categories.set('decoration', {
      name: '装飾',
      description: '見た目を整えるコンポーネント',
      order: 4
    });
    this.categories.set('layout', {
      name: 'レイアウト',
      description: 'レイアウトを調整するコンポーネント',
      order: 5
    });
  }

  registerComponent(type, config) {
    this.components.set(type, {
      type,
      ...config,
      validator: this.getValidator(type),
      renderer: this.getRenderer(type),
      editor: this.getEditor(type)
    });
  }

  getComponent(type) {
    return this.components.get(type);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  getComponentsByCategory(category) {
    return this.getAllComponents().filter(comp => comp.category === category);
  }

  getCategories() {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  getCategoryComponents() {
    const result = {};
    this.getCategories().forEach(category => {
      result[category.name] = this.getComponentsByCategory(category.name.toLowerCase());
    });
    return result;
  }

  getValidator(type) {
    // Return type-specific validator function
    switch (type) {
      case 'date':
        return (props) => this.validateDateProps(props);
      case 'teacher':
        return (props) => this.validateTeacherProps(props);
      case 'title':
        return (props) => this.validateTitleProps(props);
      case 'items':
        return (props) => this.validateItemsProps(props);
      case 'comment':
        return (props) => this.validateCommentProps(props);
      case 'button':
        return (props) => this.validateButtonProps(props);
      case 'image':
        return (props) => this.validateImageProps(props);
      case 'tag':
        return (props) => this.validateTagProps(props);
      case 'reply_button':
        return (props) => this.validateReplyButtonProps(props);
      case 'separator':
        return (props) => this.validateSeparatorProps(props);
      case 'spacer':
        return (props) => this.validateSpacerProps(props);
      default:
        return (props) => ({ valid: true, errors: [] });
    }
  }

  getRenderer(type) {
    // Return type-specific HTML renderer function
    return (part, theme) => {
      switch (type) {
        case 'date':
          return this.renderDate(part, theme);
        case 'teacher':
          return this.renderTeacher(part, theme);
        case 'title':
          return this.renderTitle(part, theme);
        case 'items':
          return this.renderItems(part, theme);
        case 'comment':
          return this.renderComment(part, theme);
        case 'button':
          return this.renderButton(part, theme);
        case 'image':
          return this.renderImage(part, theme);
        case 'tag':
          return this.renderTag(part, theme);
        case 'reply_button':
          return this.renderReplyButton(part, theme);
        case 'separator':
          return this.renderSeparator(part, theme);
        case 'spacer':
          return this.renderSpacer(part, theme);
        default:
          return `<div class="unknown-component">Unknown component: ${type}</div>`;
      }
    };
  }

  getEditor(type) {
    // Return type-specific editor component class name
    return `${type.charAt(0).toUpperCase() + type.slice(1)}Editor`;
  }

  // Validation methods
  validateDateProps(props) {
    const errors = [];
    if (props.mode === 'manual' && !props.value) {
      errors.push('手動モードでは日付の値が必要です');
    }
    return { valid: errors.length === 0, errors };
  }

  validateTeacherProps(props) {
    const errors = [];
    if (!props.name || props.name.trim().length === 0) {
      errors.push('先生名は必須です');
    }
    return { valid: errors.length === 0, errors };
  }

  validateTitleProps(props) {
    const errors = [];
    if (!props.text || props.text.trim().length === 0) {
      errors.push('タイトルテキストは必須です');
    }
    if (props.text && props.text.length > 100) {
      errors.push('タイトルは100文字以内で入力してください');
    }
    return { valid: errors.length === 0, errors };
  }

  validateItemsProps(props) {
    const errors = [];
    if (!props.items || props.items.length === 0) {
      errors.push('最低1つの明細項目が必要です');
    }
    props.items?.forEach((item, index) => {
      if (!item.name || item.name.trim().length === 0) {
        errors.push(`明細項目 ${index + 1}: 項目名は必須です`);
      }
      if (item.amount === null || item.amount === undefined) {
        errors.push(`明細項目 ${index + 1}: 金額は必須です`);
      }
    });
    return { valid: errors.length === 0, errors };
  }

  validateCommentProps(props) {
    const errors = [];
    if (!props.text || props.text.trim().length === 0) {
      errors.push('コメントテキストは必須です');
    }
    if (props.text && props.text.length > 1000) {
      errors.push('コメントは1000文字以内で入力してください');
    }
    return { valid: errors.length === 0, errors };
  }

  validateButtonProps(props) {
    const errors = [];
    if (!props.label || props.label.trim().length === 0) {
      errors.push('ボタンラベルは必須です');
    }
    if (props.label && props.label.length > 20) {
      errors.push('ボタンラベルは20文字以内で入力してください');
    }
    if (!props.action) {
      errors.push('ボタンアクションは必須です');
    } else {
      if (props.action.type === 'postback' && !props.action.data) {
        errors.push('ポストバックデータは必須です');
      }
      if (props.action.type === 'uri' && !props.action.uri) {
        errors.push('URIは必須です');
      }
      if (props.action.type === 'message' && !props.action.text) {
        errors.push('メッセージテキストは必須です');
      }
    }
    return { valid: errors.length === 0, errors };
  }

  validateImageProps(props) {
    const errors = [];
    if (!props.url || props.url.trim().length === 0) {
      errors.push('画像URLは必須です');
    }
    if (props.url && !props.url.startsWith('https://')) {
      errors.push('画像URLはHTTPSである必要があります');
    }
    return { valid: errors.length === 0, errors };
  }

  validateTagProps(props) {
    const errors = [];
    if (!props.label || props.label.trim().length === 0) {
      errors.push('タグラベルは必須です');
    }
    if (props.label && props.label.length > 10) {
      errors.push('タグラベルは10文字以内で入力してください');
    }
    return { valid: errors.length === 0, errors };
  }

  validateReplyButtonProps(props) {
    const errors = [];
    if (!props.label || props.label.trim().length === 0) {
      errors.push('ボタンラベルは必須です');
    }
    if (!props.dataTemplate || props.dataTemplate.trim().length === 0) {
      errors.push('データテンプレートは必須です');
    }
    return { valid: errors.length === 0, errors };
  }

  validateSeparatorProps(props) {
    // Separators don't have required props
    return { valid: true, errors: [] };
  }

  validateSpacerProps(props) {
    // Spacers don't have required props
    return { valid: true, errors: [] };
  }

  // Basic render methods (will be enhanced in HtmlRenderer)
  renderDate(part, theme) {
    const date = part.props.mode === 'auto' ? new Date() : new Date(part.props.value);
    const formatted = this.formatDate(date, part.props.format);
    return `<div class="flex-date" style="color: ${theme.textColor}">${formatted}</div>`;
  }

  renderTeacher(part, theme) {
    return `<div class="flex-teacher" style="color: ${theme.textColor}">
      <span class="teacher-title">${part.props.title}</span>
      <span class="teacher-name">${part.props.name}</span>
    </div>`;
  }

  renderTitle(part, theme) {
    const tag = part.props.level || 'h2';
    return `<${tag} class="flex-title" style="color: ${theme.textColor}">${part.props.text}</${tag}>`;
  }

  renderItems(part, theme) {
    const items = part.props.items || [];
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    let html = '<div class="flex-items">';
    items.forEach(item => {
      html += `<div class="item-row">
        <span class="item-name">${item.name}</span>
        <span class="item-amount">${item.amount}${part.props.currency}</span>
      </div>`;
    });
    
    if (part.props.showTotal) {
      html += `<div class="item-total">
        <span class="total-label">合計</span>
        <span class="total-amount">${total}${part.props.currency}</span>
      </div>`;
    }
    
    html += '</div>';
    return html;
  }

  renderComment(part, theme) {
    const text = part.props.multiline ? 
      part.props.text.replace(/\n/g, '<br>') : 
      part.props.text;
    return `<div class="flex-comment" style="color: ${theme.textColor}">${text}</div>`;
  }

  renderButton(part, theme) {
    const styleClass = `btn-${part.props.style}`;
    return `<button class="flex-button ${styleClass}" style="background-color: ${theme.primaryColor}">
      ${part.props.label}
    </button>`;
  }

  renderImage(part, theme) {
    return `<div class="flex-image">
      <img src="${part.props.url}" alt="画像" style="aspect-ratio: ${part.props.aspectRatio}; object-fit: ${part.props.aspectMode};">
    </div>`;
  }

  renderTag(part, theme) {
    return `<span class="flex-tag" style="background-color: ${part.props.color}; font-size: ${this.getTagSize(part.props.size)}">
      ${part.props.label}
    </span>`;
  }

  renderReplyButton(part, theme) {
    return `<button class="flex-reply-button" style="background-color: ${theme.secondaryColor}">
      ${part.props.label}
    </button>`;
  }

  renderSeparator(part, theme) {
    return `<hr class="flex-separator" style="border-color: ${part.props.color}; margin: ${this.getSpacingValue(part.props.margin)};">`;
  }

  renderSpacer(part, theme) {
    return `<div class="flex-spacer" style="height: ${this.getSpacingValue(part.props.size)};"></div>`;
  }

  // Helper methods
  formatDate(date, format) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return format
      .replace('YYYY', year)
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('DD', day.toString().padStart(2, '0'));
  }

  getTagSize(size) {
    const sizes = { xs: '10px', sm: '12px', md: '14px' };
    return sizes[size] || sizes.sm;
  }

  getSpacingValue(spacing) {
    const values = {
      none: '0px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '40px'
    };
    return values[spacing] || values.md;
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();


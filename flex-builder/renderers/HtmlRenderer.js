/**
 * HtmlRenderer - Renders FlexTemplate as HTML for preview
 */
export class HtmlRenderer {
  constructor() {
    this.deviceWidths = {
      mobile: '375px',
      tablet: '768px',
      desktop: '1024px'
    };
  }

  /**
   * Render FlexTemplate as HTML
   */
  render(template, options = {}) {
    const {
      device = 'mobile',
      showDebugInfo = false,
      className = 'flex-preview'
    } = options;

    if (!template || !template.layout) {
      return '<div class="flex-error">テンプレートが見つかりません</div>';
    }

    const width = this.deviceWidths[device] || this.deviceWidths.mobile;
    const theme = template.layout.theme;

    return `
      <div class="${className}" style="width: ${width}; margin: 0 auto;">
        <div class="flex-bubble ${template.layout.bubbleSize}" style="background-color: ${theme.bgColor};">
          ${this.renderHeader(template.layout.header, theme)}
          ${this.renderBody(template.layout.body, theme)}
          ${this.renderFooter(template.layout.footer, theme)}
        </div>
        ${showDebugInfo ? this.renderDebugInfo(template) : ''}
      </div>
    `;
  }

  renderHeader(parts, theme) {
    if (!parts || parts.length === 0) return '';
    
    return `
      <div class="flex-header" style="background-color: ${theme.primaryColor}; color: white; padding: 16px;">
        ${this.renderParts(parts, theme, 'header')}
      </div>
    `;
  }

  renderBody(parts, theme) {
    return `
      <div class="flex-body" style="padding: 16px;">
        ${this.renderParts(parts, theme, 'body')}
      </div>
    `;
  }

  renderFooter(parts, theme) {
    if (!parts || parts.length === 0) return '';
    
    return `
      <div class="flex-footer" style="border-top: 1px solid ${theme.borderColor}; padding: 16px;">
        ${this.renderParts(parts, theme, 'footer')}
      </div>
    `;
  }

  renderParts(parts, theme, placement) {
    if (!parts || parts.length === 0) {
      return '<div class="empty-container">コンポーネントがありません</div>';
    }

    const sortedParts = [...parts].sort((a, b) => a.order - b.order);
    
    return sortedParts.map(part => this.renderPart(part, theme, placement)).join('');
  }

  renderPart(part, theme, placement) {
    const baseStyle = this.getPartBaseStyle(part, theme);
    const spacingStyle = this.getSpacingStyle(part.style);
    const combinedStyle = { ...baseStyle, ...spacingStyle };
    
    let content = '';
    
    switch (part.type) {
      case 'date':
        content = this.renderDatePart(part, theme);
        break;
      case 'teacher':
        content = this.renderTeacherPart(part, theme);
        break;
      case 'title':
        content = this.renderTitlePart(part, theme);
        break;
      case 'items':
        content = this.renderItemsPart(part, theme);
        break;
      case 'comment':
        content = this.renderCommentPart(part, theme);
        break;
      case 'button':
        content = this.renderButtonPart(part, theme);
        break;
      case 'image':
        content = this.renderImagePart(part, theme);
        break;
      case 'tag':
        content = this.renderTagPart(part, theme);
        break;
      case 'reply_button':
        content = this.renderReplyButtonPart(part, theme);
        break;
      case 'separator':
        content = this.renderSeparatorPart(part, theme);
        break;
      case 'spacer':
        content = this.renderSpacerPart(part, theme);
        break;
      default:
        content = `<div class="unknown-part">Unknown: ${part.type}</div>`;
    }

    const styleString = this.styleObjectToString(combinedStyle);
    
    return `
      <div class="flex-part flex-part-${part.type}" 
           data-part-id="${part.id}" 
           style="${styleString}">
        ${content}
      </div>
    `;
  }

  renderDatePart(part, theme) {
    const date = part.props.mode === 'auto' ? new Date() : new Date(part.props.value);
    const formatted = this.formatDate(date, part.props.format);
    const textStyle = this.getTextStyle(part.style, theme);
    
    return `<div class="date-content" style="${this.styleObjectToString(textStyle)}">${formatted}</div>`;
  }

  renderTeacherPart(part, theme) {
    const textStyle = this.getTextStyle(part.style, theme);
    
    return `
      <div class="teacher-content" style="display: flex; align-items: center; gap: 8px;">
        <span class="teacher-title" style="${this.styleObjectToString(textStyle)}; opacity: 0.8;">${part.props.title}</span>
        <span class="teacher-name" style="${this.styleObjectToString({...textStyle, fontWeight: 'bold'})}">${part.props.name}</span>
      </div>
    `;
  }

  renderTitlePart(part, theme) {
    const textStyle = this.getTextStyle(part.style, theme);
    const fontSize = this.getTitleFontSize(part.props.level);
    const tag = part.props.level || 'h2';
    
    return `<${tag} class="title-content" style="${this.styleObjectToString({...textStyle, fontSize, margin: '0'})}">${part.props.text}</${tag}>`;
  }

  renderItemsPart(part, theme) {
    const items = part.props.items || [];
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    let html = '<div class="items-content">';
    
    items.forEach(item => {
      html += `
        <div class="item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid ${theme.borderColor};">
          <div class="item-info">
            <div class="item-name" style="color: ${theme.textColor}; font-size: 14px;">${item.name}</div>
            ${item.note ? `<div class="item-note" style="color: #666; font-size: 12px; margin-top: 2px;">${item.note}</div>` : ''}
          </div>
          <div class="item-amount" style="color: ${theme.textColor}; font-weight: bold; font-size: 14px;">${item.amount}${part.props.currency}</div>
        </div>
      `;
    });
    
    if (part.props.showTotal) {
      html += `
        <div class="total-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid ${theme.primaryColor}; margin-top: 8px;">
          <div class="total-label" style="color: ${theme.textColor}; font-weight: bold; font-size: 16px;">合計</div>
          <div class="total-amount" style="color: ${theme.primaryColor}; font-weight: bold; font-size: 18px;">${total}${part.props.currency}</div>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }

  renderCommentPart(part, theme) {
    const textStyle = this.getTextStyle(part.style, theme);
    const text = part.props.multiline ? part.props.text.replace(/\n/g, '<br>') : part.props.text;
    
    return `<div class="comment-content" style="${this.styleObjectToString(textStyle)}">${text}</div>`;
  }

  renderButtonPart(part, theme) {
    const buttonStyle = this.getButtonStyle(part.props.style, theme);
    
    return `
      <button class="button-content btn-${part.props.style}" 
              style="${this.styleObjectToString(buttonStyle)}"
              onclick="alert('ボタンがクリックされました: ${part.props.label}')">
        ${part.props.label}
      </button>
    `;
  }

  renderImagePart(part, theme) {
    const aspectRatio = part.props.aspectRatio || '1:1';
    const aspectMode = part.props.aspectMode || 'cover';
    
    return `
      <div class="image-content" style="background-color: ${part.props.backgroundColor}; border-radius: 8px; overflow: hidden;">
        <img src="${part.props.url}" 
             alt="画像" 
             style="width: 100%; aspect-ratio: ${aspectRatio}; object-fit: ${aspectMode}; display: block;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="display: none; aspect-ratio: ${aspectRatio}; background-color: #f0f0f0; align-items: center; justify-content: center; color: #666;">
          画像を読み込めません
        </div>
      </div>
    `;
  }

  renderTagPart(part, theme) {
    const tagStyle = this.getTagStyle(part.props, theme);
    
    return `
      <span class="tag-content" style="${this.styleObjectToString(tagStyle)}">
        ${part.props.label}
      </span>
    `;
  }

  renderReplyButtonPart(part, theme) {
    const buttonStyle = this.getButtonStyle('secondary', theme);
    
    return `
      <button class="reply-button-content" 
              style="${this.styleObjectToString(buttonStyle)}"
              onclick="alert('返信ボタンがクリックされました')">
        ${part.props.label}
      </button>
    `;
  }

  renderSeparatorPart(part, theme) {
    return `
      <hr class="separator-content" 
          style="border: none; border-top: 1px solid ${part.props.color || theme.borderColor}; margin: 16px 0;">
    `;
  }

  renderSpacerPart(part, theme) {
    const height = this.getSpacerHeight(part.props.size);
    
    return `<div class="spacer-content" style="height: ${height};"></div>`;
  }

  // Style helper methods
  getPartBaseStyle(part, theme) {
    const style = {
      textAlign: part.style.align || 'left'
    };

    if (part.style.backgroundColor) {
      style.backgroundColor = part.style.backgroundColor;
    }

    if (part.style.borderColor) {
      style.border = `${part.style.borderWidth || '1px'} solid ${part.style.borderColor}`;
    }

    if (part.style.cornerRadius && part.style.cornerRadius !== '0px') {
      style.borderRadius = part.style.cornerRadius;
    }

    return style;
  }

  getSpacingStyle(style) {
    const spacing = {};

    if (style.margin && style.margin !== 'none') {
      spacing.margin = this.getSpacingValue(style.margin);
    }

    if (style.padding && style.padding !== 'none') {
      spacing.padding = this.getSpacingValue(style.padding);
    }

    return spacing;
  }

  getTextStyle(style, theme) {
    const textStyle = {
      color: style.color || theme.textColor,
      fontSize: this.getFontSize(style.size),
      fontWeight: style.weight || 'normal'
    };

    if (style.maxLines) {
      textStyle.display = '-webkit-box';
      textStyle.webkitLineClamp = style.maxLines;
      textStyle.webkitBoxOrient = 'vertical';
      textStyle.overflow = 'hidden';
    }

    return textStyle;
  }

  getButtonStyle(buttonType, theme) {
    const baseStyle = {
      border: 'none',
      borderRadius: '6px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%'
    };

    switch (buttonType) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.primaryColor,
          color: 'white'
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.primaryColor,
          border: `2px solid ${theme.primaryColor}`
        };
      case 'link':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.primaryColor,
          textDecoration: 'underline',
          padding: '8px 0'
        };
      default:
        return baseStyle;
    }
  }

  getTagStyle(props, theme) {
    return {
      display: 'inline-block',
      backgroundColor: props.color || theme.primaryColor,
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: this.getTagFontSize(props.size),
      fontWeight: 'bold'
    };
  }

  // Size and spacing helpers
  getFontSize(size) {
    const sizes = {
      xs: '10px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
      '3xl': '24px',
      '4xl': '28px',
      '5xl': '32px'
    };
    return sizes[size] || sizes.md;
  }

  getTitleFontSize(level) {
    const sizes = {
      h1: '24px',
      h2: '20px',
      h3: '18px'
    };
    return sizes[level] || sizes.h2;
  }

  getTagFontSize(size) {
    const sizes = {
      xs: '10px',
      sm: '12px',
      md: '14px'
    };
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

  getSpacerHeight(size) {
    const heights = {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    };
    return heights[size] || heights.md;
  }

  // Utility methods
  styleObjectToString(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  formatDate(date, format) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return format
      .replace('YYYY', year)
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('DD', day.toString().padStart(2, '0'));
  }

  renderDebugInfo(template) {
    const partCount = template.layout.header.length + 
                     template.layout.body.length + 
                     template.layout.footer.length;
    
    return `
      <div class="debug-info" style="margin-top: 16px; padding: 12px; background-color: #f8f9fa; border-radius: 6px; font-size: 12px; color: #666;">
        <strong>デバッグ情報:</strong><br>
        テンプレート名: ${template.name}<br>
        カテゴリ: ${template.category}<br>
        コンポーネント数: ${partCount}<br>
        バブルサイズ: ${template.layout.bubbleSize}
      </div>
    `;
  }

  /**
   * Generate CSS for the preview
   */
  generatePreviewCSS() {
    return `
      .flex-preview {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.5;
      }
      
      .flex-bubble {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        background-color: white;
      }
      
      .flex-bubble.nano { max-width: 200px; }
      .flex-bubble.micro { max-width: 240px; }
      .flex-bubble.kilo { max-width: 300px; }
      .flex-bubble.mega { max-width: 100%; }
      .flex-bubble.giga { max-width: 100%; }
      
      .flex-part {
        position: relative;
      }
      
      .flex-part:hover {
        outline: 2px solid #06b6d4;
        outline-offset: 2px;
      }
      
      .empty-container {
        padding: 20px;
        text-align: center;
        color: #999;
        font-style: italic;
        border: 2px dashed #ddd;
        border-radius: 6px;
      }
      
      .button-content:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }
      
      .unknown-part {
        padding: 8px;
        background-color: #fee;
        border: 1px solid #fcc;
        border-radius: 4px;
        color: #c66;
        font-size: 12px;
      }
    `;
  }
}


/**
 * FlexJsonConverter - Converts FlexTemplate to LINE Flex Message JSON
 */
import { FlexValidator } from '../validators/FlexValidator.js';

export class FlexJsonConverter {
  constructor() {
    this.validator = new FlexValidator();
  }

  /**
   * Convert FlexTemplate to LINE Flex Message JSON
   */
  convert(template) {
    try {
      // Validate template first
      const validation = this.validator.validateTemplate(template);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      const flexMessage = {
        type: 'flex',
        altText: template.altText,
        contents: this.convertBubble(template.layout, template.category)
      };

      // Validate final JSON
      const jsonValidation = this.validator.validateFlexJson(flexMessage);
      if (!jsonValidation.valid) {
        throw new Error(`Flex JSON validation failed: ${jsonValidation.errors.join(', ')}`);
      }

      return {
        success: true,
        data: flexMessage,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  /**
   * Convert FlexLayout to Bubble contents
   */
  convertBubble(layout, category) {
    const bubble = {
      type: 'bubble',
      size: layout.bubbleSize || 'mega'
    };

    // Convert header
    if (layout.header.length > 0) {
      bubble.header = this.convertContainer(layout.header, layout.theme);
    }

    // Convert body (required)
    bubble.body = this.convertContainer(layout.body, layout.theme);

    // Convert footer
    if (layout.footer.length > 0) {
      bubble.footer = this.convertContainer(layout.footer, layout.theme);
    }

    // Add styles if needed
    if (this.needsStyles(layout)) {
      bubble.styles = this.convertStyles(layout.theme);
    }

    return bubble;
  }

  /**
   * Convert parts array to Flex container
   */
  convertContainer(parts, theme) {
    const container = {
      type: 'box',
      layout: 'vertical',
      contents: []
    };

    // Sort parts by order
    const sortedParts = [...parts].sort((a, b) => a.order - b.order);

    sortedParts.forEach(part => {
      const flexComponent = this.convertPart(part, theme);
      if (flexComponent) {
        container.contents.push(flexComponent);
      }
    });

    // If no contents, add a spacer to prevent empty container
    if (container.contents.length === 0) {
      container.contents.push({
        type: 'spacer',
        size: 'sm'
      });
    }

    return container;
  }

  /**
   * Convert individual Part to Flex component
   */
  convertPart(part, theme) {
    switch (part.type) {
      case 'date':
        return this.convertDate(part, theme);
      case 'teacher':
        return this.convertTeacher(part, theme);
      case 'title':
        return this.convertTitle(part, theme);
      case 'items':
        return this.convertItems(part, theme);
      case 'comment':
        return this.convertComment(part, theme);
      case 'button':
        return this.convertButton(part, theme);
      case 'image':
        return this.convertImage(part, theme);
      case 'tag':
        return this.convertTag(part, theme);
      case 'reply_button':
        return this.convertReplyButton(part, theme);
      case 'separator':
        return this.convertSeparator(part, theme);
      case 'spacer':
        return this.convertSpacer(part, theme);
      default:
        console.warn(`Unknown part type: ${part.type}`);
        return null;
    }
  }

  convertDate(part, theme) {
    const date = part.props.mode === 'auto' ? new Date() : new Date(part.props.value);
    const formatted = this.formatDate(date, part.props.format);
    
    return {
      type: 'text',
      text: formatted,
      ...this.convertTextStyle(part.style, theme),
      ...this.convertSpacing(part.style)
    };
  }

  convertTeacher(part, theme) {
    return {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: part.props.title,
          size: 'sm',
          color: theme.textColor,
          flex: 0
        },
        {
          type: 'text',
          text: part.props.name,
          weight: 'bold',
          color: theme.textColor,
          flex: 1
        }
      ],
      ...this.convertSpacing(part.style)
    };
  }

  convertTitle(part, theme) {
    return {
      type: 'text',
      text: part.props.text,
      weight: 'bold',
      size: this.getTitleSize(part.props.level),
      color: part.style.color || theme.textColor,
      ...this.convertTextStyle(part.style, theme),
      ...this.convertSpacing(part.style)
    };
  }

  convertItems(part, theme) {
    const contents = [];
    
    // Add items
    part.props.items.forEach(item => {
      contents.push({
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: item.name,
            size: 'sm',
            color: theme.textColor,
            flex: 1
          },
          {
            type: 'text',
            text: `${item.amount}${part.props.currency}`,
            size: 'sm',
            color: theme.textColor,
            align: 'end',
            flex: 0
          }
        ],
        margin: 'sm'
      });
      
      if (item.note) {
        contents.push({
          type: 'text',
          text: item.note,
          size: 'xs',
          color: '#999999',
          margin: 'xs'
        });
      }
    });

    // Add total if enabled
    if (part.props.showTotal) {
      const total = part.props.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      contents.push({
        type: 'separator',
        margin: 'md'
      });
      
      contents.push({
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: '合計',
            weight: 'bold',
            color: theme.textColor,
            flex: 1
          },
          {
            type: 'text',
            text: `${total}${part.props.currency}`,
            weight: 'bold',
            color: theme.primaryColor,
            align: 'end',
            flex: 0
          }
        ],
        margin: 'md'
      });
    }

    return {
      type: 'box',
      layout: 'vertical',
      contents: contents,
      ...this.convertSpacing(part.style)
    };
  }

  convertComment(part, theme) {
    return {
      type: 'text',
      text: part.props.text,
      wrap: part.props.multiline,
      color: part.style.color || theme.textColor,
      ...this.convertTextStyle(part.style, theme),
      ...this.convertSpacing(part.style)
    };
  }

  convertButton(part, theme) {
    const button = {
      type: 'button',
      action: this.convertButtonAction(part.props.action),
      ...this.convertSpacing(part.style)
    };

    // Set button style
    if (part.props.style === 'primary') {
      button.style = 'primary';
      button.color = theme.primaryColor;
    } else if (part.props.style === 'secondary') {
      button.style = 'secondary';
    } else {
      button.style = 'link';
    }

    return button;
  }

  convertButtonAction(action) {
    const flexAction = {
      type: action.type,
      label: action.label
    };

    if (action.type === 'postback') {
      flexAction.data = action.data;
      if (action.displayText) {
        flexAction.displayText = action.displayText;
      }
    } else if (action.type === 'uri') {
      flexAction.uri = action.uri;
    } else if (action.type === 'message') {
      flexAction.text = action.text;
    }

    return flexAction;
  }

  convertImage(part, theme) {
    return {
      type: 'image',
      url: part.props.url,
      aspectRatio: part.props.aspectRatio,
      aspectMode: part.props.aspectMode,
      backgroundColor: part.props.backgroundColor,
      ...this.convertSpacing(part.style)
    };
  }

  convertTag(part, theme) {
    return {
      type: 'text',
      text: part.props.label,
      size: this.getTagSize(part.props.size),
      color: '#ffffff',
      backgroundColor: part.props.color,
      paddingAll: '4px',
      cornerRadius: '4px',
      flex: 0,
      ...this.convertSpacing(part.style)
    };
  }

  convertReplyButton(part, theme) {
    return {
      type: 'button',
      style: 'secondary',
      action: {
        type: 'postback',
        label: part.props.label,
        data: part.props.dataTemplate
      },
      ...this.convertSpacing(part.style)
    };
  }

  convertSeparator(part, theme) {
    return {
      type: 'separator',
      color: part.props.color,
      ...this.convertSpacing(part.style)
    };
  }

  convertSpacer(part, theme) {
    return {
      type: 'spacer',
      size: part.props.size
    };
  }

  // Helper methods
  convertTextStyle(style, theme) {
    const textStyle = {};
    
    if (style.size) textStyle.size = style.size;
    if (style.weight) textStyle.weight = style.weight;
    if (style.color) textStyle.color = style.color;
    if (style.align) textStyle.align = style.align;
    if (style.wrap !== undefined) textStyle.wrap = style.wrap;
    if (style.maxLines) textStyle.maxLines = style.maxLines;
    
    return textStyle;
  }

  convertSpacing(style) {
    const spacing = {};
    
    if (style.margin && style.margin !== 'none') {
      spacing.margin = style.margin;
    }
    if (style.padding && style.padding !== 'none') {
      spacing.paddingAll = style.padding;
    }
    if (style.backgroundColor) {
      spacing.backgroundColor = style.backgroundColor;
    }
    if (style.borderColor) {
      spacing.borderColor = style.borderColor;
    }
    if (style.borderWidth && style.borderWidth !== '0px') {
      spacing.borderWidth = style.borderWidth;
    }
    if (style.cornerRadius && style.cornerRadius !== '0px') {
      spacing.cornerRadius = style.cornerRadius;
    }
    
    return spacing;
  }

  convertStyles(theme) {
    return {
      header: {
        backgroundColor: theme.primaryColor
      },
      body: {
        backgroundColor: theme.bgColor
      },
      footer: {
        backgroundColor: theme.bgColor,
        separator: true
      }
    };
  }

  needsStyles(layout) {
    // Check if custom styles are needed
    return layout.theme.primaryColor !== '#06b6d4' || 
           layout.theme.bgColor !== '#ffffff';
  }

  getTitleSize(level) {
    const sizes = {
      h1: 'xl',
      h2: 'lg',
      h3: 'md'
    };
    return sizes[level] || 'lg';
  }

  getTagSize(size) {
    const sizes = {
      xs: 'xs',
      sm: 'sm',
      md: 'md'
    };
    return sizes[size] || 'sm';
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

  /**
   * Generate preview JSON (simplified for display)
   */
  generatePreviewJson(template) {
    const result = this.convert(template);
    if (result.success) {
      return JSON.stringify(result.data, null, 2);
    } else {
      return `// エラー: ${result.errors.join(', ')}`;
    }
  }

  /**
   * Validate and get postback data size
   */
  validatePostbackData(data) {
    const maxSize = 300; // LINE's limit
    if (data.length > maxSize) {
      return {
        valid: false,
        error: `ポストバックデータが${maxSize}文字を超えています (${data.length}文字)`
      };
    }
    return { valid: true };
  }
}


/**
 * FlexValidator - Validates FlexTemplate and Flex JSON against LINE specifications
 */
export class FlexValidator {
  constructor() {
    this.maxAltTextLength = 400;
    this.maxPostbackDataLength = 300;
    this.maxButtonLabelLength = 20;
    this.maxTextLength = 2000;
    this.maxImageUrlLength = 1000;
    this.maxContainerContents = 12;
    this.maxBubbleContainers = 3; // header, body, footer
  }

  /**
   * Validate FlexTemplate
   */
  validateTemplate(template) {
    const errors = [];

    // Basic template validation
    if (!template) {
      errors.push('テンプレートが指定されていません');
      return { valid: false, errors };
    }

    // Required fields
    if (!template.name || template.name.trim().length === 0) {
      errors.push('テンプレート名は必須です');
    }

    if (!template.altText || template.altText.trim().length === 0) {
      errors.push('代替テキストは必須です');
    } else if (template.altText.length > this.maxAltTextLength) {
      errors.push(`代替テキストは${this.maxAltTextLength}文字以内で入力してください`);
    }

    if (!template.category) {
      errors.push('テンプレートカテゴリは必須です');
    }

    // Layout validation
    if (!template.layout) {
      errors.push('レイアウト情報が不足しています');
      return { valid: false, errors };
    }

    // Validate layout structure
    const layoutValidation = this.validateLayout(template.layout);
    errors.push(...layoutValidation.errors);

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate FlexLayout
   */
  validateLayout(layout) {
    const errors = [];

    // Check if at least one container has content
    const totalParts = layout.header.length + layout.body.length + layout.footer.length;
    if (totalParts === 0) {
      errors.push('テンプレートには最低1つのコンポーネントが必要です');
    }

    // Validate each container
    const containerValidation = [
      { name: 'ヘッダー', parts: layout.header },
      { name: 'ボディ', parts: layout.body },
      { name: 'フッター', parts: layout.footer }
    ];

    containerValidation.forEach(container => {
      if (container.parts.length > this.maxContainerContents) {
        errors.push(`${container.name}のコンポーネント数が上限(${this.maxContainerContents})を超えています`);
      }

      container.parts.forEach((part, index) => {
        const partValidation = this.validatePart(part);
        partValidation.errors.forEach(error => {
          errors.push(`${container.name} コンポーネント${index + 1}: ${error}`);
        });
      });
    });

    // Validate theme
    if (layout.theme) {
      const themeValidation = this.validateTheme(layout.theme);
      errors.push(...themeValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate individual Part
   */
  validatePart(part) {
    const errors = [];

    if (!part.type) {
      errors.push('コンポーネントタイプが指定されていません');
      return { valid: false, errors };
    }

    // Type-specific validation
    switch (part.type) {
      case 'date':
        errors.push(...this.validateDatePart(part).errors);
        break;
      case 'teacher':
        errors.push(...this.validateTeacherPart(part).errors);
        break;
      case 'title':
        errors.push(...this.validateTitlePart(part).errors);
        break;
      case 'items':
        errors.push(...this.validateItemsPart(part).errors);
        break;
      case 'comment':
        errors.push(...this.validateCommentPart(part).errors);
        break;
      case 'button':
        errors.push(...this.validateButtonPart(part).errors);
        break;
      case 'image':
        errors.push(...this.validateImagePart(part).errors);
        break;
      case 'tag':
        errors.push(...this.validateTagPart(part).errors);
        break;
      case 'reply_button':
        errors.push(...this.validateReplyButtonPart(part).errors);
        break;
      case 'separator':
        errors.push(...this.validateSeparatorPart(part).errors);
        break;
      case 'spacer':
        errors.push(...this.validateSpacerPart(part).errors);
        break;
      default:
        errors.push(`未知のコンポーネントタイプ: ${part.type}`);
    }

    // Validate style
    if (part.style) {
      const styleValidation = this.validatePartStyle(part.style);
      errors.push(...styleValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  validateDatePart(part) {
    const errors = [];
    const props = part.props;

    if (props.mode === 'manual' && !props.value) {
      errors.push('手動モードでは日付の値が必要です');
    }

    if (props.value) {
      const date = new Date(props.value);
      if (isNaN(date.getTime())) {
        errors.push('無効な日付形式です');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateTeacherPart(part) {
    const errors = [];
    const props = part.props;

    if (!props.name || props.name.trim().length === 0) {
      errors.push('先生名は必須です');
    }

    if (props.name && props.name.length > 50) {
      errors.push('先生名は50文字以内で入力してください');
    }

    return { valid: errors.length === 0, errors };
  }

  validateTitlePart(part) {
    const errors = [];
    const props = part.props;

    if (!props.text || props.text.trim().length === 0) {
      errors.push('タイトルテキストは必須です');
    }

    if (props.text && props.text.length > 100) {
      errors.push('タイトルは100文字以内で入力してください');
    }

    return { valid: errors.length === 0, errors };
  }

  validateItemsPart(part) {
    const errors = [];
    const props = part.props;

    if (!props.items || props.items.length === 0) {
      errors.push('最低1つの明細項目が必要です');
    }

    if (props.items) {
      props.items.forEach((item, index) => {
        if (!item.name || item.name.trim().length === 0) {
          errors.push(`明細項目 ${index + 1}: 項目名は必須です`);
        }
        if (item.name && item.name.length > 50) {
          errors.push(`明細項目 ${index + 1}: 項目名は50文字以内で入力してください`);
        }
        if (item.amount === null || item.amount === undefined) {
          errors.push(`明細項目 ${index + 1}: 金額は必須です`);
        }
        if (typeof item.amount === 'number' && item.amount < 0) {
          errors.push(`明細項目 ${index + 1}: 金額は0以上で入力してください`);
        }
        if (item.note && item.note.length > 100) {
          errors.push(`明細項目 ${index + 1}: 補足は100文字以内で入力してください`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  validateCommentPart(part) {
    const errors = [];
    const props = part.props;

    if (!props.text || props.text.trim().length === 0) {
      errors.push('コメントテキストは必須です');
    }

    if (props.text && props.text.length > this.maxTextLength) {
      errors.push(`コメントは${this.maxTextLength}文字以内で入力してください`);
    }

    return { valid: errors.length === 0, errors };
  }

  validateButtonPart(part) {
    const errors = [];
    const props = part.props;

    if (!props.label || props.label.trim().length === 0) {
      errors.push('ボタンラベルは必須です');
    }

    if (props.label && props.label.length > this.maxButtonLabelLength) {
      errors.push(`ボタンラベルは${this.maxButtonLabelLength}文字以内で入力してください`);
    }

    if (!props.action) {
      errors.push('ボタンアクションは必須です');
    } else {
      const actionValidation = this.validateButtonAction(props.action);
      errors.push(...actionValidation.errors);
    }

    return { valid: errors.length === 0, errors };
  }

  validateButtonAction(action) {
    const errors = [];

    if (!action.type) {
      errors.push('アクションタイプは必須です');
      return { valid: false, errors };
    }

    if (!action.label || action.label.trim().length === 0) {
      errors.push('アクションラベルは必須です');
    }

    switch (action.type) {
      case 'postback':
        if (!action.data || action.data.trim().length === 0) {
          errors.push('ポストバックデータは必須です');
        } else if (action.data.length > this.maxPostbackDataLength) {
          errors.push(`ポストバックデータは${this.maxPostbackDataLength}文字以内で入力してください`);
        }
        break;
      case 'uri':
        if (!action.uri || action.uri.trim().length === 0) {
          errors.push('URIは必須です');
        } else if (!this.isValidUrl(action.uri)) {
          errors.push('有効なURLを入力してください');
        }
        break;
      case 'message':
        if (!action.text || action.text.trim().length === 0) {
          errors.push('メッセージテキストは必須です');
        } else if (action.text.length > 300) {
          errors.push('メッセージテキストは300文字以内で入力してください');
        }
        break;
      default:
        errors.push(`未知のアクションタイプ: ${action.type}`);
    }

    return { valid: errors.length === 0, errors };
  }

  validateImagePart(part) {
    const errors = [];
    const props = part.props;

    if (!props.url || props.url.trim().length === 0) {
      errors.push('画像URLは必須です');
    } else {
      if (!props.url.startsWith('https://')) {
        errors.push('画像URLはHTTPSである必要があります');
      }
      if (props.url.length > this.maxImageUrlLength) {
        errors.push(`画像URLは${this.maxImageUrlLength}文字以内で入力してください`);
      }
      if (!this.isValidUrl(props.url)) {
        errors.push('有効な画像URLを入力してください');
      }
    }

    // Validate aspect ratio
    if (props.aspectRatio && !this.isValidAspectRatio(props.aspectRatio)) {
      errors.push('無効なアスペクト比です (例: 1:1, 16:9)');
    }

    return { valid: errors.length === 0, errors };
  }

  validateTagPart(part) {
    const errors = [];
    const props = part.props;

    if (!props.label || props.label.trim().length === 0) {
      errors.push('タグラベルは必須です');
    }

    if (props.label && props.label.length > 10) {
      errors.push('タグラベルは10文字以内で入力してください');
    }

    if (props.color && !this.isValidColor(props.color)) {
      errors.push('無効な色形式です');
    }

    return { valid: errors.length === 0, errors };
  }

  validateReplyButtonPart(part) {
    const errors = [];
    const props = part.props;

    if (!props.label || props.label.trim().length === 0) {
      errors.push('ボタンラベルは必須です');
    }

    if (props.label && props.label.length > this.maxButtonLabelLength) {
      errors.push(`ボタンラベルは${this.maxButtonLabelLength}文字以内で入力してください`);
    }

    if (!props.dataTemplate || props.dataTemplate.trim().length === 0) {
      errors.push('データテンプレートは必須です');
    }

    return { valid: errors.length === 0, errors };
  }

  validateSeparatorPart(part) {
    const errors = [];
    const props = part.props;

    if (props.color && !this.isValidColor(props.color)) {
      errors.push('無効な色形式です');
    }

    return { valid: errors.length === 0, errors };
  }

  validateSpacerPart(part) {
    const errors = [];
    // Spacers don't have required validation
    return { valid: errors.length === 0, errors };
  }

  validatePartStyle(style) {
    const errors = [];

    if (style.backgroundColor && !this.isValidColor(style.backgroundColor)) {
      errors.push('無効な背景色形式です');
    }

    if (style.borderColor && !this.isValidColor(style.borderColor)) {
      errors.push('無効な境界線色形式です');
    }

    if (style.color && !this.isValidColor(style.color)) {
      errors.push('無効なテキスト色形式です');
    }

    return { valid: errors.length === 0, errors };
  }

  validateTheme(theme) {
    const errors = [];

    const colorFields = [
      'primaryColor', 'secondaryColor', 'textColor', 'bgColor',
      'borderColor', 'successColor', 'warningColor', 'errorColor'
    ];

    colorFields.forEach(field => {
      if (theme[field] && !this.isValidColor(theme[field])) {
        errors.push(`無効な${field}形式です`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate final Flex JSON
   */
  validateFlexJson(flexJson) {
    const errors = [];

    if (!flexJson || typeof flexJson !== 'object') {
      errors.push('無効なFlex JSONです');
      return { valid: false, errors };
    }

    if (flexJson.type !== 'flex') {
      errors.push('Flex messageのtypeは"flex"である必要があります');
    }

    if (!flexJson.altText) {
      errors.push('altTextは必須です');
    }

    if (!flexJson.contents) {
      errors.push('contentsは必須です');
    } else if (flexJson.contents.type !== 'bubble') {
      errors.push('現在はbubbleタイプのみサポートしています');
    }

    return { valid: errors.length === 0, errors };
  }

  // Helper methods
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isValidColor(color) {
    // Check hex color format
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(color);
  }

  isValidAspectRatio(ratio) {
    // Check format like "1:1", "16:9", etc.
    const ratioPattern = /^\d+:\d+$/;
    return ratioPattern.test(ratio);
  }

  /**
   * Get validation summary
   */
  getValidationSummary(template) {
    const templateValidation = this.validateTemplate(template);
    
    return {
      isValid: templateValidation.valid,
      errorCount: templateValidation.errors.length,
      errors: templateValidation.errors,
      warnings: this.getWarnings(template)
    };
  }

  getWarnings(template) {
    const warnings = [];

    if (!template) return warnings;

    // Check for potential issues
    if (template.layout) {
      const totalParts = template.layout.header.length + 
                        template.layout.body.length + 
                        template.layout.footer.length;
      
      if (totalParts > 8) {
        warnings.push('コンポーネント数が多いため、メッセージが長くなる可能性があります');
      }

      if (template.layout.body.length === 0) {
        warnings.push('ボディにコンポーネントがありません');
      }
    }

    if (template.altText && template.altText.length < 10) {
      warnings.push('代替テキストが短すぎる可能性があります');
    }

    return warnings;
  }
}


/**
 * Part - Individual component in a Flex message
 */
export class Part {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.type = data.type || 'text';
    this.props = new PartProps(data.type, data.props);
    this.style = new PartStyle(data.style);
    this.placement = data.placement || 'body';
    this.order = data.order || 0;
  }

  generateId() {
    return 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      props: this.props.toJSON(),
      style: this.style.toJSON(),
      placement: this.placement,
      order: this.order
    };
  }

  static fromJSON(data) {
    return new Part(data);
  }

  clone() {
    const cloned = Part.fromJSON(this.toJSON());
    cloned.id = this.generateId();
    return cloned;
  }
}

/**
 * PartProps - Type-specific properties for each part type
 */
export class PartProps {
  constructor(type, data = {}) {
    this.type = type;
    
    switch (type) {
      case 'date':
        this.mode = data.mode || 'auto'; // 'auto' | 'manual'
        this.format = data.format || 'YYYY年MM月DD日';
        this.value = data.value || null;
        break;
        
      case 'teacher':
        this.name = data.name || '';
        this.title = data.title || '先生';
        break;
        
      case 'title':
        this.text = data.text || '';
        this.level = data.level || 'h2'; // 'h1' | 'h2' | 'h3'
        break;
        
      case 'items':
        this.items = data.items || [];
        this.showTotal = data.showTotal !== false;
        this.currency = data.currency || '円';
        break;
        
      case 'comment':
        this.text = data.text || '';
        this.multiline = data.multiline !== false;
        break;
        
      case 'button':
        this.label = data.label || 'ボタン';
        this.action = new ButtonAction(data.action);
        this.style = data.style || 'primary'; // 'primary' | 'secondary' | 'link'
        break;
        
      case 'image':
        this.url = data.url || '';
        this.aspectRatio = data.aspectRatio || '1:1';
        this.aspectMode = data.aspectMode || 'cover'; // 'cover' | 'fit'
        this.backgroundColor = data.backgroundColor || '#ffffff';
        break;
        
      case 'tag':
        this.label = data.label || 'タグ';
        this.color = data.color || '#06b6d4';
        this.size = data.size || 'sm'; // 'xs' | 'sm' | 'md'
        break;
        
      case 'reply_button':
        this.label = data.label || '返信する';
        this.dataTemplate = data.dataTemplate || 'reply:{{STATEMENT_ID}}';
        break;
        
      case 'separator':
        this.margin = data.margin || 'md';
        this.color = data.color || '#e5e7eb';
        break;
        
      case 'spacer':
        this.size = data.size || 'md'; // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
        break;
        
      default:
        // Custom properties for unknown types
        Object.assign(this, data);
    }
  }

  toJSON() {
    const result = { type: this.type };
    
    // Copy all properties except type
    Object.keys(this).forEach(key => {
      if (key !== 'type') {
        if (this[key] && typeof this[key].toJSON === 'function') {
          result[key] = this[key].toJSON();
        } else {
          result[key] = this[key];
        }
      }
    });
    
    return result;
  }
}

/**
 * ButtonAction - Action configuration for buttons
 */
export class ButtonAction {
  constructor(data = {}) {
    this.type = data.type || 'postback'; // 'postback' | 'uri' | 'message'
    this.label = data.label || '';
    
    if (this.type === 'postback') {
      this.data = data.data || '';
      this.displayText = data.displayText || '';
    } else if (this.type === 'uri') {
      this.uri = data.uri || '';
    } else if (this.type === 'message') {
      this.text = data.text || '';
    }
  }

  toJSON() {
    const result = {
      type: this.type,
      label: this.label
    };

    if (this.type === 'postback') {
      result.data = this.data;
      if (this.displayText) result.displayText = this.displayText;
    } else if (this.type === 'uri') {
      result.uri = this.uri;
    } else if (this.type === 'message') {
      result.text = this.text;
    }

    return result;
  }
}

/**
 * PartStyle - Styling properties for parts
 */
export class PartStyle {
  constructor(data = {}) {
    this.align = data.align || 'start'; // 'start' | 'center' | 'end'
    this.margin = data.margin || 'none'; // 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
    this.padding = data.padding || 'none';
    this.backgroundColor = data.backgroundColor || null;
    this.borderColor = data.borderColor || null;
    this.borderWidth = data.borderWidth || '0px';
    this.cornerRadius = data.cornerRadius || '0px';
    
    // Text-specific styles
    this.color = data.color || null;
    this.size = data.size || 'md'; // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | '4xl' | '5xl'
    this.weight = data.weight || 'regular'; // 'regular' | 'bold'
    this.wrap = data.wrap !== false;
    this.maxLines = data.maxLines || null;
  }

  toJSON() {
    return {
      align: this.align,
      margin: this.margin,
      padding: this.padding,
      backgroundColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      cornerRadius: this.cornerRadius,
      color: this.color,
      size: this.size,
      weight: this.weight,
      wrap: this.wrap,
      maxLines: this.maxLines
    };
  }
}

/**
 * Part type definitions and metadata
 */
export const PART_TYPES = {
  date: {
    name: '日付',
    icon: '📅',
    description: '自動または手動で日付を表示',
    category: 'content'
  },
  teacher: {
    name: '先生名',
    icon: '👨‍🏫',
    description: '先生の名前とタイトルを表示',
    category: 'content'
  },
  title: {
    name: 'タイトル',
    icon: '📝',
    description: 'メッセージのタイトルや見出し',
    category: 'content'
  },
  items: {
    name: '明細',
    icon: '📋',
    description: '項目と金額のリスト',
    category: 'content'
  },
  comment: {
    name: 'コメント',
    icon: '💬',
    description: 'テキストコメントや説明',
    category: 'content'
  },
  button: {
    name: 'ボタン',
    icon: '🔘',
    description: 'アクション付きボタン',
    category: 'action'
  },
  image: {
    name: 'イラスト',
    icon: '🖼️',
    description: '画像やイラストを表示',
    category: 'media'
  },
  tag: {
    name: 'タグ',
    icon: '🏷️',
    description: '小さなバッジやラベル',
    category: 'decoration'
  },
  reply_button: {
    name: '返信するボタン',
    icon: '↩️',
    description: '返信を促すボタン',
    category: 'action'
  },
  separator: {
    name: '区切り線',
    icon: '➖',
    description: '水平線で区切り',
    category: 'layout'
  },
  spacer: {
    name: 'スペーサー',
    icon: '⬜',
    description: '空白スペースを追加',
    category: 'layout'
  }
};


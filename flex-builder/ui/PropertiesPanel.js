/**
 * PropertiesPanel - Manages the properties panel UI
 */
import { stateManager } from '../core/StateManager.js';
import { componentRegistry } from '../core/ComponentRegistry.js';

export class PropertiesPanel {
  constructor() {
    this.currentPart = null;
  }

  async init() {
    this.setupEventListeners();
    this.showNoSelection();
  }

  setupEventListeners() {
    // Listen for part selection changes
    stateManager.on('part-selected', (part) => {
      this.showPartProperties(part);
    });
  }

  showPartProperties(part) {
    this.currentPart = part;
    const container = document.getElementById('properties-panel');
    
    if (!part) {
      this.showNoSelection();
      return;
    }

    const component = componentRegistry.getComponent(part.type);
    if (!component) {
      container.innerHTML = '<div class="no-selection"><p>未知のコンポーネントです</p></div>';
      return;
    }

    container.innerHTML = this.renderPartProperties(part, component);
    this.setupPropertyEventListeners();
  }

  showNoSelection() {
    const container = document.getElementById('properties-panel');
    container.innerHTML = '<div class="no-selection"><p>コンポーネントを選択してください</p></div>';
  }

  renderPartProperties(part, component) {
    return `
      <div class="part-properties">
        <div class="property-header">
          <h4>${component.icon} ${component.name}</h4>
          <p class="component-description">${component.description}</p>
        </div>
        
        ${this.renderBasicProperties(part)}
        ${this.renderTypeSpecificProperties(part)}
        ${this.renderStyleProperties(part)}
      </div>
    `;
  }

  renderBasicProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">基本設定</div>
        
        <div class="property-group">
          <label class="property-label">配置</label>
          <select class="property-input" data-property="placement">
            <option value="header" ${part.placement === 'header' ? 'selected' : ''}>ヘッダー</option>
            <option value="body" ${part.placement === 'body' ? 'selected' : ''}>ボディ</option>
            <option value="footer" ${part.placement === 'footer' ? 'selected' : ''}>フッター</option>
          </select>
        </div>
      </div>
    `;
  }

  renderTypeSpecificProperties(part) {
    switch (part.type) {
      case 'date':
        return this.renderDateProperties(part);
      case 'teacher':
        return this.renderTeacherProperties(part);
      case 'title':
        return this.renderTitleProperties(part);
      case 'items':
        return this.renderItemsProperties(part);
      case 'comment':
        return this.renderCommentProperties(part);
      case 'button':
        return this.renderButtonProperties(part);
      case 'image':
        return this.renderImageProperties(part);
      case 'tag':
        return this.renderTagProperties(part);
      case 'reply_button':
        return this.renderReplyButtonProperties(part);
      case 'separator':
        return this.renderSeparatorProperties(part);
      case 'spacer':
        return this.renderSpacerProperties(part);
      default:
        return '<div class="property-section"><div class="section-title">設定項目なし</div></div>';
    }
  }

  renderDateProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">日付設定</div>
        
        <div class="property-group">
          <label class="property-label">モード</label>
          <select class="property-input" data-property="props.mode">
            <option value="auto" ${part.props.mode === 'auto' ? 'selected' : ''}>自動（現在日時）</option>
            <option value="manual" ${part.props.mode === 'manual' ? 'selected' : ''}>手動指定</option>
          </select>
        </div>
        
        ${part.props.mode === 'manual' ? `
          <div class="property-group">
            <label class="property-label">日付</label>
            <input type="date" class="property-input" data-property="props.value" value="${part.props.value || ''}">
          </div>
        ` : ''}
        
        <div class="property-group">
          <label class="property-label">表示形式</label>
          <select class="property-input" data-property="props.format">
            <option value="YYYY年MM月DD日" ${part.props.format === 'YYYY年MM月DD日' ? 'selected' : ''}>2024年01月15日</option>
            <option value="YYYY/MM/DD" ${part.props.format === 'YYYY/MM/DD' ? 'selected' : ''}>2024/01/15</option>
            <option value="MM月DD日" ${part.props.format === 'MM月DD日' ? 'selected' : ''}>01月15日</option>
          </select>
        </div>
      </div>
    `;
  }

  renderTeacherProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">先生情報</div>
        
        <div class="property-group">
          <label class="property-label">先生名</label>
          <input type="text" class="property-input" data-property="props.name" value="${part.props.name || ''}" placeholder="田中先生">
        </div>
        
        <div class="property-group">
          <label class="property-label">役職・タイトル</label>
          <input type="text" class="property-input" data-property="props.title" value="${part.props.title || ''}" placeholder="担当">
        </div>
      </div>
    `;
  }

  renderTitleProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">タイトル設定</div>
        
        <div class="property-group">
          <label class="property-label">タイトルテキスト</label>
          <input type="text" class="property-input" data-property="props.text" value="${part.props.text || ''}" placeholder="タイトルを入力">
        </div>
        
        <div class="property-group">
          <label class="property-label">見出しレベル</label>
          <select class="property-input" data-property="props.level">
            <option value="h1" ${part.props.level === 'h1' ? 'selected' : ''}>大見出し (H1)</option>
            <option value="h2" ${part.props.level === 'h2' ? 'selected' : ''}>中見出し (H2)</option>
            <option value="h3" ${part.props.level === 'h3' ? 'selected' : ''}>小見出し (H3)</option>
          </select>
        </div>
      </div>
    `;
  }

  renderItemsProperties(part) {
    const items = part.props.items || [];
    
    return `
      <div class="property-section">
        <div class="section-title">明細設定</div>
        
        <div class="property-group">
          <label class="property-label">通貨単位</label>
          <input type="text" class="property-input" data-property="props.currency" value="${part.props.currency || '円'}" placeholder="円">
        </div>
        
        <div class="property-group">
          <label class="property-label">
            <input type="checkbox" data-property="props.showTotal" ${part.props.showTotal ? 'checked' : ''}>
            合計を表示
          </label>
        </div>
        
        <div class="property-group">
          <label class="property-label">明細項目</label>
          <div class="items-editor">
            ${items.map((item, index) => this.renderItemEditor(item, index)).join('')}
            <button type="button" class="btn secondary" onclick="propertiesPanel.addItem()">項目を追加</button>
          </div>
        </div>
      </div>
    `;
  }

  renderItemEditor(item, index) {
    return `
      <div class="item-editor" data-item-index="${index}">
        <div class="property-row">
          <input type="text" class="property-input" data-item-property="name" value="${item.name || ''}" placeholder="項目名">
          <input type="number" class="property-input" data-item-property="amount" value="${item.amount || 0}" placeholder="金額">
          <button type="button" class="part-action-btn" onclick="propertiesPanel.removeItem(${index})">×</button>
        </div>
        <input type="text" class="property-input" data-item-property="note" value="${item.note || ''}" placeholder="備考（任意）">
      </div>
    `;
  }

  renderCommentProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">コメント設定</div>
        
        <div class="property-group">
          <label class="property-label">コメントテキスト</label>
          <textarea class="property-input" data-property="props.text" rows="4" placeholder="コメントを入力">${part.props.text || ''}</textarea>
        </div>
        
        <div class="property-group">
          <label class="property-label">
            <input type="checkbox" data-property="props.multiline" ${part.props.multiline ? 'checked' : ''}>
            複数行表示
          </label>
        </div>
      </div>
    `;
  }

  renderButtonProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">ボタン設定</div>
        
        <div class="property-group">
          <label class="property-label">ボタンラベル</label>
          <input type="text" class="property-input" data-property="props.label" value="${part.props.label || ''}" placeholder="ボタンテキスト">
        </div>
        
        <div class="property-group">
          <label class="property-label">ボタンスタイル</label>
          <select class="property-input" data-property="props.style">
            <option value="primary" ${part.props.style === 'primary' ? 'selected' : ''}>プライマリ</option>
            <option value="secondary" ${part.props.style === 'secondary' ? 'selected' : ''}>セカンダリ</option>
            <option value="link" ${part.props.style === 'link' ? 'selected' : ''}>リンク</option>
          </select>
        </div>
        
        <div class="property-group">
          <label class="property-label">アクションタイプ</label>
          <select class="property-input" data-property="props.action.type">
            <option value="postback" ${part.props.action?.type === 'postback' ? 'selected' : ''}>ポストバック</option>
            <option value="uri" ${part.props.action?.type === 'uri' ? 'selected' : ''}>URL</option>
            <option value="message" ${part.props.action?.type === 'message' ? 'selected' : ''}>メッセージ</option>
          </select>
        </div>
        
        ${this.renderActionProperties(part.props.action)}
      </div>
    `;
  }

  renderActionProperties(action) {
    if (!action) return '';
    
    switch (action.type) {
      case 'postback':
        return `
          <div class="property-group">
            <label class="property-label">ポストバックデータ</label>
            <input type="text" class="property-input" data-property="props.action.data" value="${action.data || ''}" placeholder="action:value">
          </div>
          <div class="property-group">
            <label class="property-label">表示テキスト（任意）</label>
            <input type="text" class="property-input" data-property="props.action.displayText" value="${action.displayText || ''}" placeholder="送信されたメッセージ">
          </div>
        `;
      case 'uri':
        return `
          <div class="property-group">
            <label class="property-label">URL</label>
            <input type="url" class="property-input" data-property="props.action.uri" value="${action.uri || ''}" placeholder="https://example.com">
          </div>
        `;
      case 'message':
        return `
          <div class="property-group">
            <label class="property-label">メッセージテキスト</label>
            <input type="text" class="property-input" data-property="props.action.text" value="${action.text || ''}" placeholder="送信するメッセージ">
          </div>
        `;
      default:
        return '';
    }
  }

  renderImageProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">画像設定</div>
        
        <div class="property-group">
          <label class="property-label">画像URL</label>
          <input type="url" class="property-input" data-property="props.url" value="${part.props.url || ''}" placeholder="https://example.com/image.jpg">
        </div>
        
        <div class="property-group">
          <label class="property-label">アスペクト比</label>
          <select class="property-input" data-property="props.aspectRatio">
            <option value="1:1" ${part.props.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (正方形)</option>
            <option value="3:2" ${part.props.aspectRatio === '3:2' ? 'selected' : ''}>3:2</option>
            <option value="16:9" ${part.props.aspectRatio === '16:9' ? 'selected' : ''}>16:9</option>
            <option value="4:3" ${part.props.aspectRatio === '4:3' ? 'selected' : ''}>4:3</option>
          </select>
        </div>
        
        <div class="property-group">
          <label class="property-label">表示モード</label>
          <select class="property-input" data-property="props.aspectMode">
            <option value="cover" ${part.props.aspectMode === 'cover' ? 'selected' : ''}>カバー（切り抜き）</option>
            <option value="fit" ${part.props.aspectMode === 'fit' ? 'selected' : ''}>フィット（全体表示）</option>
          </select>
        </div>
        
        <div class="property-group">
          <label class="property-label">背景色</label>
          <input type="color" class="property-input" data-property="props.backgroundColor" value="${part.props.backgroundColor || '#ffffff'}">
        </div>
      </div>
    `;
  }

  renderTagProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">タグ設定</div>
        
        <div class="property-group">
          <label class="property-label">ラベル</label>
          <input type="text" class="property-input" data-property="props.label" value="${part.props.label || ''}" placeholder="タグテキスト">
        </div>
        
        <div class="property-group">
          <label class="property-label">色</label>
          <input type="color" class="property-input" data-property="props.color" value="${part.props.color || '#06b6d4'}">
        </div>
        
        <div class="property-group">
          <label class="property-label">サイズ</label>
          <select class="property-input" data-property="props.size">
            <option value="xs" ${part.props.size === 'xs' ? 'selected' : ''}>極小</option>
            <option value="sm" ${part.props.size === 'sm' ? 'selected' : ''}>小</option>
            <option value="md" ${part.props.size === 'md' ? 'selected' : ''}>中</option>
          </select>
        </div>
      </div>
    `;
  }

  renderReplyButtonProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">返信ボタン設定</div>
        
        <div class="property-group">
          <label class="property-label">ボタンラベル</label>
          <input type="text" class="property-input" data-property="props.label" value="${part.props.label || ''}" placeholder="返信する">
        </div>
        
        <div class="property-group">
          <label class="property-label">データテンプレート</label>
          <input type="text" class="property-input" data-property="props.dataTemplate" value="${part.props.dataTemplate || ''}" placeholder="reply:{{MESSAGE_ID}}">
          <small class="property-help">{{MESSAGE_ID}}、{{STATEMENT_ID}}などの変数が使用できます</small>
        </div>
      </div>
    `;
  }

  renderSeparatorProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">区切り線設定</div>
        
        <div class="property-group">
          <label class="property-label">色</label>
          <input type="color" class="property-input" data-property="props.color" value="${part.props.color || '#e5e7eb'}">
        </div>
      </div>
    `;
  }

  renderSpacerProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">スペーサー設定</div>
        
        <div class="property-group">
          <label class="property-label">サイズ</label>
          <select class="property-input" data-property="props.size">
            <option value="xs" ${part.props.size === 'xs' ? 'selected' : ''}>極小</option>
            <option value="sm" ${part.props.size === 'sm' ? 'selected' : ''}>小</option>
            <option value="md" ${part.props.size === 'md' ? 'selected' : ''}>中</option>
            <option value="lg" ${part.props.size === 'lg' ? 'selected' : ''}>大</option>
            <option value="xl" ${part.props.size === 'xl' ? 'selected' : ''}>特大</option>
          </select>
        </div>
      </div>
    `;
  }

  renderStyleProperties(part) {
    return `
      <div class="property-section">
        <div class="section-title">スタイル設定</div>
        
        <div class="property-group">
          <label class="property-label">配置</label>
          <select class="property-input" data-property="style.align">
            <option value="start" ${part.style.align === 'start' ? 'selected' : ''}>左寄せ</option>
            <option value="center" ${part.style.align === 'center' ? 'selected' : ''}>中央</option>
            <option value="end" ${part.style.align === 'end' ? 'selected' : ''}>右寄せ</option>
          </select>
        </div>
        
        <div class="property-row">
          <div class="property-group">
            <label class="property-label">マージン</label>
            <select class="property-input" data-property="style.margin">
              <option value="none" ${part.style.margin === 'none' ? 'selected' : ''}>なし</option>
              <option value="xs" ${part.style.margin === 'xs' ? 'selected' : ''}>極小</option>
              <option value="sm" ${part.style.margin === 'sm' ? 'selected' : ''}>小</option>
              <option value="md" ${part.style.margin === 'md' ? 'selected' : ''}>中</option>
              <option value="lg" ${part.style.margin === 'lg' ? 'selected' : ''}>大</option>
            </select>
          </div>
          
          <div class="property-group">
            <label class="property-label">パディング</label>
            <select class="property-input" data-property="style.padding">
              <option value="none" ${part.style.padding === 'none' ? 'selected' : ''}>なし</option>
              <option value="xs" ${part.style.padding === 'xs' ? 'selected' : ''}>極小</option>
              <option value="sm" ${part.style.padding === 'sm' ? 'selected' : ''}>小</option>
              <option value="md" ${part.style.padding === 'md' ? 'selected' : ''}>中</option>
              <option value="lg" ${part.style.padding === 'lg' ? 'selected' : ''}>大</option>
            </select>
          </div>
        </div>
        
        <div class="property-group">
          <label class="property-label">背景色</label>
          <input type="color" class="property-input" data-property="style.backgroundColor" value="${part.style.backgroundColor || '#ffffff'}">
        </div>
        
        <div class="property-group">
          <label class="property-label">テキスト色</label>
          <input type="color" class="property-input" data-property="style.color" value="${part.style.color || '#111827'}">
        </div>
      </div>
    `;
  }

  setupPropertyEventListeners() {
    const container = document.getElementById('properties-panel');
    
    // Handle all property inputs
    container.querySelectorAll('.property-input').forEach(input => {
      const eventType = input.type === 'checkbox' ? 'change' : 'input';
      
      input.addEventListener(eventType, (e) => {
        this.handlePropertyChange(e.target);
      });
    });

    // Handle item property inputs
    container.querySelectorAll('[data-item-property]').forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleItemPropertyChange(e.target);
      });
    });
  }

  handlePropertyChange(input) {
    if (!this.currentPart) return;

    const property = input.dataset.property;
    const value = input.type === 'checkbox' ? input.checked : input.value;

    if (!property) return;

    // Parse nested property path (e.g., "props.name" or "style.color")
    const updates = this.parsePropertyPath(property, value);
    
    stateManager.updatePart(this.currentPart.id, updates);
  }

  handleItemPropertyChange(input) {
    if (!this.currentPart) return;

    const itemIndex = parseInt(input.closest('.item-editor').dataset.itemIndex);
    const itemProperty = input.dataset.itemProperty;
    const value = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;

    const items = [...(this.currentPart.props.items || [])];
    if (items[itemIndex]) {
      items[itemIndex][itemProperty] = value;
      
      stateManager.updatePart(this.currentPart.id, {
        props: { items }
      });
    }
  }

  parsePropertyPath(path, value) {
    const parts = path.split('.');
    const updates = {};
    
    let current = updates;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] || {};
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    return updates;
  }

  // Item management methods
  addItem() {
    if (!this.currentPart || this.currentPart.type !== 'items') return;

    const items = [...(this.currentPart.props.items || [])];
    items.push({
      name: '',
      amount: 0,
      note: ''
    });

    stateManager.updatePart(this.currentPart.id, {
      props: { items }
    });

    // Re-render properties to show new item
    this.showPartProperties(this.currentPart);
  }

  removeItem(index) {
    if (!this.currentPart || this.currentPart.type !== 'items') return;

    const items = [...(this.currentPart.props.items || [])];
    items.splice(index, 1);

    stateManager.updatePart(this.currentPart.id, {
      props: { items }
    });

    // Re-render properties
    this.showPartProperties(this.currentPart);
  }
}

// Create global instance for onclick handlers
const propertiesPanel = new PropertiesPanel();
window.propertiesPanel = propertiesPanel;

export { PropertiesPanel };


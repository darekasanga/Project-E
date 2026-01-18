/**
 * FlexBuilder - Main application controller
 */
import { stateManager } from '../core/StateManager.js';
import { componentRegistry } from '../core/ComponentRegistry.js';
import { FlexJsonConverter } from '../converters/FlexJsonConverter.js';
import { HtmlRenderer } from '../renderers/HtmlRenderer.js';
import { templateStorage } from '../storage/TemplateStorage.js';
import { DefaultTemplates } from '../templates/DefaultTemplates.js';
import { ComponentPalette } from './ComponentPalette.js';
import { PropertiesPanel } from './PropertiesPanel.js';

class FlexBuilder {
  constructor() {
    this.converter = new FlexJsonConverter();
    this.renderer = new HtmlRenderer();
    this.componentPalette = new ComponentPalette();
    this.propertiesPanel = new PropertiesPanel();
    
    this.currentDevice = 'mobile';
    this.currentTab = 'properties';
    
    this.init();
  }

  async init() {
    try {
      this.setupEventListeners();
      this.setupStateListeners();
      this.setupDragAndDrop();
      
      // Initialize UI components
      await this.componentPalette.init();
      await this.propertiesPanel.init();
      
      // Load default template or create new one
      await this.loadDefaultTemplate();
      
      this.updateUI();
      this.updateStatus('準備完了');
      
      console.log('Flex Builder initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Flex Builder:', error);
      this.updateStatus('初期化エラー', 'error');
    }
  }

  setupEventListeners() {
    // Header actions
    document.getElementById('save-btn').addEventListener('click', () => this.saveTemplate());
    document.getElementById('undo-btn').addEventListener('click', () => this.undo());
    document.getElementById('redo-btn').addEventListener('click', () => this.redo());
    document.getElementById('preview-json-btn').addEventListener('click', () => this.showJsonPreview());
    
    // Template management
    document.getElementById('new-template-btn').addEventListener('click', () => this.newTemplate());
    document.getElementById('load-template-btn').addEventListener('click', () => this.showTemplateList());
    document.getElementById('duplicate-btn').addEventListener('click', () => this.duplicateTemplate());
    document.getElementById('export-btn').addEventListener('click', () => this.exportTemplate());
    document.getElementById('import-btn').addEventListener('click', () => this.importTemplate());
    document.getElementById('test-send-btn').addEventListener('click', () => this.testSend());
    
    // Template info
    document.getElementById('template-name').addEventListener('input', (e) => {
      this.updateTemplateMetadata({ name: e.target.value });
    });
    document.getElementById('template-category').addEventListener('change', (e) => {
      this.updateTemplateMetadata({ category: e.target.value });
    });
    
    // Canvas
    document.getElementById('bubble-size').addEventListener('change', (e) => {
      this.updateBubbleSize(e.target.value);
    });
    
    // Placement tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchPlacement(e.target.dataset.placement);
      });
    });
    
    // Panel tabs
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // Preview controls
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchDevice(e.target.dataset.device);
      });
    });
    document.getElementById('refresh-preview').addEventListener('click', () => this.updatePreview());
    
    // Theme controls
    document.getElementById('primary-color').addEventListener('input', (e) => {
      this.updateTheme({ primaryColor: e.target.value });
    });
    document.getElementById('secondary-color').addEventListener('input', (e) => {
      this.updateTheme({ secondaryColor: e.target.value });
    });
    document.getElementById('text-color').addEventListener('input', (e) => {
      this.updateTheme({ textColor: e.target.value });
    });
    document.getElementById('bg-color').addEventListener('input', (e) => {
      this.updateTheme({ bgColor: e.target.value });
    });
    
    // Dropdown menus
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = e.target.closest('.dropdown');
        dropdown.classList.toggle('active');
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    });
    
    // Modal controls
    this.setupModalControls();
  }

  setupStateListeners() {
    stateManager.on('template-changed', (template) => {
      this.onTemplateChanged(template);
    });
    
    stateManager.on('part-selected', (part) => {
      this.onPartSelected(part);
    });
    
    stateManager.on('part-added', (data) => {
      this.onPartAdded(data);
    });
    
    stateManager.on('part-removed', (data) => {
      this.onPartRemoved(data);
    });
    
    stateManager.on('part-updated', (data) => {
      this.onPartUpdated(data);
    });
    
    stateManager.on('placement-changed', (placement) => {
      this.onPlacementChanged(placement);
    });
    
    stateManager.on('dirty-state-changed', (isDirty) => {
      this.onDirtyStateChanged(isDirty);
    });
    
    stateManager.on('history-changed', (data) => {
      this.onHistoryChanged(data);
    });
  }

  setupDragAndDrop() {
    // Setup drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      
      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });
      
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        
        const componentType = e.dataTransfer.getData('text/plain');
        const placement = zone.dataset.placement;
        
        if (componentType && placement) {
          this.addComponent(placement, componentType);
        }
      });
    });
  }

  setupModalControls() {
    // Generic modal controls
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        this.closeModal(modal);
      });
    });
    
    // Template list modal
    document.getElementById('load-default-templates').addEventListener('click', () => {
      this.loadDefaultTemplates();
    });
    
    // JSON modal
    document.getElementById('copy-json').addEventListener('click', () => this.copyJson());
    document.getElementById('download-json').addEventListener('click', () => this.downloadJson());
    document.getElementById('validate-json').addEventListener('click', () => this.validateJson());
    
    // Import file input
    document.getElementById('import-file-input').addEventListener('change', (e) => {
      this.handleFileImport(e.target.files[0]);
    });
  }

  // Template management
  async loadDefaultTemplate() {
    try {
      const template = DefaultTemplates.createStatementTemplate();
      stateManager.setCurrentTemplate(template);
    } catch (error) {
      console.error('Failed to load default template:', error);
      this.updateStatus('デフォルトテンプレートの読み込みに失敗しました', 'error');
    }
  }

  async newTemplate() {
    try {
      const category = document.getElementById('template-category').value;
      const template = DefaultTemplates.createCustomTemplate(category);
      stateManager.setCurrentTemplate(template);
      this.updateStatus('新しいテンプレートを作成しました');
    } catch (error) {
      console.error('Failed to create new template:', error);
      this.updateStatus('新しいテンプレートの作成に失敗しました', 'error');
    }
  }

  async saveTemplate() {
    try {
      const template = stateManager.getCurrentTemplate();
      if (!template) {
        this.updateStatus('保存するテンプレートがありません', 'error');
        return;
      }
      
      const result = await templateStorage.save(template);
      if (result.success) {
        stateManager.setDirty(false);
        this.updateStatus('テンプレートを保存しました');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      this.updateStatus('テンプレートの保存に失敗しました', 'error');
    }
  }

  async duplicateTemplate() {
    try {
      const template = stateManager.getCurrentTemplate();
      if (!template) {
        this.updateStatus('複製するテンプレートがありません', 'error');
        return;
      }
      
      const duplicated = template.clone();
      stateManager.setCurrentTemplate(duplicated);
      this.updateStatus('テンプレートを複製しました');
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      this.updateStatus('テンプレートの複製に失敗しました', 'error');
    }
  }

  async exportTemplate() {
    try {
      const template = stateManager.getCurrentTemplate();
      if (!template) {
        this.updateStatus('エクスポートするテンプレートがありません', 'error');
        return;
      }
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        template: template.toJSON()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.updateStatus('テンプレートをエクスポートしました');
    } catch (error) {
      console.error('Failed to export template:', error);
      this.updateStatus('テンプレートのエクスポートに失敗しました', 'error');
    }
  }

  importTemplate() {
    document.getElementById('import-file-input').click();
  }

  async handleFileImport(file) {
    if (!file) return;
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.template) {
        throw new Error('無効なテンプレートファイルです');
      }
      
      const result = await templateStorage.import(importData);
      if (result.success) {
        stateManager.setCurrentTemplate(result.template);
        this.updateStatus('テンプレートをインポートしました');
      }
    } catch (error) {
      console.error('Failed to import template:', error);
      this.updateStatus('テンプレートのインポートに失敗しました', 'error');
    }
  }

  // Component management
  addComponent(placement, componentType) {
    try {
      const part = stateManager.addPart(placement, componentType);
      if (part) {
        stateManager.selectPart(part);
        this.updateStatus(`${componentType}コンポーネントを追加しました`);
      }
    } catch (error) {
      console.error('Failed to add component:', error);
      this.updateStatus('コンポーネントの追加に失敗しました', 'error');
    }
  }

  removeComponent(partId) {
    try {
      const template = stateManager.getCurrentTemplate();
      if (!template) return;
      
      // Find which placement the part belongs to
      let placement = null;
      ['header', 'body', 'footer'].forEach(p => {
        if (template.layout[p].find(part => part.id === partId)) {
          placement = p;
        }
      });
      
      if (placement) {
        stateManager.removePart(placement, partId);
        this.updateStatus('コンポーネントを削除しました');
      }
    } catch (error) {
      console.error('Failed to remove component:', error);
      this.updateStatus('コンポーネントの削除に失敗しました', 'error');
    }
  }

  // UI updates
  updateUI() {
    this.updateTemplateInfo();
    this.updateCanvas();
    this.updatePreview();
    this.updateComponentCount();
    this.updateValidationStatus();
  }

  updateTemplateInfo() {
    const template = stateManager.getCurrentTemplate();
    if (template) {
      document.getElementById('template-name').value = template.name;
      document.getElementById('template-category').value = template.category;
      document.getElementById('bubble-size').value = template.layout.bubbleSize;
      
      // Update theme colors
      const theme = template.layout.theme;
      document.getElementById('primary-color').value = theme.primaryColor;
      document.getElementById('secondary-color').value = theme.secondaryColor;
      document.getElementById('text-color').value = theme.textColor;
      document.getElementById('bg-color').value = theme.bgColor;
    }
  }

  updateCanvas() {
    const template = stateManager.getCurrentTemplate();
    const selectedPlacement = stateManager.getSelectedPlacement();
    
    // Update placement tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.placement === selectedPlacement);
    });
    
    // Update placement containers
    document.querySelectorAll('.placement-container').forEach(container => {
      container.classList.toggle('active', container.dataset.placement === selectedPlacement);
    });
    
    if (template) {
      this.renderCanvasParts(selectedPlacement, template.layout[selectedPlacement]);
    }
  }

  renderCanvasParts(placement, parts) {
    const container = document.querySelector(`[data-placement="${placement}"] .drop-zone`);
    if (!container) return;
    
    if (parts.length === 0) {
      container.innerHTML = '<div class="empty-message">コンポーネントをドラッグしてください</div>';
      return;
    }
    
    const sortedParts = [...parts].sort((a, b) => a.order - b.order);
    const selectedPart = stateManager.getSelectedPart();
    
    container.innerHTML = sortedParts.map(part => {
      const component = componentRegistry.getComponent(part.type);
      const isSelected = selectedPart && selectedPart.id === part.id;
      
      return `
        <div class="part-item ${isSelected ? 'selected' : ''}" data-part-id="${part.id}">
          <div class="part-info">
            <div class="part-icon">${component?.icon || '📄'}</div>
            <div class="part-details">
              <div class="part-name">${component?.name || part.type}</div>
              <div class="part-summary">${this.getPartSummary(part)}</div>
            </div>
          </div>
          <div class="part-actions">
            <button class="part-action-btn" onclick="flexBuilder.movePartUp('${part.id}')" title="上に移動">↑</button>
            <button class="part-action-btn" onclick="flexBuilder.movePartDown('${part.id}')" title="下に移動">↓</button>
            <button class="part-action-btn" onclick="flexBuilder.removeComponent('${part.id}')" title="削除">×</button>
          </div>
        </div>
      `;
    }).join('');
    
    // Add click listeners to part items
    container.querySelectorAll('.part-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('part-action-btn')) {
          const partId = item.dataset.partId;
          const part = this.findPartById(partId);
          if (part) {
            stateManager.selectPart(part);
          }
        }
      });
    });
  }

  getPartSummary(part) {
    switch (part.type) {
      case 'title':
        return part.props.text || 'タイトル';
      case 'comment':
        return (part.props.text || 'コメント').substring(0, 30) + '...';
      case 'teacher':
        return part.props.name || '先生名';
      case 'button':
        return part.props.label || 'ボタン';
      case 'items':
        return `${part.props.items?.length || 0}件の明細`;
      default:
        return component?.description || '';
    }
  }

  findPartById(partId) {
    const template = stateManager.getCurrentTemplate();
    if (!template) return null;
    
    const allParts = [
      ...template.layout.header,
      ...template.layout.body,
      ...template.layout.footer
    ];
    
    return allParts.find(part => part.id === partId);
  }

  updatePreview() {
    const template = stateManager.getCurrentTemplate();
    const container = document.getElementById('preview-container');
    
    if (!template) {
      container.innerHTML = '<div class="preview-placeholder">テンプレートがありません</div>';
      return;
    }
    
    try {
      const html = this.renderer.render(template, {
        device: this.currentDevice,
        showDebugInfo: false
      });
      
      container.innerHTML = html;
    } catch (error) {
      console.error('Failed to render preview:', error);
      container.innerHTML = '<div class="flex-error">プレビューの生成に失敗しました</div>';
    }
  }

  updateComponentCount() {
    const template = stateManager.getCurrentTemplate();
    const count = template ? 
      template.layout.header.length + template.layout.body.length + template.layout.footer.length : 0;
    
    document.getElementById('component-count').textContent = `コンポーネント: ${count}`;
  }

  updateValidationStatus() {
    const template = stateManager.getCurrentTemplate();
    const statusElement = document.getElementById('validation-status');
    
    if (!template) {
      statusElement.textContent = '⚠ テンプレートなし';
      statusElement.className = 'warning';
      return;
    }
    
    const validation = stateManager.validateCurrentTemplate();
    if (validation.valid) {
      statusElement.textContent = '✓ 有効';
      statusElement.className = 'valid';
    } else {
      statusElement.textContent = `⚠ エラー ${validation.errors.length}件`;
      statusElement.className = 'invalid';
      statusElement.title = validation.errors.join('\n');
    }
  }

  // Event handlers
  onTemplateChanged(template) {
    this.updateUI();
  }

  onPartSelected(part) {
    this.updateCanvas();
    this.propertiesPanel.showPartProperties(part);
  }

  onPartAdded(data) {
    this.updateCanvas();
    this.updatePreview();
    this.updateComponentCount();
    this.updateValidationStatus();
  }

  onPartRemoved(data) {
    this.updateCanvas();
    this.updatePreview();
    this.updateComponentCount();
    this.updateValidationStatus();
  }

  onPartUpdated(data) {
    this.updateCanvas();
    this.updatePreview();
    this.updateValidationStatus();
  }

  onPlacementChanged(placement) {
    this.updateCanvas();
  }

  onDirtyStateChanged(isDirty) {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.textContent = isDirty ? '保存*' : '保存';
    saveBtn.classList.toggle('dirty', isDirty);
  }

  onHistoryChanged(data) {
    document.getElementById('undo-btn').disabled = !data.canUndo;
    document.getElementById('redo-btn').disabled = !data.canRedo;
  }

  // Actions
  undo() {
    stateManager.undo();
  }

  redo() {
    stateManager.redo();
  }

  switchPlacement(placement) {
    stateManager.setSelectedPlacement(placement);
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.panel-tab').forEach(tabBtn => {
      tabBtn.classList.toggle('active', tabBtn.dataset.tab === tab);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tab}-tab`);
    });
    
    if (tab === 'preview') {
      this.updatePreview();
    }
  }

  switchDevice(device) {
    this.currentDevice = device;
    
    // Update device buttons
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === device);
    });
    
    this.updatePreview();
  }

  updateTemplateMetadata(updates) {
    stateManager.updateTemplateMetadata(updates);
  }

  updateBubbleSize(size) {
    const template = stateManager.getCurrentTemplate();
    if (template) {
      template.layout.bubbleSize = size;
      stateManager.setDirty(true);
      this.updatePreview();
    }
  }

  updateTheme(themeUpdates) {
    stateManager.updateTemplateTheme(themeUpdates);
    this.updatePreview();
  }

  movePartUp(partId) {
    // Implementation for moving parts up/down
    console.log('Move part up:', partId);
  }

  movePartDown(partId) {
    // Implementation for moving parts up/down
    console.log('Move part down:', partId);
  }

  // JSON operations
  showJsonPreview() {
    const template = stateManager.getCurrentTemplate();
    if (!template) {
      this.updateStatus('JSONを生成するテンプレートがありません', 'error');
      return;
    }
    
    const result = this.converter.convert(template);
    const jsonDisplay = document.getElementById('json-display');
    
    if (result.success) {
      jsonDisplay.textContent = JSON.stringify(result.data, null, 2);
    } else {
      jsonDisplay.textContent = `// エラー:\n// ${result.errors.join('\n// ')}`;
    }
    
    this.showModal('json-modal');
  }

  copyJson() {
    const jsonText = document.getElementById('json-display').textContent;
    navigator.clipboard.writeText(jsonText).then(() => {
      this.updateStatus('JSONをコピーしました');
    }).catch(() => {
      this.updateStatus('JSONのコピーに失敗しました', 'error');
    });
  }

  downloadJson() {
    const template = stateManager.getCurrentTemplate();
    if (!template) return;
    
    const result = this.converter.convert(template);
    if (result.success) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}_flex.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.updateStatus('JSONをダウンロードしました');
    }
  }

  validateJson() {
    const template = stateManager.getCurrentTemplate();
    if (!template) return;
    
    const validation = stateManager.validateCurrentTemplate();
    const result = this.converter.convert(template);
    
    let message = '';
    if (validation.valid && result.success) {
      message = '✓ JSONは有効です';
    } else {
      const errors = [...validation.errors, ...result.errors];
      message = `⚠ エラーが見つかりました:\n${errors.join('\n')}`;
    }
    
    alert(message);
  }

  // Test send
  async testSend() {
    const template = stateManager.getCurrentTemplate();
    if (!template) {
      this.updateStatus('送信するテンプレートがありません', 'error');
      return;
    }
    
    const result = this.converter.convert(template);
    if (!result.success) {
      this.updateStatus('JSONの生成に失敗しました', 'error');
      return;
    }
    
    // Simulate test send
    this.updateStatus('テスト送信機能は未実装です', 'warning');
  }

  // Modal operations
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showTemplateList() {
    // Implementation for template list modal
    this.showModal('template-list-modal');
  }

  async loadDefaultTemplates() {
    try {
      const templates = DefaultTemplates.getAllDefaultTemplates();
      
      for (const template of templates) {
        await templateStorage.save(template);
      }
      
      this.updateStatus('デフォルトテンプレートを読み込みました');
      this.closeModal(document.getElementById('template-list-modal'));
    } catch (error) {
      console.error('Failed to load default templates:', error);
      this.updateStatus('デフォルトテンプレートの読み込みに失敗しました', 'error');
    }
  }

  // Utility methods
  updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = type;
    
    // Auto-clear status after 3 seconds
    setTimeout(() => {
      if (statusElement.textContent === message) {
        statusElement.textContent = '準備完了';
        statusElement.className = '';
      }
    }, 3000);
  }
}

// Initialize the application
const flexBuilder = new FlexBuilder();

// Make it globally available for onclick handlers
window.flexBuilder = flexBuilder;

export default flexBuilder;


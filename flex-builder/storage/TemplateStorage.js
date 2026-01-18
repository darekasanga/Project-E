/**
 * TemplateStorage - Handles template persistence with localStorage and API abstraction
 */
import { FlexTemplate } from '../models/FlexTemplate.js';

export class TemplateStorage {
  constructor() {
    this.storageKey = 'flex_builder_templates';
    this.apiEndpoint = '/api/flex-templates';
    this.useLocalStorage = true; // Switch to false when API is ready
  }

  /**
   * Save template
   */
  async save(template) {
    try {
      if (this.useLocalStorage) {
        return this.saveToLocalStorage(template);
      } else {
        return this.saveToAPI(template);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      throw new Error('テンプレートの保存に失敗しました');
    }
  }

  /**
   * Load template by ID
   */
  async load(templateId) {
    try {
      if (this.useLocalStorage) {
        return this.loadFromLocalStorage(templateId);
      } else {
        return this.loadFromAPI(templateId);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      throw new Error('テンプレートの読み込みに失敗しました');
    }
  }

  /**
   * Load all templates
   */
  async loadAll() {
    try {
      if (this.useLocalStorage) {
        return this.loadAllFromLocalStorage();
      } else {
        return this.loadAllFromAPI();
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      throw new Error('テンプレート一覧の読み込みに失敗しました');
    }
  }

  /**
   * Delete template
   */
  async delete(templateId) {
    try {
      if (this.useLocalStorage) {
        return this.deleteFromLocalStorage(templateId);
      } else {
        return this.deleteFromAPI(templateId);
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw new Error('テンプレートの削除に失敗しました');
    }
  }

  /**
   * Search templates
   */
  async search(query, category = null) {
    try {
      const templates = await this.loadAll();
      
      return templates.filter(template => {
        const matchesQuery = !query || 
          template.name.toLowerCase().includes(query.toLowerCase()) ||
          template.altText.toLowerCase().includes(query.toLowerCase());
        
        const matchesCategory = !category || template.category === category;
        
        return matchesQuery && matchesCategory;
      });
    } catch (error) {
      console.error('Failed to search templates:', error);
      throw new Error('テンプレートの検索に失敗しました');
    }
  }

  // LocalStorage implementation
  saveToLocalStorage(template) {
    const templates = this.getTemplatesFromLocalStorage();
    
    // Update existing or add new
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex !== -1) {
      templates[existingIndex] = template.toJSON();
    } else {
      templates.push(template.toJSON());
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
    
    return {
      success: true,
      template: template
    };
  }

  loadFromLocalStorage(templateId) {
    const templates = this.getTemplatesFromLocalStorage();
    const templateData = templates.find(t => t.id === templateId);
    
    if (!templateData) {
      throw new Error('テンプレートが見つかりません');
    }
    
    return {
      success: true,
      template: FlexTemplate.fromJSON(templateData)
    };
  }

  loadAllFromLocalStorage() {
    const templates = this.getTemplatesFromLocalStorage();
    
    return {
      success: true,
      templates: templates.map(data => FlexTemplate.fromJSON(data))
    };
  }

  deleteFromLocalStorage(templateId) {
    const templates = this.getTemplatesFromLocalStorage();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    
    if (templates.length === filteredTemplates.length) {
      throw new Error('テンプレートが見つかりません');
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredTemplates));
    
    return {
      success: true,
      deletedId: templateId
    };
  }

  getTemplatesFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse templates from localStorage:', error);
      return [];
    }
  }

  // API implementation (for future use)
  async saveToAPI(template) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template.toJSON())
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      template: FlexTemplate.fromJSON(result.template)
    };
  }

  async loadFromAPI(templateId) {
    const response = await fetch(`${this.apiEndpoint}/${templateId}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      template: FlexTemplate.fromJSON(result.template)
    };
  }

  async loadAllFromAPI() {
    const response = await fetch(this.apiEndpoint);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      templates: result.templates.map(data => FlexTemplate.fromJSON(data))
    };
  }

  async deleteFromAPI(templateId) {
    const response = await fetch(`${this.apiEndpoint}/${templateId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return {
      success: true,
      deletedId: templateId
    };
  }

  // Utility methods
  async export(templateId) {
    try {
      const result = await this.load(templateId);
      const template = result.template;
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        template: template.toJSON()
      };
      
      return {
        success: true,
        data: exportData,
        filename: `${template.name}_${Date.now()}.json`
      };
    } catch (error) {
      console.error('Failed to export template:', error);
      throw new Error('テンプレートのエクスポートに失敗しました');
    }
  }

  async import(importData) {
    try {
      if (!importData.template) {
        throw new Error('無効なインポートデータです');
      }
      
      const template = FlexTemplate.fromJSON(importData.template);
      
      // Generate new ID to avoid conflicts
      template.id = template.generateId();
      template.name = template.name + ' (インポート)';
      template.createdAt = new Date().toISOString();
      template.updatedAt = new Date().toISOString();
      
      const result = await this.save(template);
      
      return {
        success: true,
        template: result.template
      };
    } catch (error) {
      console.error('Failed to import template:', error);
      throw new Error('テンプレートのインポートに失敗しました');
    }
  }

  async duplicate(templateId) {
    try {
      const result = await this.load(templateId);
      const originalTemplate = result.template;
      
      const duplicatedTemplate = originalTemplate.clone();
      
      const saveResult = await this.save(duplicatedTemplate);
      
      return {
        success: true,
        template: saveResult.template
      };
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      throw new Error('テンプレートの複製に失敗しました');
    }
  }

  // Storage management
  clearAll() {
    if (this.useLocalStorage) {
      localStorage.removeItem(this.storageKey);
      return { success: true };
    } else {
      throw new Error('API storage clear not implemented');
    }
  }

  getStorageInfo() {
    if (this.useLocalStorage) {
      const templates = this.getTemplatesFromLocalStorage();
      const dataSize = JSON.stringify(templates).length;
      
      return {
        type: 'localStorage',
        templateCount: templates.length,
        dataSize: dataSize,
        maxSize: 5 * 1024 * 1024, // 5MB typical localStorage limit
        usagePercent: (dataSize / (5 * 1024 * 1024)) * 100
      };
    } else {
      return {
        type: 'API',
        endpoint: this.apiEndpoint
      };
    }
  }

  // Migration helper
  async migrateToAPI() {
    if (!this.useLocalStorage) {
      throw new Error('Already using API storage');
    }
    
    try {
      const localTemplates = this.getTemplatesFromLocalStorage();
      const migratedTemplates = [];
      
      // Temporarily switch to API mode
      this.useLocalStorage = false;
      
      for (const templateData of localTemplates) {
        const template = FlexTemplate.fromJSON(templateData);
        const result = await this.saveToAPI(template);
        migratedTemplates.push(result.template);
      }
      
      return {
        success: true,
        migratedCount: migratedTemplates.length,
        templates: migratedTemplates
      };
    } catch (error) {
      // Revert to localStorage on error
      this.useLocalStorage = true;
      console.error('Migration failed:', error);
      throw new Error('API移行に失敗しました');
    }
  }
}

// Singleton instance
export const templateStorage = new TemplateStorage();


/**
 * ComponentPalette - Manages the component palette UI
 */
import { componentRegistry } from '../core/ComponentRegistry.js';

export class ComponentPalette {
  constructor() {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  async init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('component-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.render();
      });
    }
  }

  render() {
    const container = document.getElementById('component-palette');
    if (!container) return;

    const categories = componentRegistry.getCategories();
    const filteredCategories = this.filterCategories(categories);

    container.innerHTML = filteredCategories.map(category => {
      const components = componentRegistry.getComponentsByCategory(category.name.toLowerCase());
      const filteredComponents = this.filterComponents(components);

      if (filteredComponents.length === 0) return '';

      return `
        <div class="component-category">
          <div class="category-title">${category.name}</div>
          <div class="component-grid">
            ${filteredComponents.map(component => this.renderComponent(component)).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Setup drag and drop for components
    this.setupDragAndDrop();
  }

  filterCategories(categories) {
    if (!this.searchTerm) return categories;

    return categories.filter(category => {
      const components = componentRegistry.getComponentsByCategory(category.name.toLowerCase());
      return this.filterComponents(components).length > 0;
    });
  }

  filterComponents(components) {
    if (!this.searchTerm) return components;

    return components.filter(component => {
      return component.name.toLowerCase().includes(this.searchTerm) ||
             component.description.toLowerCase().includes(this.searchTerm) ||
             component.type.toLowerCase().includes(this.searchTerm);
    });
  }

  renderComponent(component) {
    return `
      <div class="component-item" 
           draggable="true" 
           data-component-type="${component.type}"
           title="${component.description}">
        <div class="component-icon">${component.icon}</div>
        <div class="component-name">${component.name}</div>
        <div class="component-description">${component.description}</div>
      </div>
    `;
  }

  setupDragAndDrop() {
    const componentItems = document.querySelectorAll('.component-item');
    
    componentItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const componentType = item.dataset.componentType;
        e.dataTransfer.setData('text/plain', componentType);
        e.dataTransfer.effectAllowed = 'copy';
        
        // Add visual feedback
        item.classList.add('dragging');
        
        // Create drag image
        const dragImage = item.cloneNode(true);
        dragImage.style.transform = 'rotate(5deg)';
        dragImage.style.opacity = '0.8';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 50, 25);
        
        // Remove drag image after a short delay
        setTimeout(() => {
          if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
          }
        }, 0);
      });
      
      item.addEventListener('dragend', (e) => {
        item.classList.remove('dragging');
      });
      
      // Double-click to add to current placement
      item.addEventListener('dblclick', (e) => {
        const componentType = item.dataset.componentType;
        const currentPlacement = document.querySelector('.tab-btn.active')?.dataset.placement || 'body';
        
        // Dispatch custom event to add component
        const event = new CustomEvent('add-component', {
          detail: { componentType, placement: currentPlacement }
        });
        document.dispatchEvent(event);
      });
    });
  }

  // Public methods for external control
  setSearchTerm(term) {
    this.searchTerm = term.toLowerCase();
    this.render();
  }

  setSelectedCategory(category) {
    this.selectedCategory = category;
    this.render();
  }

  clearSearch() {
    this.searchTerm = '';
    const searchInput = document.getElementById('component-search');
    if (searchInput) {
      searchInput.value = '';
    }
    this.render();
  }

  getComponentInfo(componentType) {
    return componentRegistry.getComponent(componentType);
  }

  getAllComponents() {
    return componentRegistry.getAllComponents();
  }

  getComponentsByCategory(category) {
    return componentRegistry.getComponentsByCategory(category);
  }
}


/* =========================================================
   ADMIN — Section Builder UI (Phase 4.3)
   Professional visual section builder interface.
   Preserves existing iframe editor, EditorState, DomManager,
   Page Manager, History, and Media foundation.
   Does NOT modify public website source files, assets/js/main.js,
   or tools/build.js.
   ========================================================= */

"use strict";

// Section List Navigator component
const SectionList = {
  // Render the section list HTML
  render() {
    const sections = sectionBuilder.getSections();
    const currentSectionId = window.currentSelectedSectionId;
    
    let html = `
      <div class="section-navigator" id="section-navigator">
        <div class="section-navigator-header">
          <span>Sections</span>
          <button class="btn--tiny" onclick="sectionBuilder.addSection('${window.currentPageId}')">+ Add Section</button>
        </div>
        <div class="section-navigator-list">
    `;
    
    sections.forEach(section => {
      const isSelected = section.id === currentSectionId;
      const typeLabels = {
        'container': 'Container',
        'hero': 'Hero',
        'features': 'Features',
        'about': 'About',
      };
      const typeName = typeLabels[section.type] || section.type;
      
      html += `
        <div class="section-navigator-item ${isSelected ? 'selected' : ''}" 
             data-section-id="${section.id}"
             onclick="sectionBuilder.selectSection('${section.id}')">
          <span class="section-navigator-type">${typeName}</span>
          <span class="section-navigator-name">${section.name || 'Unnamed'}</span>
          <span class="section-navigator-order">${section.order}</span>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  // Initialize the section list
  init() {
    const navigator = document.getElementById('section-navigator');
    if (navigator) {
      navigator.innerHTML = this.render();
      this.bindEvents();
    }
  },
  
  // Bind events
  bindEvents() {
    // Item click handled via onclick attribute
    // Update selected state on click
    const items = document.querySelectorAll('.section-navigator-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        // Remove selected class from all items
        items.forEach(i => i.classList.remove('selected'));
        // Add selected class to clicked item
        item.classList.add('selected');
        // Notify section builder
        const sectionId = item.getAttribute('data-section-id');
        sectionBuilder.selectSection(sectionId);
      });
    });
  }
};

// Component System definitions
const ComponentDefs = {
  // Built-in component definitions
  components: {
    heading: {
      name: 'Heading',
      tag: 'h1',
      defaultProps: {
        content: 'New Heading',
        level: 'h1',
        align: 'center',
      },
      inspectorFields: [
        {
          name: 'content',
          type: 'text',
          label: 'Heading Content',
        },
        {
          name: 'level',
          type: 'select',
          label: 'Heading Level',
          options: [
            { value: 'h1', label: 'H1' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
          ],
        },
        {
          name: 'align',
          type: 'select',
          label: 'Alignment',
          options: [
            { value: 'start', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'Right' },
          ],
        },
      ],
    },
    paragraph: {
      name: 'Paragraph',
      tag: 'p',
      defaultProps: {
        content: 'New paragraph text',
      },
      inspectorFields: [
        {
          name: 'content',
          type: 'text',
          label: 'Paragraph Text',
        },
      ],
    },
    button: {
      name: 'Button',
      tag: 'button',
      defaultProps: {
        content: 'Button',
        action: '#',
      },
      inspectorFields: [
        {
          name: 'content',
          type: 'text',
          label: 'Button Text',
        },
        {
          name: 'action',
          type: 'text',
          label: 'Action URL',
          placeholder: '#',
        },
      ],
    },
    image: {
      name: 'Image',
      tag: 'img',
      defaultProps: {
        src: '',
        alt: '',
      },
      inspectorFields: [
        {
          name: 'src',
          type: 'text',
          label: 'Image URL',
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
        },
      ],
    },
    divider: {
      name: 'Divider',
      tag: 'hr',
      defaultProps: {},
      inspectorFields: [],
    },
    spacer: {
      name: 'Spacer',
      tag: 'div',
      defaultProps: {
        height: '1rem',
      },
      inspectorFields: [
        {
          name: 'height',
          type: 'text',
          label: 'Height',
          placeholder: '1rem',
        },
      ],
    },
  },
  
  // Render a component HTML
  renderComponent(componentId, componentType) {
    const def = this.components[componentType];
    if (!def) return '';
    
    const props = window.sectionBuilder ? window.sectionBuilder.getSectionComponentProps(componentId) : def.defaultProps;
    
    let html = `<${def.tag}`;
    
    // Add common attributes
    if (def.tag === 'button') {
      html += ` onclick="console.log('Button clicked')"`;
    }
    
    html += `></${def.tag}>`;
    return html;
  },
  
  // Create a new component
  createComponent(componentType, sectionId) {
    const def = this.components[componentType];
    if (!def) return null;
    
    // Generate component ID
    const componentId = `component-${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add section element
    if (window.sectionBuilder && window.sectionBuilder.addElementToSection) {
      window.sectionBuilder.addElementToSection(sectionId, componentId, componentType);
    }
    
    return componentId;
  },
};

// Initialize on load
if (typeof window !== 'undefined') {
  // Section list will be initialized when editor loads
}

// Export
export const UISystem = {
  SectionList,
  ComponentDefs,
};
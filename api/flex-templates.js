/**
 * Flex Templates API - Handles CRUD operations for Flex Message templates
 */

// Simple in-memory storage for demo purposes
// In production, this would connect to a database
let templates = [];
let nextId = 1;

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        handleGet(req, res);
        break;
      case 'POST':
        handlePost(req, res);
        break;
      case 'PUT':
        handlePut(req, res);
        break;
      case 'DELETE':
        handleDelete(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

function handleGet(req, res) {
  const { id } = req.query;

  if (id) {
    // Get specific template
    const template = templates.find(t => t.id === id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.status(200).json({
      success: true,
      template: template
    });
  } else {
    // Get all templates with optional filtering
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let filteredTemplates = [...templates];
    
    // Filter by category
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    // Search in name and altText
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.altText.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      templates: paginatedTemplates,
      total: filteredTemplates.length,
      offset: startIndex,
      limit: parseInt(limit)
    });
  }
}

function handlePost(req, res) {
  const templateData = req.body;
  
  // Validate required fields
  if (!templateData.name || !templateData.category || !templateData.altText) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'category', 'altText']
    });
  }
  
  // Create new template
  const template = {
    ...templateData,
    id: templateData.id || `template_${nextId++}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Validate template structure
  const validation = validateTemplate(template);
  if (!validation.valid) {
    return res.status(400).json({
      error: 'Template validation failed',
      errors: validation.errors
    });
  }
  
  templates.push(template);
  
  res.status(201).json({
    success: true,
    template: template
  });
}

function handlePut(req, res) {
  const { id } = req.query;
  const templateData = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Template ID is required' });
  }
  
  const templateIndex = templates.findIndex(t => t.id === id);
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  // Update template
  const updatedTemplate = {
    ...templates[templateIndex],
    ...templateData,
    id: id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  // Validate updated template
  const validation = validateTemplate(updatedTemplate);
  if (!validation.valid) {
    return res.status(400).json({
      error: 'Template validation failed',
      errors: validation.errors
    });
  }
  
  templates[templateIndex] = updatedTemplate;
  
  res.status(200).json({
    success: true,
    template: updatedTemplate
  });
}

function handleDelete(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Template ID is required' });
  }
  
  const templateIndex = templates.findIndex(t => t.id === id);
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const deletedTemplate = templates.splice(templateIndex, 1)[0];
  
  res.status(200).json({
    success: true,
    deletedId: id,
    template: deletedTemplate
  });
}

function validateTemplate(template) {
  const errors = [];
  
  // Basic validation
  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }
  
  if (!template.category) {
    errors.push('Template category is required');
  }
  
  if (!template.altText || template.altText.trim().length === 0) {
    errors.push('Alt text is required');
  }
  
  if (template.altText && template.altText.length > 400) {
    errors.push('Alt text must be 400 characters or less');
  }
  
  // Layout validation
  if (!template.layout) {
    errors.push('Template layout is required');
  } else {
    // Check if layout has at least one part
    const totalParts = (template.layout.header?.length || 0) + 
                      (template.layout.body?.length || 0) + 
                      (template.layout.footer?.length || 0);
    
    if (totalParts === 0) {
      errors.push('Template must have at least one component');
    }
    
    // Validate individual parts
    ['header', 'body', 'footer'].forEach(placement => {
      const parts = template.layout[placement] || [];
      parts.forEach((part, index) => {
        if (!part.type) {
          errors.push(`${placement} component ${index + 1}: type is required`);
        }
        
        if (!part.id) {
          errors.push(`${placement} component ${index + 1}: id is required`);
        }
      });
    });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Initialize with some sample templates for demo
function initializeSampleTemplates() {
  if (templates.length === 0) {
    templates = [
      {
        id: 'sample_statement_1',
        name: 'サンプル明細通知',
        category: 'statement',
        altText: 'サンプルの明細通知です',
        schemaVersion: '1.0',
        layout: {
          bubbleSize: 'mega',
          header: [
            {
              id: 'header_date_1',
              type: 'date',
              props: { mode: 'auto', format: 'YYYY年MM月DD日' },
              style: { align: 'start', margin: 'none' },
              placement: 'header',
              order: 0
            }
          ],
          body: [
            {
              id: 'body_title_1',
              type: 'title',
              props: { text: 'サンプル明細', level: 'h2' },
              style: { align: 'start', margin: 'md' },
              placement: 'body',
              order: 0
            },
            {
              id: 'body_items_1',
              type: 'items',
              props: {
                items: [
                  { name: 'サンプル項目1', amount: 1000, note: '備考1' },
                  { name: 'サンプル項目2', amount: 500, note: '備考2' }
                ],
                showTotal: true,
                currency: '円'
              },
              style: { align: 'start', margin: 'md' },
              placement: 'body',
              order: 1
            }
          ],
          footer: [],
          theme: {
            primaryColor: '#06b6d4',
            secondaryColor: '#0891b2',
            textColor: '#111827',
            bgColor: '#ffffff',
            borderColor: '#e5e7eb',
            successColor: '#10b981',
            warningColor: '#f59e0b',
            errorColor: '#ef4444'
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    nextId = 2;
  }
}

// Initialize sample templates
initializeSampleTemplates();


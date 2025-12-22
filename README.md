# Project-E

A comprehensive web application suite providing utilities for childcare fee calculations, chat table-of-contents generation, and a blog management system.

## Overview

Project-E is a collection of web-based tools designed to streamline various workflows:

- **Portal** (`Index.html`) - Central navigation hub for accessing all tools
- **Calculator** (`Calcu/`) - Childcare and extended care fee calculator (預かり保育 計算シート)
- **Chat TOC Maker** (`Chat/`) - Chat-to-table-of-contents generator (チャット目次メーカー)
- **Blog System** (`public/`) - Full-featured blog platform with article management
- **API Services** (`api/`) - Backend endpoints for chat, image generation, and article management

## Project Structure

```
Project-E/
├── Index.html              # Main portal page
├── Calcu.html             # Redirect to Calcu/index.html
├── Calcu/
│   └── index.html         # Childcare fee calculator application
├── Chat/
│   └── Index.html         # Chat table-of-contents maker
├── api/
│   ├── articles.js        # Article CRUD operations
│   ├── caption.js         # Caption generation
│   ├── chat.js           # Chat processing
│   ├── generate-image.js  # Image generation
│   └── status.js         # API health check
├── public/
│   ├── index.html        # Public blog homepage
│   ├── blog*.html        # Blog viewing and editing interfaces
│   ├── admin.html        # Blog administration
│   ├── draw.html         # Drawing utility
│   └── ...               # Additional blog pages
├── package.json
├── vercel.json           # Vercel deployment configuration
└── README.md
```

## Application Components

### 1. Portal (Index.html)

The main entry point providing navigation to all available tools. Features a clean card-based interface for easy access to:
- Childcare fee calculator
- Chat TOC maker
- Other utilities

### 2. Calculator (Calcu/)

A specialized tool for calculating childcare (預かり保育) and extended care (延長保育) fees for 1号認定 kindergarten students in Japan.

**URL Structure:**
- `/Calcu.html` - Redirects to `/Calcu/index.html`
- `/Calcu/index.html` - Main calculator application

**Features:**
- Date-based fee tracking
- Multiple care plans (full day, morning, afternoon)
- Extension fee calculation (200円 per 30 minutes after 16:30)
- Column visibility toggles
- Version tracking with last update timestamp
- Responsive design for mobile and desktop

**Pricing Rules:**
- Full day (8:30-16:30): 1,000円
- Morning (8:30-13:00): 500円
- Afternoon (13:00-16:30): 500円
- Extension care is only charged when childcare is NOT used
- Extension: 200円 per 30-minute block after 16:30

### 3. Chat TOC Maker (Chat/Index.html)

A utility for generating structured table-of-contents from chat transcripts.

### 4. Blog System (public/)

A comprehensive blog platform with features for:
- Article creation and editing (`blog-edit.html`)
- Public and private article views
- Tag-based organization
- Archive views (by month/year)
- Admin panel for content management
- Integration with ChatGPT for content creation

### 5. API Services (api/)

Backend serverless functions providing:

#### `GET/POST /api/articles`
- Retrieve and manage blog articles
- CRUD operations for article data
- Persistent storage with configurable location

#### `POST /api/chat`
- Process chat messages
- Integration with external chat services

#### `POST /api/generate-image`
- Generate images for blog posts
- AI-powered image creation

#### `POST /api/caption`
- Generate captions for images
- AI-assisted caption creation

#### `GET /api/status`
- API health check endpoint
- Service status monitoring

## URL Routing & Redirects

The application uses Vercel rewrites (configured in `vercel.json`) to handle routing:

```json
{
  "rewrites": [
    { "source": "/Index.html", "destination": "/Index.html" },
    { "source": "/Calcu.html", "destination": "/Calcu.html" },
    { "source": "/Calcu/(.*)", "destination": "/Calcu/$1" },
    { "source": "/Chat/(.*)", "destination": "/Chat/$1" },
    { "source": "/draw", "destination": "/public/draw.html" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/public/$1" }
  ]
}
```

**Routing Behavior:**
- `/Index.html` - Portal page (main navigation hub)
- `/Calcu.html` - Calcu redirect page with auto-refresh to `/Calcu/index.html`
- `/Calcu/*` - Calculator application files
- `/Chat/*` - Chat TOC maker application files
- `/draw` - Drawing utility (from public directory)
- `/api/*` - API endpoints
- All other paths - Blog system files from public directory (default)

Additionally, `Calcu.html` serves as a redirect page with automatic meta-refresh to `Calcu/index.html`, maintaining backward compatibility while organizing the calculator in its own directory.

## Data Persistence

### Articles Storage

Articles API data is stored in a configurable, durable location instead of temporary directories. 

**Configuration:**
- Set the `ARTICLES_DATA_PATH` environment variable to point to a writable, persistent path (e.g., mounted volume or external storage)
- If unset, defaults to `./data/articles-data.json`
- Directory is auto-created if it doesn't exist

**Important:** Ensure your deployment target provides a persistent file system or configure `ARTICLES_DATA_PATH` accordingly.

## Development

### Prerequisites

- Node.js 18 or higher (see `package.json` engines requirement)
- For local development, install via: `nvm install 18 && nvm use 18`

### Installation

```bash
npm install
```

### Local Development

The application is designed to be deployed on Vercel, but can be tested locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run local development server
vercel dev
```

### Testing

```bash
npm test
```

## Deployment

### Runtime Requirements

- Node.js 18 runtime (configured in `vercel.json`)
- Persistent storage for articles data
- Environment variables for API keys (if using AI features)

### Vercel Deployment

The project is configured for Vercel deployment with:
- Serverless function runtime: `nodejs18.x`
- URL rewrites for clean routing
- Automatic HTTPS and CDN distribution

**Deploy:**
```bash
vercel --prod
```

### Environment Variables

Configure these in your Vercel project settings:
- `ARTICLES_DATA_PATH` - Path for article data storage (optional)
- Additional API keys for chat/image generation services (as needed)

## Features & Highlights

- **Multilingual Support:** Japanese language interface throughout
- **Responsive Design:** Mobile-first approach with desktop optimization
- **Version Tracking:** Automatic version and last-update display
- **Accessibility:** ARIA labels and semantic HTML
- **Modern UI:** Clean, card-based interfaces with smooth transitions
- **Persistent Data:** Configurable storage for blog articles
- **API Integration:** Serverless functions for backend operations

## Browser Support

Modern browsers supporting ES6+ and CSS Grid:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

See repository license file for details.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style conventions
- UI maintains Japanese language consistency
- Changes are tested across major browsers
- Documentation is updated as needed

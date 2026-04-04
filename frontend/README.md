# SnipURL Frontend

A modern, responsive web interface for the SnipURL URL shortener API.

## Features

- **URL Shortening**: Create short URLs with optional custom aliases and expiration dates
- **User Authentication**: Register and login to manage your URLs
- **URL Management**: View, edit, and delete your shortened links
- **Analytics Dashboard**: Detailed click statistics with geographic and referrer data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Status**: Shows API connection status

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client with interceptors

## Getting Started

### Prerequisites

- Node.js 16+ 
- SnipURL API running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Auth.jsx        # Login/Register form
│   │   ├── Header.jsx      # Navigation header
│   │   ├── UrlList.jsx     # URL management dashboard
│   │   ├── UrlShortener.jsx # URL creation form
│   │   └── UrlStats.jsx    # Analytics dashboard
│   ├── api.js              # API client configuration
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles with Tailwind
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## API Integration

The frontend automatically connects to the SnipURL API at `http://localhost:8000`. The Vite proxy handles CORS issues during development.

### Authentication

- JWT tokens are stored in localStorage
- Automatic token attachment to API requests
- Protected routes redirect to auth page

### Features

- **Public URL Shortening**: Anyone can create short URLs without an account
- **Account Features**: Registered users get analytics, URL management, and custom aliases
- **Real-time Updates**: API status indicator shows connection health
- **Copy to Clipboard**: One-click URL copying
- **Responsive Tables**: Mobile-friendly analytics display

## Environment Variables

For production, you may need to update the API base URL in `src/api.js`:

```javascript
const API_BASE_URL = 'https://your-api-domain.com';
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the SnipURL URL shortener system.

# API Configuration Guide

## Environment Variables

This application uses environment variables to configure the API endpoint. Create the appropriate `.env` file in the project root:

### Development (`.env.development`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production (`.env.production`)

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

### Local Override (`.env.local`)

For local development overrides:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Usage

The API configuration is centralized in `api.config.js` and will automatically use the environment variable `VITE_API_BASE_URL` or fall back to `http://localhost:5000/api`.

All API calls should go through the service layer (`src/services/productService.js`) rather than making direct fetch calls from components.

## Security Notes

- **Never commit `.env` files with sensitive data**
- Always use environment variables for API URLs
- Never hardcode external URLs in component files
- All API endpoints are defined in `api.config.js`


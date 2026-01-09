# TechNest Web Application

A modern, production-ready React/Next.js single-page application built with TypeScript and Tailwind CSS.

## Features

- ⚡ **Next.js 14** - React framework with server-side rendering
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **Standalone Output** - Optimized for containerized deployments
- 🔒 **Production Ready** - Security best practices implemented
- 📱 **Responsive Design** - Mobile-first approach
- 🚀 **Performance Optimized** - Fast loading and runtime performance

## Tech Stack

- **Framework:** Next.js 14.2.3
- **Language:** TypeScript 5.4.5
- **Styling:** Tailwind CSS 3.4.4
- **Runtime:** Node.js 18.20.8
- **Container:** Docker with Alpine Linux

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd technest-clone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

Build the application:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t technest-web:latest .
```

### Run with Docker

```bash
docker run -p 80:80 technest-web:latest
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Project Structure

```
technest-clone/
├── src/
│   ├── app/          # Next.js app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/   # React components
│       ├── Navigation.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Services.tsx
│       └── Footer.tsx
├── public/           # Static assets
├── Dockerfile        # Container configuration
├── next.config.js    # Next.js configuration
└── package.json      # Dependencies and scripts
```

## Configuration

### Next.js Configuration

The application is configured for standalone output mode, which creates a minimal production build perfect for containerization:

```javascript
// next.config.js
{
  output: 'standalone',
  // ... other configurations
}
```

### Environment Variables

- `NODE_ENV` - Set to 'production' for production builds
- `PORT` - Server port (default: 80)
- `HOSTNAME` - Server hostname (default: 0.0.0.0)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Azure Container Registry

The application is configured to work with Azure Container Registry:

```bash
# Build and tag
docker build -t technest.azurecr.io/technestweb:0.3.12 .

# Push to registry
docker push technest.azurecr.io/technestweb:0.3.12
```

### Production Best Practices

- ✅ Non-root user execution (nextjs:nodejs)
- ✅ Minimal Alpine base image
- ✅ Multi-stage Docker build
- ✅ Optimized bundle size with standalone output
- ✅ Security headers configured
- ✅ Environment-based configuration

## License

MIT

## Support

For support and questions, please contact info@technest.com
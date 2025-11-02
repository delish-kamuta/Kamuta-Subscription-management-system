# Bus Tracker

A modern real-time bus tracking application built with React and TypeScript.

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7 with SSR support
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS with New York style
- **Icons**: Lucide React
- **Error Tracking**: Sentry
- **Animation**: tw-animate-css

### Backend Integration
- **Backend Service**: Appwrite for authentication and database
- **API Integration**: Built-in API endpoints with React Router

### Development & Build Tools
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Package Manager**: npm
- **Container Support**: Docker with multi-stage builds


## Getting Started

### Prerequisites
- Node.js 20 or later
- npm 10 or later
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/arnaud-devs/bus-tracker-fn.git
cd bus-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Appwrite credentials:
```env
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_API_KEY=your_api_key
VITE_APPWRITE_DATABASE_ID=your_database_id
```

### Development

Start the development server with HMR:
```bash
npm run dev
```
Your application will be available at `http://localhost:5173`


## Building for Production

Create a production build:
```bash
npm run build
```

## Project Structure
```
├── app/
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utility functions
│   ├── routes/       # Application routes
│   └── root.tsx      # Root layout
├── public/           # Static assets
└── [config files]    # Various configuration files
```

## Contributors

- **SHEMA Arnaud** - contributor
	- GitHub: [@arnaud-devs](https://github.com/arnaud-devs)
 
- **frankkatu** - Contributor
	- GitHub: [@frankkatu](https://github.com/frankkatu)

- **MichelMUNEZERO** - Contributor
	- GitHub: [@MichelMUNEZERO](https://github.com/MichelMUNEZERO)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

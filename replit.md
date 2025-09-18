# Overview

This is a Vietnam travel planning web application built as a full-stack TypeScript project. The application helps users plan trips to Vietnam by providing comprehensive travel services including flight search, hotel booking, restaurant recommendations, activity suggestions, transportation options, and complete itinerary building. The system uses a modern React frontend with a Node.js/Express backend, styled with shadcn/ui components and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Validation**: Zod schemas for request validation
- **Development**: Hot reloading with Vite middleware integration

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Comprehensive travel-related tables including users, flights, hotels, restaurants, activities, transportation, and itineraries
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless PostgreSQL driver ready for deployment

## Component Architecture
- **Design System**: Consistent component library with variants using class-variance-authority
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure ARIA compliance and keyboard navigation
- **Theme Support**: CSS custom properties enable light/dark mode switching

## Data Flow
- **API Communication**: Centralized query client with custom fetch wrapper
- **Error Handling**: Global error boundaries with toast notifications
- **Loading States**: Skeleton components and loading indicators
- **Caching**: Intelligent query caching with stale-while-revalidate patterns

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with React DOM, React Hook Form, and TanStack Query
- **Backend Framework**: Express.js with TypeScript support via tsx
- **Build Tools**: Vite with React plugin and TypeScript configuration

## Database and ORM
- **Database**: PostgreSQL via Neon serverless platform
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for schema validation and type inference

## UI and Styling
- **Component Library**: Radix UI primitives for accessibility-first components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Utilities**: clsx and tailwind-merge for conditional styling

## Development Tools
- **Replit Integration**: Vite plugins for Replit cartographer, dev banner, and runtime error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Font Loading**: Google Fonts integration for typography

## Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: Environment-based configuration for database connections

## Utility Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Carousel**: Embla Carousel React for image galleries and content sliders
- **Command Interface**: cmdk for search and command palette functionality
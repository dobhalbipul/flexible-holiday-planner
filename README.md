# 🌴 Flexible Holiday Planner

A modern, full-stack travel planning application that helps users discover, plan, and book their perfect vacation. Built with React, TypeScript, and modern web technologies.

## ✨ Features

### 🎯 Core Functionality
- **Flexible Date Search**: Find the best travel dates based on your preferences
- **Smart Destination Discovery**: Explore popular destinations with detailed information
- **Flight Search & Booking**: Search and compare flights with real-time pricing
- **Hotel Reservations**: Browse and book accommodations with detailed amenities
- **Custom Itineraries**: Create personalized day-by-day travel plans
- **Activity Planning**: Discover and book local activities and attractions
- **Multi-Currency Support**: View prices in your preferred currency
- **Secure Payments**: Process bookings with Stripe integration

### 🚀 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS and Radix UI
- **Real-time Updates**: Live pricing and availability information
- **Progress Tracking**: Visual progress indicators throughout the booking flow
- **Comprehensive Summary**: Detailed booking review before payment

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Wouter** - Lightweight routing solution
- **TanStack Query** - Server state management and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database toolkit
- **Neon Database** - Serverless PostgreSQL

### Payment & APIs
- **Stripe** - Payment processing (multi-gateway support)
- **Amadeus API** - Flight and hotel data (with comprehensive mock data fallback)
- **Multi-currency** - Support for MYR, USD, SGD, INR, VND

### Development Tools
- **Vite** - Lightning-fast frontend development with HMR
- **ESBuild** - Fast JavaScript bundler for server compilation
- **Drizzle Kit** - Database schema management and migrations
- **PostCSS** - CSS processing and optimization
- **Git** - Version control

## 🎯 Current Data Sources

### Mock Data (Development Ready)
The application includes extensive mock data for development and testing:
- **Flights**: Realistic flight data with multiple airlines, layovers, and pricing
- **Hotels**: Detailed hotel information with amenities, ratings, and locations  
- **Activities**: Local attractions and experiences for various destinations
- **Restaurants**: Curated dining options with cuisine types and pricing
- **Best Dates**: Intelligent date recommendations based on pricing trends

### Production APIs (Ready for Integration)
- **Amadeus API**: Real-time flight and hotel data (configure API keys)
- **Payment Processing**: Stripe integration for secure transactions
- **Database**: Neon PostgreSQL with Drizzle ORM (currently using in-memory storage)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dobhalbipul/flexible-holiday-planner.git
   cd flexible-holiday-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Application Settings
   NODE_ENV=development
   PORT=5000
   
   # Database (Optional - defaults to in-memory storage)
   DATABASE_URL=your_neon_database_url
   
   # Stripe Payment Processing
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   
   # Amadeus API (Optional - defaults to mock data)
   AMADEUS_API_KEY=your_amadeus_api_key
   AMADEUS_API_SECRET=your_amadeus_api_secret
   
   # Additional Payment Gateways (Optional)
   RAZER_MERCHANT_ID=your_razer_merchant_id
   RAZER_VERIFY_KEY=your_razer_verify_key
   RAZER_SECRET_KEY=your_razer_secret_key
   RAZER_SANDBOX=true
   ```

4. **Database Setup (Optional)**
   ```bash
   # Only needed if using real database instead of mock data
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   # Recommended: Integrated development (single terminal)
   npm run dev
   
   # Alternative: Separate development (two terminals)
   npm run dev:server    # Backend on :5002
   npm run dev:client    # Frontend on :5176
   ```

   **Integrated development** will be available at `http://localhost:5000`  
   **Separate development** will be available at `http://localhost:5176`

## 📝 Available Scripts

- `npm run dev` - Start integrated development server (TypeScript backend + Vite frontend)
- `npm run dev:client` - Start frontend development server only (Vite on port 5176)
- `npm run dev:server` - Start backend development server only (enhanced-server.js on port 5002)
- `npm run build:server` - Compile TypeScript server to JavaScript
- `npm run build` - Build complete application for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🚀 Development Options

### Option 1: Integrated Development (Recommended)
```bash
npm run dev
```
- **Single URL**: `http://localhost:5000`
- **Full-stack TypeScript**: Complete type safety across frontend and backend
- **Hot Module Replacement**: Instant React updates via Vite integration
- **Production-ready**: Uses the same architecture as production
- **Complete API**: All endpoints including payments, database operations

### Option 2: Separate Development
```bash
# Terminal 1: Backend
npm run dev:server    # Enhanced server on :5002

# Terminal 2: Frontend  
npm run dev:client    # Vite dev server on :5176 (with API proxy)
```
- **Fast iteration**: Quick backend changes without TypeScript compilation
- **Independent debugging**: Separate frontend and backend development
- **Mock API**: Enhanced server provides comprehensive mock data

### Option 3: Frontend Only
```bash
npm run dev:client
```
- **Pure frontend development**: Work on UI components independently
- **API proxy**: Automatically forwards `/api` calls to backend server

## 🗂️ Project Structure

```
flexible-holiday-planner/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Radix UI components
│   │   │   ├── flight-search.tsx
│   │   │   ├── hotel-search.tsx
│   │   │   └── ...
│   │   ├── pages/            # Route components (home, flights, hotels, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and providers
│   │   │   ├── booking.tsx   # Booking state management
│   │   │   ├── currency.tsx  # Multi-currency support
│   │   │   └── queryClient.ts
│   │   └── App.tsx
│   └── index.html
├── server/                   # Backend Express application
│   ├── index.ts             # Main TypeScript server (production-ready)
│   ├── routes.ts            # API routes and endpoints
│   ├── storage.ts           # Data storage with extensive mock data
│   ├── amadeus-service.ts   # External API integration
│   ├── payment-service.ts   # Stripe payment processing
│   └── vite.ts              # Vite integration for development
├── shared/                  # Shared TypeScript schemas and types
│   └── schema.ts            # Database schemas and API types
├── enhanced-server.js       # Alternative development server (JavaScript)
├── vite.config.ts          # Vite build configuration
├── drizzle.config.ts       # Database ORM configuration
└── configuration files
```

## 🌟 Key Features Deep Dive

### 🔍 Smart Search
- **Flexible Dates**: Users can search for "best time to travel" within a month range
- **Destination Intelligence**: Curated destination suggestions with local insights
- **Price Comparison**: Real-time flight and hotel price comparisons

### 🗓️ Itinerary Builder
- **Day-by-Day Planning**: Organize activities, meals, and transportation by day
- **Local Recommendations**: Suggested activities based on destination
- **Customizable Schedule**: Flexible timing and activity selection

### 💳 Seamless Booking
- **Unified Checkout**: Book flights, hotels, and activities in one transaction
- **Secure Processing**: PCI-compliant payment handling with Stripe
- **Booking Confirmation**: Detailed confirmation with all travel documents

### 🌍 Multi-Currency Support
- Support for MYR, USD, SGD, INR, and VND
- Real-time currency conversion with accurate exchange rates
- Localized pricing display with proper currency symbols
- Automatic currency detection based on user preferences

## 🔧 Configuration

### Development Modes
- **Integrated Mode**: TypeScript server with Vite integration (recommended for production-like development)
- **Separate Mode**: JavaScript enhanced server + Vite dev server (faster iteration)
- **Frontend Only**: Vite development server with API proxy

### Database Configuration
- **Development**: Uses in-memory storage with extensive mock data
- **Production**: Drizzle ORM with Neon PostgreSQL (configure `drizzle.config.ts`)
- **Migration**: Run `npm run db:push` to apply schema changes

### API Integration
- **Mock Data**: Comprehensive fallback data for all endpoints (flights, hotels, activities)
- **Amadeus API**: Configure for real flight/hotel data when API keys are provided
- **Stripe Payments**: Required for payment processing (test keys included for development)
- **Multi-Currency**: Automatic currency conversion with support for 5+ currencies

### Vite Configuration
- **Hot Module Replacement**: Instant React updates during development
- **API Proxy**: Automatic routing of `/api` calls to backend server
- **Build Optimization**: Production builds with code splitting and tree shaking

## 🔧 Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Issue: TypeScript compilation errors
npm run check              # Check for TypeScript errors
npm run build:server      # Manually compile server

# Issue: Port already in use
# Change PORT in .env file or kill process using the port
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

#### Vite Build Issues
```bash
# Issue: ES module compatibility
# Ensure vite.config.ts uses proper import syntax
# Fixed: Added fileURLToPath for __dirname compatibility

# Issue: API proxy not working  
# Check vite.config.ts proxy target matches your backend server port
```

#### Database Connection
```bash
# Issue: Database connection fails
# Development mode works with mock data (no database required)
# Only configure DATABASE_URL for production

# Push schema changes
npm run db:push
```

### Development Tips
- Use `npm run dev` for production-like development experience
- Use `npm run dev:server` + `npm run dev:client` for faster iteration
- Check browser console for frontend errors
- Check terminal output for backend errors
- Mock data is extensive - no external APIs required for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bipul Kumar Dobhal**
- Email: dobhal.bipul@gmail.com
- GitHub: [@dobhalbipul](https://github.com/dobhalbipul)

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for beautiful icons
- [Stripe](https://stripe.com/) for secure payment processing
- [Amadeus](https://developers.amadeus.com/) for travel data APIs

---

⭐ Star this repository if you find it helpful!

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
- **Stripe** - Payment processing
- **Amadeus API** - Flight and hotel data (with fallback to mock data)

### Development Tools
- **ESBuild** - Fast JavaScript bundler
- **TSX** - TypeScript execution environment
- **PostCSS** - CSS processing
- **Git** - Version control

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
   # Database
   DATABASE_URL=your_neon_database_url
   
   # Stripe (for payments)
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   
   # Amadeus API (optional - falls back to mock data)
   AMADEUS_API_KEY=your_amadeus_api_key
   AMADEUS_API_SECRET=your_amadeus_api_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🗂️ Project Structure

```
flexible-holiday-planner/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/        # Radix UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and providers
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── amadeus-service.ts # External API integration
│   └── storage.ts        # Database operations
├── shared/               # Shared TypeScript schemas
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
- Support for USD, EUR, GBP, JPY, AUD, CAD, and CHF
- Real-time currency conversion
- Localized pricing display

## 🔧 Configuration

### Database Configuration
The project uses Drizzle ORM with Neon Database. Update `drizzle.config.ts` for your database settings.

### API Integration
- **Amadeus**: Configure for real flight/hotel data
- **Stripe**: Required for payment processing
- **Mock Data**: Automatic fallback when external APIs are unavailable

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

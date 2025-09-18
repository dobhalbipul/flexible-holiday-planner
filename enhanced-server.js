console.log("🚀 Enhanced Holiday Planner API Server starting...");

import express from 'express';

const app = express();
const port = 5002;

// Helper functions
function getDestinationCode(destination) {
    const destinations = {
        'kuala-lumpur': 'KUL',
        'bangkok': 'BKK',
        'singapore': 'SIN',
        'ho-chi-minh': 'SGN',
        'hoi-an-da-nang': 'DAD',
        'phu-quoc': 'PQC',
        'langkawi': 'LGK',
        'penang': 'PEN',
        'krabi': 'KBV',
        'phuket': 'HKT',
        'koh-samui': 'USM'
    };
    return destinations[destination] || 'BKK';
}

function getDestinationCity(destination) {
    const destinations = {
        'kuala-lumpur': 'Kuala Lumpur',
        'bangkok': 'Bangkok',
        'singapore': 'Singapore',
        'ho-chi-minh': 'Ho Chi Minh City',
        'hoi-an-da-nang': 'Hoi An / Da Nang',
        'phu-quoc': 'Phu Quoc',
        'langkawi': 'Langkawi',
        'penang': 'Penang',
        'krabi': 'Krabi',
        'phuket': 'Phuket',
        'koh-samui': 'Koh Samui'
    };
    return destinations[destination] || 'Bangkok';
}

function getOriginInfo() {
    return {
        code: 'PEN',
        city: 'Penang',
        country: 'Malaysia'
    };
}

function getNextDay(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for frontend communication
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Basic routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Flexible Holiday Planner API', 
        status: 'running',
        version: '1.0.0',
        endpoints: ['/api/flights', '/api/flights/search', '/api/hotels', '/api/health']
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock flight search endpoints
app.get('/api/flights', (req, res) => {
    console.log('🛫 Flight search request:', req.query);
    
    const { 
        destination = 'kuala-lumpur', 
        startDate = '2025-10-22', 
        endDate = '2025-10-29', 
        travelers = '2', 
        currency = 'MYR' 
    } = req.query;
    
    const originInfo = getOriginInfo();
    
    // Generate outbound flights (departure from Penang)
    let outboundFlights = [];
    let returnFlights = [];
    
    if (destination === 'hoi-an-da-nang') {
        // Specific flights from Penang to Hoi An/Da Nang (via Da Nang airport - DAD)
        outboundFlights = [
            {
                id: 'FL001-OUT',
                airline: 'AirAsia',
                flightNumber: 'AK173',
                origin: originInfo.code,
                destination: 'DAD',
                departureTime: '07:45',
                arrivalTime: '10:00',
                departureDate: startDate,
                arrivalDate: startDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '420.00',
                currency: currency
            },
            {
                id: 'FL002-OUT',
                airline: 'Vietnam Airlines',
                flightNumber: 'VN543',
                origin: originInfo.code,
                destination: 'DAD',
                departureTime: '13:30',
                arrivalTime: '15:45',
                departureDate: startDate,
                arrivalDate: startDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '465.00',
                currency: currency
            },
            {
                id: 'FL003-OUT',
                airline: 'Malaysia Airlines',
                flightNumber: 'MH2537',
                origin: originInfo.code,
                destination: 'DAD',
                departureTime: '18:20',
                arrivalTime: '20:35',
                departureDate: startDate,
                arrivalDate: startDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '510.00',
                currency: currency
            }
        ];

        // Return flights from Da Nang to Penang
        returnFlights = [
            {
                id: 'FL001-RET',
                airline: 'AirAsia',
                flightNumber: 'AK174',
                origin: 'DAD',
                destination: originInfo.code,
                departureTime: '11:15',
                arrivalTime: '13:30',
                departureDate: endDate,
                arrivalDate: endDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '435.00',
                currency: currency
            },
            {
                id: 'FL002-RET',
                airline: 'Vietnam Airlines',
                flightNumber: 'VN544',
                origin: 'DAD',
                destination: originInfo.code,
                departureTime: '16:50',
                arrivalTime: '19:05',
                departureDate: endDate,
                arrivalDate: endDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '480.00',
                currency: currency
            },
            {
                id: 'FL003-RET',
                airline: 'Malaysia Airlines',
                flightNumber: 'MH2538',
                origin: 'DAD',
                destination: originInfo.code,
                departureTime: '21:40',
                arrivalTime: '23:55',
                departureDate: endDate,
                arrivalDate: endDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '525.00',
                currency: currency
            }
        ];
    } else {
        // Default flights from Penang to other destinations
        outboundFlights = [
            {
                id: 'FL001-OUT',
                airline: 'AirAsia',
                flightNumber: 'AK6155',
                origin: originInfo.code,
                destination: getDestinationCode(destination),
                departureTime: '08:30',
                arrivalTime: '10:45',
                departureDate: startDate,
                arrivalDate: startDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '350.00',
                currency: currency
            },
            {
                id: 'FL002-OUT',
                airline: 'Malaysia Airlines',
                flightNumber: 'MH771',
                origin: originInfo.code,
                destination: getDestinationCode(destination),
                departureTime: '14:20',
                arrivalTime: '16:35',
                departureDate: startDate,
                arrivalDate: startDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '485.00',
                currency: currency
            },
            {
                id: 'FL003-OUT',
                airline: 'Firefly',
                flightNumber: 'FY2417',
                origin: originInfo.code,
                destination: getDestinationCode(destination),
                departureTime: '19:45',
                arrivalTime: '22:00',
                departureDate: startDate,
                arrivalDate: startDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '320.00',
                currency: currency
            }
        ];

        // Default return flights to Penang
        returnFlights = [
            {
                id: 'FL001-RET',
                airline: 'AirAsia',
                flightNumber: 'AK6156',
                origin: getDestinationCode(destination),
                destination: originInfo.code,
                departureTime: '11:30',
                arrivalTime: '13:45',
                departureDate: endDate,
                arrivalDate: endDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '365.00',
                currency: currency
            },
            {
                id: 'FL002-RET',
                airline: 'Malaysia Airlines',
                flightNumber: 'MH772',
                origin: getDestinationCode(destination),
                destination: originInfo.code,
                departureTime: '17:20',
                arrivalTime: '19:35',
                departureDate: endDate,
                arrivalDate: endDate,
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '500.00',
                currency: currency
            },
            {
                id: 'FL003-RET',
                airline: 'Firefly',
                flightNumber: 'FY2418',
                origin: getDestinationCode(destination),
                destination: originInfo.code,
                departureTime: '22:45',
                arrivalTime: '01:00',
                departureDate: endDate,
                arrivalDate: getNextDay(endDate),
                duration: '2h 15m',
                stops: '0',
                layoverDuration: null,
                layoverLocation: null,
                price: '335.00',
                currency: currency
            }
        ];
    }

    const response = {
        outboundFlights: outboundFlights,
        returnFlights: returnFlights,
        searchCriteria: {
            origin: originInfo.code,
            originCity: originInfo.city,
            originCountry: originInfo.country,
            destination: destination,
            startDate: startDate,
            endDate: endDate,
            travelers: parseInt(travelers),
            currency: currency
        }
    };

    res.json(response);
});

app.get('/api/flights/search', (req, res) => {
    console.log('🔍 Flight search API called:', req.query);
    
    const { origin = 'KUL', destination = 'SIN', departureDate } = req.query;
    
    // Return mock flight search results
    const mockFlights = [
        {
            id: 'FL001',
            airline: 'Air Asia',
            flightNumber: 'AK6155',
            origin: origin,
            destination: destination,
            departureTime: '08:30',
            arrivalTime: '10:45',
            duration: '1h 15m',
            price: 199,
            currency: 'MYR',
            stops: 0,
            aircraft: 'Airbus A320',
            departureDate: departureDate || '2025-09-25'
        },
        {
            id: 'FL002',
            airline: 'Scoot',
            flightNumber: 'TR452',
            origin: origin,
            destination: destination,
            departureTime: '15:30',
            arrivalTime: '16:45',
            duration: '1h 15m',
            price: 159,
            currency: 'MYR',
            stops: 0,
            aircraft: 'Boeing 787',
            departureDate: departureDate || '2025-09-25'
        },
        {
            id: 'FL003',
            airline: 'Singapore Airlines',
            flightNumber: 'SQ108',
            origin: origin,
            destination: destination,
            departureTime: '11:20',
            arrivalTime: '12:35',
            duration: '1h 15m',
            price: 299,
            currency: 'MYR',
            stops: 0,
            aircraft: 'Airbus A350',
            departureDate: departureDate || '2025-09-25'
        }
    ];

    res.json(mockFlights);
});

// Mock hotel endpoints
app.get('/api/hotels', (req, res) => {
    console.log('🏨 Hotel search request:', req.query);
    
    const { 
        destination = 'kuala-lumpur', 
        checkIn = '2025-10-22', 
        checkOut = '2025-10-29', 
        travelers = '2', 
        currency = 'MYR' 
    } = req.query;
    
    const mockHotels = [];
    
    if (destination === 'hoi-an-da-nang') {
        // Hotels split between Hoi An (2 nights) and Da Nang (3 nights)
        mockHotels.push(
            // Hoi An Hotels (2 nights)
            {
                id: 'HOI001',
                name: 'Anantara Hoi An Resort',
                location: 'Ancient Town, Hoi An',
                city: 'Hoi An',
                pricePerNight: '320.00',
                currency: currency,
                rating: '4.7',
                reviewCount: 1150,
                distanceToBeach: '2.5 km to An Bang Beach',
                distanceToLandmark: '0.3 km to Ancient Town',
                amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bicycle Rental', 'Garden'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'HOI002',
                name: 'Villa Hoi An Lodge',
                location: 'Riverside, Hoi An',
                city: 'Hoi An',
                pricePerNight: '180.00',
                currency: currency,
                rating: '4.5',
                reviewCount: 890,
                distanceToBeach: '3.0 km to Cua Dai Beach',
                distanceToLandmark: '0.8 km to Japanese Bridge',
                amenities: ['WiFi', 'Pool', 'Restaurant', 'River View', 'Shuttle Service'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'HOI003',
                name: 'Essence Hoi An Hotel',
                location: 'City Center, Hoi An',
                city: 'Hoi An',
                pricePerNight: '125.00',
                currency: currency,
                rating: '4.3',
                reviewCount: 650,
                distanceToBeach: '2.8 km to An Bang Beach',
                distanceToLandmark: '0.5 km to Night Market',
                amenities: ['WiFi', 'Pool', 'Restaurant', 'Rooftop Bar', 'Laundry'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            // Da Nang Hotels (3 nights)
            {
                id: 'DAN001',
                name: 'Hyatt Regency Danang Resort',
                location: 'My Khe Beach, Da Nang',
                city: 'Da Nang',
                pricePerNight: '450.00',
                currency: currency,
                rating: '4.8',
                reviewCount: 1580,
                distanceToBeach: '0.0 km - Beachfront',
                distanceToLandmark: '8.0 km to Dragon Bridge',
                amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Multiple Restaurants', 'Golf Course'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'DAN002',
                name: 'Pullman Danang Beach Resort',
                location: 'My Khe Beach, Da Nang',
                city: 'Da Nang',
                pricePerNight: '380.00',
                currency: currency,
                rating: '4.6',
                reviewCount: 1200,
                distanceToBeach: '0.0 km - Beachfront',
                distanceToLandmark: '6.5 km to Marble Mountains',
                amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Kids Club'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'DAN003',
                name: 'Novotel Danang Premier Han River',
                location: 'Han River, Da Nang',
                city: 'Da Nang',
                pricePerNight: '220.00',
                currency: currency,
                rating: '4.4',
                reviewCount: 950,
                distanceToBeach: '1.2 km to My Khe Beach',
                distanceToLandmark: '0.5 km to Dragon Bridge',
                amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'River View', 'Fitness Center'],
                imageUrl: 'https://via.placeholder.com/400x300'
            }
        );
    } else {
        // Default hotels for other destinations
        mockHotels.push(
            {
                id: 'HT001',
                name: 'Grand Hyatt Kuala Lumpur',
                location: 'KLCC, Kuala Lumpur',
                city: getDestinationCity(destination),
                pricePerNight: '450.00',
                currency: currency,
                rating: '4.8',
                reviewCount: 1250,
                distanceToBeach: destination.includes('beach') ? '0.2 km' : null,
                distanceToLandmark: '0.5 km to KLCC',
                amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Business Center'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'HT002',
                name: 'Mandarin Oriental',
                location: 'City Center',
                city: getDestinationCity(destination),
                pricePerNight: '520.00',
                currency: currency,
                rating: '4.9',
                reviewCount: 890,
                distanceToBeach: destination.includes('beach') ? '0.1 km' : null,
                distanceToLandmark: '1.2 km to Shopping District',
                amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Concierge'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'HT003',
                name: 'Sheraton Imperial',
                location: 'Downtown',
                city: getDestinationCity(destination),
                pricePerNight: '280.00',
                currency: currency,
                rating: '4.5',
                reviewCount: 654,
                distanceToBeach: destination.includes('beach') ? '0.8 km' : null,
                distanceToLandmark: '2.0 km to City Center',
                amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking'],
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                id: 'HT004',
                name: 'Boutique Beach Resort',
                location: 'Beachfront',
                city: getDestinationCity(destination),
                pricePerNight: '380.00',
                currency: currency,
                rating: '4.7',
                reviewCount: 432,
                distanceToBeach: '0.0 km',
                distanceToLandmark: '5.0 km to Airport',
                amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Water Sports'],
                imageUrl: 'https://via.placeholder.com/400x300'
            }
        );
    }

    const response = {
        hotels: mockHotels,
        searchCriteria: {
            destination: destination,
            checkIn: checkIn,
            checkOut: checkOut,
            travelers: parseInt(travelers),
            currency: currency
        }
    };

    res.json(response);
});

// Mock activities endpoint
app.get('/api/activities', (req, res) => {
    console.log('🎯 Activities search request:', req.query);
    
    const { 
        destination = 'kuala-lumpur',
        city,
        currency = 'MYR' 
    } = req.query;
    
    // Handle both destination and city parameters
    let searchDestination = destination;
    if (city) {
        // Map city names to destination values
        if (city.toLowerCase().includes('hoi an')) {
            searchDestination = 'hoi-an-da-nang';
        } else if (city.toLowerCase().includes('da nang') || city.toLowerCase().includes('danang')) {
            searchDestination = 'hoi-an-da-nang';
        } else {
            searchDestination = city.toLowerCase().replace(/\s+/g, '-');
        }
    }
    
    const mockActivities = [];
    
    console.log('🏛️ Searching activities for:', searchDestination, 'City filter:', city);
    
    if (searchDestination === 'hoi-an-da-nang' || city) {
        // Filter activities based on city if specified
        const cityFilter = city ? city.toLowerCase() : null;
        
        // Activities split between Hoi An and Da Nang
        allActivities = [
            // Hoi An Activities (Day 1-2)
            {
                id: 'HOI_ACT001',
                name: 'Hoi An Ancient Town Walking Tour',
                city: 'Hoi An',
                description: 'Explore UNESCO World Heritage ancient town with Japanese Bridge, Chinese temples, and traditional houses',
                duration: '3 hours',
                price: '45.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'HOI_ACT002',
                name: 'Lantern Festival & Night Market',
                city: 'Hoi An',
                description: 'Experience the magical lantern festival and browse local handicrafts at the night market',
                duration: '4 hours',
                price: '55.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'HOI_ACT003',
                name: 'Cooking Class & Market Tour',
                city: 'Hoi An',
                description: 'Learn to cook traditional Vietnamese dishes after visiting local market',
                duration: '5 hours',
                price: '75.00',
                currency: currency,
                category: 'Food & Drink',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'HOI_ACT004',
                name: 'Bicycle Tour to Tra Que Village',
                city: 'Hoi An',
                description: 'Cycle through rice paddies to organic herb village and learn about farming',
                duration: '4 hours',
                price: '65.00',
                currency: currency,
                category: 'Adventure',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            // Da Nang Activities (Day 3-5)
            {
                id: 'DAN_ACT001',
                name: 'Ba Na Hills & Golden Bridge Tour',
                city: 'Da Nang',
                description: 'Visit the famous Golden Bridge held by giant hands and explore French village',
                duration: '8 hours',
                price: '125.00',
                currency: currency,
                category: 'Sightseeing',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'DAN_ACT002',
                name: 'Marble Mountains & Linh Ung Pagoda',
                city: 'Da Nang',
                description: 'Explore mysterious caves and Buddhist pagodas in the marble mountains',
                duration: '4 hours',
                price: '85.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'DAN_ACT003',
                name: 'My Khe Beach Water Sports',
                city: 'Da Nang',
                description: 'Enjoy jet skiing, parasailing, and beach volleyball at pristine My Khe Beach',
                duration: '3 hours',
                price: '95.00',
                currency: currency,
                category: 'Adventure',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'DAN_ACT004',
                name: 'Dragon Bridge Fire Show & Han Market',
                city: 'Da Nang',
                description: 'Watch the spectacular dragon breathing fire and explore local Han Market',
                duration: '3 hours',
                price: '35.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'DAN_ACT005',
                name: 'My Son Sanctuary Day Trip',
                city: 'Da Nang',
                description: 'Visit ancient Cham temples and learn about Champa civilization',
                duration: '6 hours',
                price: '105.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            }
        ];
        
        // Filter activities by city if specified
        if (cityFilter) {
            const filteredActivities = allActivities.filter(activity => 
                activity.city.toLowerCase().includes(cityFilter)
            );
            mockActivities.push(...filteredActivities);
        } else {
            mockActivities.push(...allActivities);
        }
    } else {
        // Default activities for other destinations
        mockActivities.push(
            {
                id: 'ACT001',
                name: 'City Walking Tour',
                city: getDestinationCity(destination),
                description: 'Explore the historic landmarks and cultural sites with a local guide',
                duration: '3 hours',
                price: '65.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'ACT002',
                name: 'Food Street Adventure',
                city: getDestinationCity(destination),
                description: 'Taste authentic local cuisine at the best street food spots',
                duration: '4 hours',
                price: '85.00',
                currency: currency,
                category: 'Food & Drink',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'ACT003',
                name: 'River Cruise',
                city: getDestinationCity(destination),
                description: 'Scenic boat ride with dinner and city skyline views',
                duration: '2.5 hours',
                price: '120.00',
                currency: currency,
                category: 'Sightseeing',
                imageUrl: 'https://via.placeholder.com/300x200'
            },
            {
                id: 'ACT004',
                name: 'Temple & Museum Tour',
                city: getDestinationCity(destination),
                description: 'Visit ancient temples and learn about local history',
                duration: '5 hours',
                price: '95.00',
                currency: currency,
                category: 'Cultural',
                imageUrl: 'https://via.placeholder.com/300x200'
            }
        );
    }

    console.log('📊 Returning activities:', mockActivities.length, 'activities for city filter:', cityFilter);
    
    // Return activities array directly (not wrapped in object)
    res.json(mockActivities);
});

// Mock best dates endpoint
app.get('/api/best-dates', (req, res) => {
    console.log('📅 Best dates search request:', req.query);
    
    const { destination = 'kuala-lumpur', month1 = '2025-10', month2 = '2025-11', travelers = '2', currency = 'MYR' } = req.query;
    
    let mockDateRanges = [];
    
    if (destination === 'hoi-an-da-nang') {
        // 5-night packages for Hoi An (2N) + Da Nang (3N) from Penang
        mockDateRanges = [
            {
                id: 'bd-hoi-1',
                startDate: '2025-10-15',
                endDate: '2025-10-20',
                duration: 5,
                pricePerPerson: 850,
                totalPrice: 1700,
                currency: currency,
                flightPrice: 420, // AirAsia from Penang
                hotelPrice: 430, // Mixed Hoi An + Da Nang hotels
                savings: 20,
                isRecommended: true,
                isDealOfTheDay: false
            },
            {
                id: 'bd-hoi-2',
                startDate: '2025-10-22',
                endDate: '2025-10-27',
                duration: 5,
                pricePerPerson: 920,
                totalPrice: 1840,
                currency: currency,
                flightPrice: 465, // Vietnam Airlines from Penang
                hotelPrice: 455,
                savings: 15,
                isRecommended: false,
                isDealOfTheDay: true
            },
            {
                id: 'bd-hoi-3',
                startDate: '2025-11-05',
                endDate: '2025-11-10',
                duration: 5,
                pricePerPerson: 795,
                totalPrice: 1590,
                currency: currency,
                flightPrice: 420, // AirAsia from Penang
                hotelPrice: 375,
                savings: 25,
                isRecommended: true,
                isDealOfTheDay: false
            },
            {
                id: 'bd-hoi-4',
                startDate: '2025-11-12',
                endDate: '2025-11-17',
                duration: 5,
                pricePerPerson: 880,
                totalPrice: 1760,
                currency: currency,
                flightPrice: 465, // Vietnam Airlines from Penang
                hotelPrice: 415,
                savings: 18,
                isRecommended: false,
                isDealOfTheDay: false
            }
        ];
    } else {
        // Default 7-night packages for other destinations from Penang
        mockDateRanges = [
            {
                id: 'bd-1',
                startDate: '2025-10-15',
                endDate: '2025-10-22',
                duration: 7,
                pricePerPerson: 715,
                totalPrice: 1430,
                currency: currency,
                flightPrice: 350, // AirAsia from Penang
                hotelPrice: 365,
                savings: 25,
                isRecommended: true,
                isDealOfTheDay: false
            },
            {
                id: 'bd-2',
                startDate: '2025-10-22',
                endDate: '2025-10-29',
                duration: 7,
                pricePerPerson: 805,
                totalPrice: 1610,
                currency: currency,
                flightPrice: 485, // Malaysia Airlines from Penang
                hotelPrice: 320,
                savings: 15,
                isRecommended: false,
                isDealOfTheDay: true
            },
            {
                id: 'bd-3',
                startDate: '2025-11-05',
                endDate: '2025-11-12',
                duration: 7,
                pricePerPerson: 655,
                totalPrice: 1310,
                currency: currency,
                flightPrice: 320, // Firefly from Penang
                hotelPrice: 335,
                savings: 30,
                isRecommended: true,
                isDealOfTheDay: false
            },
            {
                id: 'bd-4',
                startDate: '2025-11-12',
                endDate: '2025-11-19',
                duration: 7,
                pricePerPerson: 735,
                totalPrice: 1470,
                currency: currency,
                flightPrice: 400, // Average from Penang
                hotelPrice: 335,
                savings: 20,
                isRecommended: false,
                isDealOfTheDay: false
            }
        ];
    }

    const averagePrice = Math.round(mockDateRanges.reduce((sum, range) => sum + range.pricePerPerson, 0) / mockDateRanges.length);

    const response = {
        results: mockDateRanges,
        searchCriteria: {
            destination: destination,
            month1: month1,
            month2: month2,
            travelers: parseInt(travelers),
            currency: currency
        },
        averagePrice: averagePrice,
        currency: currency
    };

    res.json(response);
});

app.listen(port, () => {
    console.log(`✅ Enhanced server running on http://localhost:${port}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET / - API information`);
    console.log(`   GET /api/health - Health check`);
    console.log(`   GET /api/flights - Flight search`);
    console.log(`   GET /api/flights/search - Flight search (alternative)`);
    console.log(`   GET /api/hotels - Hotel search`);
    console.log(`   GET /api/best-dates - Best travel dates`);
});

console.log("📝 Enhanced server setup complete");

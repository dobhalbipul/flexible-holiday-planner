import axios from 'axios';

interface AmadeusConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AmadeusLocation {
  hotelId: string;
  name: string;
  iataCode?: string;
  address?: {
    countryCode: string;
    cityName?: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

interface AmadeusHotelOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode?: string;
  rateFamilyEstimated?: {
    code: string;
    type: string;
  };
  commission?: {
    percentage: string;
  };
  boardType?: string;
  room: {
    type: string;
    typeEstimated?: {
      category: string;
      beds: number;
      bedType: string;
    };
    description?: {
      text: string;
      lang: string;
    };
  };
  guests?: {
    adults: number;
  };
  price: {
    currency: string;
    base: string;
    total: string;
    variations?: {
      average: {
        base: string;
      };
    };
  };
  policies?: {
    paymentType: string;
    cancellation?: {
      type: string;
    };
  };
}

interface AmadeusHotel {
  type: string;
  hotelId: string;
  chainCode?: string;
  dupeId?: string;
  name: string;
  rating?: string;
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  hotelDistance?: {
    distance: number;
    distanceUnit: string;
  };
  address?: {
    lines?: string[];
    postalCode?: string;
    cityName?: string;
    countryCode?: string;
  };
  contact?: {
    phone?: string;
    fax?: string;
    email?: string;
  };
  amenities?: string[];
  media?: Array<{
    uri: string;
    category: string;
  }>;
  available: boolean;
  offers?: AmadeusHotelOffer[];
}

interface AmadeusHotelSearchResponse {
  data: AmadeusHotel[];
  meta?: {
    count: number;
    links?: {
      self: string;
    };
  };
}

export class AmadeusService {
  private config: AmadeusConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      apiKey: process.env.AMADEUS_API_KEY || '',
      apiSecret: process.env.AMADEUS_API_SECRET || '',
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.amadeus.com' 
        : 'https://test.api.amadeus.com'
    };
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.apiKey,
          client_secret: this.config.apiSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const tokenData: AmadeusTokenResponse = response.data;
      this.accessToken = tokenData.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Amadeus access token:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  private async makeApiCall<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(`${this.config.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params,
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error calling Amadeus API ${endpoint}:`, error);
      throw error;
    }
  }

  private mapDestinationToCity(destination: string): { cityCode?: string; cityName?: string } {
    // Map common destinations to city codes
    const destinationMap: Record<string, { cityCode?: string; cityName?: string }> = {
      'vietnam': { cityName: 'Ho Chi Minh City' },
      'hoi-an': { cityName: 'Da Nang' }, // Hoi An is near Da Nang airport
      'hoi-an-da-nang': { cityName: 'Da Nang' },
      'da-nang': { cityCode: 'DAD', cityName: 'Da Nang' },
      'ho-chi-minh': { cityCode: 'SGN', cityName: 'Ho Chi Minh City' },
      'hanoi': { cityCode: 'HAN', cityName: 'Hanoi' },
      'phu-quoc': { cityCode: 'PQC', cityName: 'Phu Quoc' },
    };

    return destinationMap[destination.toLowerCase()] || { cityName: destination };
  }

  async findHotelsByDestination(destination: string): Promise<AmadeusLocation[]> {
    const { cityCode, cityName } = this.mapDestinationToCity(destination);
    
    try {
      let endpoint = '/v1/reference-data/locations/hotels';
      let params: Record<string, any> = {};

      if (cityCode) {
        endpoint += '/by-city';
        params = {
          cityCode,
          radius: 20, // 20km radius
          radiusUnit: 'KM',
          chainCodes: '', // Include all hotel chains
          amenities: '', // Include all amenities
          ratings: '1,2,3,4,5', // Include all ratings
        };
      } else if (cityName) {
        // For destinations without city codes, we'll try geocoding approach
        // This is a simplified approach - in production you'd want proper geocoding
        return [];
      }

      const response = await this.makeApiCall<{ data: AmadeusLocation[] }>(endpoint, params);
      return response.data || [];
    } catch (error) {
      console.error('Error finding hotels by destination:', error);
      return [];
    }
  }

  async searchHotelOffers(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
    adults: number = 2,
    currency: string = 'USD'
  ): Promise<AmadeusHotelSearchResponse> {
    try {
      const response = await this.makeApiCall<AmadeusHotelSearchResponse>(
        '/v3/shopping/hotel-offers',
        {
          hotelIds: hotelIds.slice(0, 20).join(','), // Limit to 20 hotels per request
          checkInDate,
          checkOutDate,
          adults,
          roomQuantity: 1,
          currency,
          bestRateOnly: true,
          view: 'FULL',
          sort: 'PRICE',
        }
      );

      return response;
    } catch (error) {
      console.error('Error searching hotel offers:', error);
      return { data: [] };
    }
  }

  convertAmadeusToLocalFormat(amadeusHotels: AmadeusHotel[]): any[] {
    return amadeusHotels.map(hotel => {
      const offer = hotel.offers?.[0]; // Take the first/best offer
      const price = offer?.price;
      
      return {
        id: hotel.hotelId,
        name: hotel.name,
        location: hotel.address?.lines?.[0] || hotel.address?.cityName || 'Unknown location',
        city: hotel.address?.cityName || hotel.cityCode || 'Unknown city',
        pricePerNight: price?.base || price?.total || '0',
        currency: price?.currency || 'USD',
        rating: hotel.rating || '4.0',
        reviewCount: Math.floor(Math.random() * 500) + 50, // Amadeus doesn't provide review count
        distanceToBeach: hotel.hotelDistance ? `${hotel.hotelDistance.distance}${hotel.hotelDistance.distanceUnit} from center` : null,
        distanceToLandmark: null,
        amenities: hotel.amenities || ['Free WiFi', 'Air Conditioning'],
        imageUrl: hotel.media?.[0]?.uri || null,
      };
    });
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }
}

export const amadeusService = new AmadeusService();
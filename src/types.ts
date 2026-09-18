export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  homeCurrency: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'sightseeing' | 'food' | 'activity' | 'relaxation' | 'travel';
  locationName: string;
  lat: number;
  lng: number;
  estimatedCost: number;
  isCompleted?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  theme: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  category: 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'medical' | 'other';
  name: string;
  packed: boolean;
  isAiSuggested?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping' | 'other';
  paidBy: string; // name or user id
  splitAmong: string[]; // list of names
  date: string;
}

export interface FoodRecommendation {
  id: string;
  name: string;
  type: 'dish' | 'restaurant' | 'market';
  cuisine: string;
  description: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  locationName: string;
  lat: number;
  lng: number;
  dietaryTags: string[];
}

export interface EmergencyContact {
  type: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface HiddenGem {
  id: string;
  title: string;
  category: 'viewpoint' | 'nature' | 'culture' | 'cafe' | 'secret';
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  bestTimeToVisit: string;
  localTip: string;
}

export interface WeatherDay {
  date: string;
  dayName: string;
  tempHighC: number;
  tempLowC: number;
  condition: string;
  iconName: string;
  advice: string;
}

export interface HotelRecommendation {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'hostel' | 'boutique' | 'apartment';
  rating: number;
  pricePerNight: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  highlights: string[];
  imageUrl?: string;
  bookingUrl?: string;
}

export interface BudgetBreakdown {
  lodging: number;
  food: number;
  activities: number;
  transport: number;
  shopping: number;
  misc: number;
}

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  totalBudget: number;
  currency: string;
  travelerType: 'solo' | 'couple' | 'family' | 'friends';
  travelersCount: number;
  travelerNames: string[];
  interests: string[];
  coverImageUrl?: string;
  summary: string;
  itinerary: ItineraryDay[];
  packingList: PackingItem[];
  expenses: Expense[];
  foodRecommendations: FoodRecommendation[];
  hotelRecommendations?: HotelRecommendation[];
  budgetBreakdown?: BudgetBreakdown;
  emergencyContacts: EmergencyContact[];
  hiddenGems: HiddenGem[];
  weatherForecast: WeatherDay[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

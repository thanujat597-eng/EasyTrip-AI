import { Trip } from '../types';

export const SAMPLE_TRIP: Trip = {
  id: 'sample-tokyo-1',
  userId: 'demo-user',
  destination: 'Tokyo',
  country: 'Japan',
  startDate: '2026-09-10',
  endDate: '2026-09-15',
  durationDays: 5,
  budgetLevel: 'moderate',
  totalBudget: 150000,
  currency: 'INR',
  travelerType: 'couple',
  travelersCount: 2,
  travelerNames: ['Alex', 'Jordan'],
  interests: ['sightseeing', 'food', 'culture', 'shopping'],
  coverImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
  summary: 'An unforgettable 5-day journey through Tokyo combining historic Senso-ji shrine, high-tech Akihabara, savory ramen alleys, and serene Meiji Jingu gardens.',
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
  itinerary: [
    {
      dayNumber: 1,
      theme: 'Historic Asakusa & Sumida River Cruise',
      activities: [
        {
          id: 'act-101',
          time: '09:00 AM',
          title: 'Explore Senso-ji Temple & Nakamise Shopping Street',
          description: 'Walk under the Kaminarimon Thunder Gate, taste traditional rice crackers, and soak in Tokyo’s oldest Buddhist temple atmosphere.',
          category: 'sightseeing',
          locationName: 'Asakusa, Taito City, Tokyo',
          lat: 35.7148,
          lng: 139.7967,
          estimatedCost: 15,
          isCompleted: true
        },
        {
          id: 'act-102',
          time: '01:00 PM',
          title: 'Lunch at Asakusa Unagi & Tempura Hall',
          description: 'Savor crispy seasonal seafood tempura and traditional grilled eel over steamed rice.',
          category: 'food',
          locationName: 'Nakamise Street, Asakusa',
          lat: 35.7128,
          lng: 139.7960,
          estimatedCost: 30,
          isCompleted: true
        },
        {
          id: 'act-103',
          time: '04:00 PM',
          title: 'Tokyo Skytree Observation Deck',
          description: 'Ascend 450 meters for unmatched 360-degree views of the sprawling Tokyo skyline.',
          category: 'activity',
          locationName: 'Tokyo Skytree, Sumida City',
          lat: 35.7101,
          lng: 139.8107,
          estimatedCost: 25,
          isCompleted: false
        }
      ]
    },
    {
      dayNumber: 2,
      theme: 'Pop Culture Akihabara & Nightlife in Shinjuku',
      activities: [
        {
          id: 'act-201',
          time: '10:00 AM',
          title: 'Akihabara Electric Town & Retro Gaming',
          description: 'Discover multi-floor arcades, rare anime collectibles, and futuristic tech stores.',
          category: 'activity',
          locationName: 'Akihabara Station Area, Chiyoda',
          lat: 35.6984,
          lng: 139.7731,
          estimatedCost: 40,
          isCompleted: false
        },
        {
          id: 'act-202',
          time: '02:00 PM',
          title: 'Rich Tonkotsu Ramen Tasting at Ichiran',
          description: 'Custom-tailor your solo ramen booth bowl with velvety pork bone broth.',
          category: 'food',
          locationName: 'Shinjuku East Exit, Tokyo',
          lat: 35.6912,
          lng: 139.7025,
          estimatedCost: 15,
          isCompleted: false
        },
        {
          id: 'act-203',
          time: '07:30 PM',
          title: 'Shinjuku Omoide Yokocho Yakitori Alleys',
          description: 'Dine under red lanterns in nostalgic narrow alleyways tasting grilled skewers and plum wine.',
          category: 'relaxation',
          locationName: 'Omoide Yokocho, Nishi-Shinjuku',
          lat: 35.6931,
          lng: 139.6994,
          estimatedCost: 35,
          isCompleted: false
        }
      ]
    }
  ],
  packingList: [
    { id: 'p1', category: 'documents', name: 'Passport & Visit Japan Web QR Code', packed: true, isAiSuggested: true },
    { id: 'p2', category: 'electronics', name: 'Suica/Pasmo Card & Pocket WiFi Unit', packed: true, isAiSuggested: true },
    { id: 'p3', category: 'clothing', name: 'Slip-on comfortable walking shoes', packed: true, isAiSuggested: true },
    { id: 'p4', category: 'clothing', name: 'Light jacket & foldable umbrella', packed: false, isAiSuggested: true },
    { id: 'p5', category: 'toiletries', name: 'Small coin pouch & hand towel', packed: false, isAiSuggested: true }
  ],
  expenses: [
    {
      id: 'e1',
      title: 'Skytree Express Tickets',
      amount: 50,
      category: 'activities',
      paidBy: 'Alex',
      splitAmong: ['Alex', 'Jordan'],
      date: '2026-09-10'
    },
    {
      id: 'e2',
      title: 'Airport Limousine Bus Pass',
      amount: 60,
      category: 'transport',
      paidBy: 'Jordan',
      splitAmong: ['Alex', 'Jordan'],
      date: '2026-09-10'
    }
  ],
  foodRecommendations: [
    {
      id: 'f1',
      name: 'Fuunji Tsukemen Dip Noodles',
      type: 'restaurant',
      cuisine: 'Ramen / Noodles',
      description: 'Famous for rich seafood and pork dip noodles with chewy homemade ramen.',
      priceRange: '$$',
      locationName: 'Yoyogi, Shibuya City',
      lat: 35.6870,
      lng: 139.6980,
      dietaryTags: ['Local Legend', 'Comfort Food']
    },
    {
      id: 'f2',
      name: 'Daiwa Sushi at Toyosu Market',
      type: 'restaurant',
      cuisine: 'Fresh Seafood / Omase',
      description: 'Ultra-fresh morning sushi set directly from the auction floor.',
      priceRange: '$$$',
      locationName: 'Toyosu Market, Koto City',
      lat: 35.6465,
      lng: 139.7820,
      dietaryTags: ['Fresh Seafood', 'Morning Specialty']
    }
  ],
  emergencyContacts: [
    { type: 'Police', name: 'Japan Police Emergency', phone: '110', notes: 'English translation support available' },
    { type: 'Ambulance & Fire', name: 'Tokyo Fire Dept', phone: '119', notes: 'Medical emergency helpline' },
    { type: 'Japan Tourist Helpline', name: 'JNTO Visitor Hotline', phone: '050-3816-2720', notes: '24/7 Multi-language assistance' }
  ],
  hiddenGems: [
    {
      id: 'g1',
      title: 'Gotokuji Temple (Lucky Cat Temple)',
      category: 'culture',
      description: 'A peaceful suburban temple filled with thousands of white Maneki-neko beckoning cat statues.',
      locationName: 'Setagaya City, Tokyo',
      lat: 35.6493,
      lng: 139.6469,
      bestTimeToVisit: 'Weekday mornings around 10:00 AM',
      localTip: 'Take the charming retroactive Odakyu line train to Miyanosaka station.'
    }
  ],
  hotelRecommendations: [
    {
      id: 'h1',
      name: 'Trunk (Hotel) Yoyogi Park',
      type: 'boutique',
      rating: 4.8,
      pricePerNight: 12500,
      priceRange: '$$$',
      description: 'Stylish boutique stay overlooking Yoyogi Park with an infinity rooftop pool and Scandinavian design touches.',
      locationName: 'Shibuya City, Tokyo',
      lat: 35.6680,
      lng: 139.6960,
      highlights: ['Rooftop Infinity Pool', 'Park Views', 'Organic Breakfast', 'Walk to Harajuku'],
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'h2',
      name: 'Onsen Ryokan Yuen Shinjuku',
      type: 'hotel',
      rating: 4.7,
      pricePerNight: 8500,
      priceRange: '$$',
      description: 'Modern Japanese ryokan with open-air rooftop hot springs fed by Hakone spring water in central Shinjuku.',
      locationName: 'Shinjuku, Tokyo',
      lat: 35.6920,
      lng: 139.7110,
      highlights: ['Rooftop Natural Onsen', 'Tatami Flooring', 'Yukata Robes Provided', 'Quiet Neighborhood'],
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
    }
  ],
  budgetBreakdown: {
    lodging: 65000,
    food: 38000,
    activities: 22000,
    transport: 12000,
    shopping: 8000,
    misc: 5000
  },
  weatherForecast: [
    { date: 'Sep 10', dayName: 'Day 1', tempHighC: 25, tempLowC: 18, condition: 'Sunny & Pleasant', iconName: 'sun', advice: 'Ideal sight-seeing weather!' },
    { date: 'Sep 11', dayName: 'Day 2', tempHighC: 26, tempLowC: 19, condition: 'Partly Cloudy', iconName: 'cloud-sun', advice: 'Comfortable layers suggested.' },
    { date: 'Sep 12', dayName: 'Day 3', tempHighC: 23, tempLowC: 17, condition: 'Passing Showers', iconName: 'cloud-rain', advice: 'Carry a compact umbrella.' }
  ]
};

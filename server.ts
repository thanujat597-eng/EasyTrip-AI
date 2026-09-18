import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY is not configured. Falling back to default generated content.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Candidate models in order of availability and speed:
// gemini-3.1-flash-lite has the highest availability and lowest latency during peak demand spikes
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-pro-preview'];

async function generateContentWithFallback(
  gemini: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    responseMimeType?: string;
    temperature?: number;
  }
) {
  let lastError = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await gemini.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
          temperature: params.temperature ?? 0.7,
        }
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      // If 503 high demand or unavailable, silently proceed to the next fallback candidate
      const isUnavailable = err?.status === 'UNAVAILABLE' || err?.message?.includes('503') || err?.message?.includes('high demand');
      if (isUnavailable) {
        // High demand spike, fallback model will be tried immediately
      } else {
        console.warn(`Model ${model} note: ${err?.message || err}`);
      }
      // Brief pause before trying fallback model
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw lastError;
}

// Known coordinates and country lookup for major travel destinations
const KNOWN_DESTINATIONS: Record<string, { lat: number; lng: number; country: string }> = {
  paris: { lat: 48.8566, lng: 2.3522, country: 'France' },
  tokyo: { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  'new york': { lat: 40.7128, lng: -74.0060, country: 'United States' },
  rome: { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  london: { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  bali: { lat: -8.4095, lng: 115.1889, country: 'Indonesia' },
  dubai: { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates' },
  barcelona: { lat: 41.3851, lng: 2.1734, country: 'Spain' },
  switzerland: { lat: 46.8182, lng: 8.2275, country: 'Switzerland' },
  swiss: { lat: 46.8182, lng: 8.2275, country: 'Switzerland' },
  sydney: { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  kyoto: { lat: 35.0116, lng: 135.7681, country: 'Japan' },
  santorini: { lat: 36.3932, lng: 25.4615, country: 'Greece' },
  singapore: { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  bangkok: { lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  amsterdam: { lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  mumbai: { lat: 19.0760, lng: 72.8777, country: 'India' },
  delhi: { lat: 28.6139, lng: 77.2090, country: 'India' },
  goa: { lat: 15.2993, lng: 74.1240, country: 'India' },
  seoul: { lat: 37.5665, lng: 126.9780, country: 'South Korea' },
  berlin: { lat: 52.5200, lng: 13.4050, country: 'Germany' },
  venice: { lat: 45.4408, lng: 12.3155, country: 'Italy' },
  prague: { lat: 50.0755, lng: 14.4378, country: 'Czech Republic' },
  vienna: { lat: 48.2082, lng: 16.3738, country: 'Austria' },
  istanbul: { lat: 41.0082, lng: 28.9784, country: 'Turkey' },
  bangalore: { lat: 12.9716, lng: 77.5946, country: 'India' },
  chennai: { lat: 13.0827, lng: 80.2707, country: 'India' },
  madrid: { lat: 40.4168, lng: -3.7038, country: 'Spain' }
};

function getDestinationInfo(destination: string): { lat: number; lng: number; country: string } {
  const clean = destination.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_DESTINATIONS)) {
    if (clean.includes(k)) return v;
  }
  return { lat: 48.8566, lng: 2.3522, country: 'World' };
}

function calculateDefaultBudget(currency: string, budgetLevel: string, durationDays: number, estimatedBudget?: number) {
  if (estimatedBudget && estimatedBudget > 0) {
    const total = estimatedBudget;
    return {
      total,
      lodging: Math.round(total * 0.45),
      food: Math.round(total * 0.25),
      activities: Math.round(total * 0.15),
      transport: Math.round(total * 0.08),
      shopping: Math.round(total * 0.04),
      misc: Math.round(total * 0.03),
    };
  }

  const dailyUSD = budgetLevel === 'budget' ? 70 : budgetLevel === 'luxury' ? 450 : 180;
  const rates: Record<string, number> = {
    INR: 85,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 155,
    AUD: 1.55,
    CAD: 1.38,
    SGD: 1.34,
    AED: 3.67,
    THB: 35,
    USD: 1
  };
  const rate = rates[currency] || 1;
  const total = Math.round(dailyUSD * durationDays * rate);

  return {
    total,
    lodging: Math.round(total * 0.45),
    food: Math.round(total * 0.25),
    activities: Math.round(total * 0.15),
    transport: Math.round(total * 0.08),
    shopping: Math.round(total * 0.04),
    misc: Math.round(total * 0.03),
  };
}

function createDefaultTripPlan({
  destination,
  durationDays = 3,
  budgetLevel = 'moderate',
  estimatedBudget,
  travelerType = 'solo',
  currency = 'INR'
}: any) {
  const destInfo = getDestinationInfo(destination);
  const budget = calculateDefaultBudget(currency, budgetLevel, durationDays, estimatedBudget);
  const daysCount = Math.max(1, Math.min(Number(durationDays) || 3, 14));

  const dayThemes = [
    'Historic City Center & Cultural Immersion',
    'Iconic Landmarks & Panoramic Viewpoints',
    'Local Gastronomy & Artisanal Markets',
    'Hidden Gems & Quiet Natural Retreats',
    'Arts, Architecture & Waterfront Walk',
    'Neighborhood Heritage & Sunset Stroll',
    'Farewell Highlights & Leisure Excursions'
  ];

  const itinerary = Array.from({ length: daysCount }, (_, i) => {
    const dayNum = i + 1;
    const theme = dayThemes[i % dayThemes.length];
    const offset = i * 0.006;
    const actCost = Math.round((budget.activities / (daysCount * 4)) || 15);

    return {
      dayNumber: dayNum,
      theme,
      activities: [
        {
          time: '09:00 AM',
          title: `Discover ${destination} Historic Quarter`,
          description: `Morning walking exploration through ${destination}'s most celebrated streetscapes, landmarks, and architecture.`,
          category: 'sightseeing',
          locationName: `Old Town Center, ${destination}`,
          lat: Number((destInfo.lat + offset).toFixed(4)),
          lng: Number((destInfo.lng + offset).toFixed(4)),
          estimatedCost: actCost
        },
        {
          time: '01:00 PM',
          title: 'Signature Regional Lunch Tasting',
          description: 'Experience authentic regional gastronomy and fresh seasonal delicacies at a top-rated local dining hall.',
          category: 'food',
          locationName: `Traditional Market Hall, ${destination}`,
          lat: Number((destInfo.lat + offset + 0.003).toFixed(4)),
          lng: Number((destInfo.lng + offset + 0.002).toFixed(4)),
          estimatedCost: Math.round(actCost * 1.5)
        },
        {
          time: '04:00 PM',
          title: 'Panoramic Viewpoint & Cultural Landmark',
          description: 'Enjoy breathtaking skyline views, explore historic gardens, and capture iconic travel photography.',
          category: 'activity',
          locationName: `Skyline Viewpoint, ${destination}`,
          lat: Number((destInfo.lat + offset - 0.004).toFixed(4)),
          lng: Number((destInfo.lng + offset + 0.004).toFixed(4)),
          estimatedCost: actCost
        },
        {
          time: '07:30 PM',
          title: 'Evening Dining & Twilight Stroll',
          description: 'Relax with artisanal dining, regional wine or tea, and stroll through illuminated night avenues.',
          category: 'relaxation',
          locationName: `Riverside Promenade, ${destination}`,
          lat: Number((destInfo.lat + offset + 0.001).toFixed(4)),
          lng: Number((destInfo.lng + offset - 0.003).toFixed(4)),
          estimatedCost: Math.round(actCost * 1.8)
        }
      ]
    };
  });

  return {
    destination,
    country: destInfo.country,
    summary: `A carefully tailored ${daysCount}-day itinerary in ${destination}, crafted for a ${travelerType} trip with a ${budgetLevel} budget. Experience top architectural landmarks, authentic regional cuisine, and local hidden treasures.`,
    approxLatitude: destInfo.lat,
    approxLongitude: destInfo.lng,
    totalBudgetEstimate: budget.total,
    itinerary,
    packingList: [
      { category: 'clothing', name: 'Comfortable walking and hiking shoes', isAiSuggested: true },
      { category: 'clothing', name: 'Breathable weather-appropriate layers', isAiSuggested: true },
      { category: 'clothing', name: 'Smart-casual evening dinner attire', isAiSuggested: true },
      { category: 'electronics', name: 'Universal power adapter & power bank', isAiSuggested: true },
      { category: 'documents', name: 'Passport, travel insurance & digital boarding passes', isAiSuggested: true },
      { category: 'toiletries', name: 'Sunscreen, hydration balm & refillable water bottle', isAiSuggested: true },
      { category: 'medical', name: 'Basic travel first-aid & personal medication kit', isAiSuggested: true }
    ],
    foodRecommendations: [
      {
        name: `Authentic ${destination} Signature Platter`,
        type: 'dish',
        cuisine: 'Traditional Regional',
        description: 'Iconic classic dish slow-cooked with authentic regional herbs, spices, and fresh ingredients.',
        priceRange: '$$',
        locationName: `Historic Market Square, ${destination}`,
        lat: destInfo.lat,
        lng: destInfo.lng,
        dietaryTags: ['Traditional', 'Local Specialty']
      },
      {
        name: 'Artisanal Cafe & Bakery',
        type: 'restaurant',
        cuisine: 'Cafe & Patisserie',
        description: 'Renowned for fresh morning espresso, delicate pastries, and vibrant courtyard seating.',
        priceRange: '$',
        locationName: `Old Quarter, ${destination}`,
        lat: Number((destInfo.lat + 0.003).toFixed(4)),
        lng: Number((destInfo.lng + 0.002).toFixed(4)),
        dietaryTags: ['Vegetarian Options', 'Organic']
      },
      {
        name: 'Heritage Bistro & Wine Bar',
        type: 'restaurant',
        cuisine: 'Boutique Farm-to-Table',
        description: 'Seasonal tasting menus featuring organic local ingredients and curated regional wines.',
        priceRange: '$$$',
        locationName: `Cultural District, ${destination}`,
        lat: Number((destInfo.lat - 0.002).toFixed(4)),
        lng: Number((destInfo.lng + 0.003).toFixed(4)),
        dietaryTags: ['Locally Sourced', 'Gluten-Free Options']
      },
      {
        name: 'Night Street Food Stalls',
        type: 'market',
        cuisine: 'Street Food & Snacks',
        description: 'Vibrant evening open-air bazaar bustling with authentic skewers, noodles, and sweets.',
        priceRange: '$',
        locationName: `Night Market Promenade, ${destination}`,
        lat: Number((destInfo.lat + 0.005).toFixed(4)),
        lng: Number((destInfo.lng - 0.004).toFixed(4)),
        dietaryTags: ['Local Favorite', 'Quick Bite']
      }
    ],
    emergencyContacts: [
      { type: 'Police & Security', name: 'Emergency Dispatch', phone: '112 / 911', notes: '24/7 Universal emergency assistance' },
      { type: 'Medical Hospital', name: 'Central University Hospital', phone: '+1 800-555-0199', notes: 'Emergency Trauma & English Support' },
      { type: 'Tourist Information', name: 'Official Visitor Information Bureau', phone: '+1 800-555-0100', notes: 'Multi-lingual tourist aid & maps' }
    ],
    hiddenGems: [
      {
        title: 'Secret Panoramic Hill',
        category: 'viewpoint',
        description: 'A tranquil viewpoint tucked behind pine gardens with stunning golden hour views over the city.',
        locationName: `North View Ridge, ${destination}`,
        lat: Number((destInfo.lat + 0.007).toFixed(4)),
        lng: Number((destInfo.lng + 0.008).toFixed(4)),
        bestTimeToVisit: '1 hour before sunset',
        localTip: 'Bring a light jacket and camera for golden hour reflections.'
      },
      {
        title: 'Historic Courtyard Tea Garden',
        category: 'secret',
        description: 'A peaceful hidden courtyard dating back over a century with tranquil water fountains.',
        locationName: `Old Quarter Alleys, ${destination}`,
        lat: Number((destInfo.lat - 0.003).toFixed(4)),
        lng: Number((destInfo.lng - 0.005).toFixed(4)),
        bestTimeToVisit: 'Mid-afternoon (3 PM - 5 PM)',
        localTip: 'Order the house-special herbal infusion and honey cake.'
      },
      {
        title: 'Artisan Workshop Lane',
        category: 'culture',
        description: 'A cobblestone lane where master ceramicists, leatherworkers, and weavers work with open doors.',
        locationName: `Crafts Quarter, ${destination}`,
        lat: Number((destInfo.lat + 0.004).toFixed(4)),
        lng: Number((destInfo.lng + 0.006).toFixed(4)),
        bestTimeToVisit: 'Morning (10 AM - 1 PM)',
        localTip: 'Great spot for handmade, authentic souvenirs without tourist markups.'
      }
    ],
    hotelRecommendations: [
      {
        name: `Grand Central Boutique Hotel`,
        type: 'boutique',
        rating: 4.8,
        pricePerNight: Math.round(budget.lodging / daysCount * 0.9),
        priceRange: '$$',
        description: `A charming hotel centrally located in ${destination} featuring luxury bedding and rooftop skyline views.`,
        locationName: `Downtown District, ${destination}`,
        lat: destInfo.lat,
        lng: destInfo.lng,
        highlights: ['Central Location', 'Free Breakfast', 'Rooftop Bar'],
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: `Serene Garden Heritage Resort`,
        type: 'resort',
        rating: 4.9,
        pricePerNight: Math.round(budget.lodging / daysCount * 1.2),
        priceRange: '$$$',
        description: `Tranquil oasis featuring full spa amenities, courtyard fountains, and spacious designer suites.`,
        locationName: `Riverside Promenade, ${destination}`,
        lat: Number((destInfo.lat + 0.004).toFixed(4)),
        lng: Number((destInfo.lng + 0.003).toFixed(4)),
        highlights: ['Spa & Wellness', 'Garden Views', 'Gourmet Breakfast'],
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
      }
    ],
    budgetBreakdown: {
      lodging: budget.lodging,
      food: budget.food,
      activities: budget.activities,
      transport: budget.transport,
      shopping: budget.shopping,
      misc: budget.misc
    },
    weatherForecast: Array.from({ length: Math.min(daysCount, 7) }, (_, idx) => {
      const temps = [
        { high: 24, low: 16, cond: 'Sunny & Pleasant', icon: 'sun', advice: 'Ideal for walking and open-air sights.' },
        { high: 25, low: 17, cond: 'Clear Skies', icon: 'sun', advice: 'Sun protection and hydration advised.' },
        { high: 22, low: 15, cond: 'Partly Cloudy', icon: 'cloud-sun', advice: 'Great photography lighting.' },
        { high: 21, low: 14, cond: 'Mild Breeze', icon: 'wind', advice: 'Light jacket comfortable in the evening.' },
        { high: 23, low: 15, cond: 'Warm & Sunny', icon: 'sun', advice: 'Perfect for terrace lunches.' },
        { high: 20, low: 13, cond: 'Gentle Showers', icon: 'cloud-rain', advice: 'Carry a compact umbrella.' },
        { high: 22, low: 14, cond: 'Fair & Fresh', icon: 'cloud-sun', advice: 'Clear skies for sunset viewing.' }
      ];
      const t = temps[idx % temps.length];
      return {
        date: `Day ${idx + 1}`,
        dayName: `Day ${idx + 1}`,
        tempHighC: t.high,
        tempLowC: t.low,
        condition: t.cond,
        iconName: t.icon,
        advice: t.advice
      };
    })
  };
}
function parseGeminiJson<T>(text: string, fallback: T): T {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Error parsing JSON from Gemini response:', err, text);
    return fallback;
  }
}

// Destination cover image generator helper
function getDestinationCoverUrl(destination: string): string {
  const cleanDest = destination.split(',')[0].trim().toLowerCase();
  const knownImages: Record<string, string> = {
    paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    swiss: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  };

  for (const [key, url] of Object.entries(knownImages)) {
    if (cleanDest.includes(key)) return url;
  }
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Helper to map language code to language name
  const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    ml: 'Malayalam',
    te: 'Telugu',
    kn: 'Kannada',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    ja: 'Japanese'
  };

  // 1. Generate Full AI Trip Endpoint
  app.post('/api/generate-trip', async (req, res) => {
    const {
      destination,
      startDate,
      endDate,
      durationDays = 3,
      budgetLevel = 'moderate',
      estimatedBudget,
      travelerType = 'solo',
      travelersCount = 1,
      interests = ['sightseeing', 'food'],
      currency = 'INR',
      language = 'en'
    } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const targetLangName = LANGUAGE_NAMES[language] || 'English';
    const gemini = getGeminiClient();

    const systemInstruction = `You are an expert AI Travel Planner. Generate a comprehensive travel plan for a trip to "${destination}".
Return strictly valid JSON matching this exact structure with realistic coordinates, costs, and details. Do NOT wrap in markdown or commentary outside the JSON.

Expected JSON Structure:
{
  "destination": "${destination}",
  "country": "Country Name",
  "summary": "2-3 sentence engaging summary of this trip itinerary.",
  "approxLatitude": 48.8566,
  "approxLongitude": 2.3522,
  "totalBudgetEstimate": 1500,
  "itinerary": [
    {
      "dayNumber": 1,
      "theme": "Day theme (e.g., Historic City Center & Welcome Feast)",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity Title",
          "description": "Engaging description with tips",
          "category": "sightseeing|food|activity|relaxation|travel",
          "locationName": "Specific location or address",
          "lat": 48.8584,
          "lng": 2.2945,
          "estimatedCost": 25
        }
      ]
    }
  ],
  "packingList": [
    { "category": "clothing|toiletries|electronics|documents|medical|other", "name": "Item name", "isAiSuggested": true }
  ],
  "foodRecommendations": [
    {
      "name": "Local Dish or Restaurant Name",
      "type": "dish|restaurant|market",
      "cuisine": "Local Cuisine",
      "description": "Why try it & details",
      "priceRange": "$|$$|$$$|$$$$",
      "locationName": "Neighborhood/Address",
      "lat": 48.8566,
      "lng": 2.3522,
      "dietaryTags": ["Vegetarian", "Gluten-Free"]
    }
  ],
  "emergencyContacts": [
    { "type": "Police", "name": "Local Police", "phone": "112", "notes": "Emergency assistance" },
    { "type": "Ambulance", "name": "Medical Emergency", "phone": "112", "notes": "Medical services" },
    { "type": "Tourist Helpline", "name": "Tourist Information", "phone": "+1 800-123-4567", "notes": "24/7 Helpline" }
  ],
  "hiddenGems": [
    {
      "title": "Secret Garden / Scenic Spot",
      "category": "viewpoint|nature|culture|cafe|secret",
      "description": "Unique off-the-beaten-path description",
      "locationName": "Specific location name",
      "lat": 48.8566,
      "lng": 2.3522,
      "bestTimeToVisit": "Early morning or sunset",
      "localTip": "Pro tip for visitors"
    }
  ],
  "hotelRecommendations": [
    {
      "name": "Hotel Name",
      "type": "hotel|resort|hostel|boutique|apartment",
      "rating": 4.8,
      "pricePerNight": 180,
      "priceRange": "$|$$|$$$|$$$$",
      "description": "Why stay here & key features",
      "locationName": "Neighborhood/Area",
      "lat": 48.8566,
      "lng": 2.3522,
      "highlights": ["Rooftop Pool", "Free Breakfast", "Great Location"],
      "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
    }
  ],
  "budgetBreakdown": {
    "lodging": 750,
    "food": 350,
    "activities": 200,
    "transport": 100,
    "shopping": 50,
    "misc": 50
  },
  "weatherForecast": [
    {
      "date": "Day 1",
      "dayName": "Day 1",
      "tempHighC": 24,
      "tempLowC": 16,
      "condition": "Sunny",
      "iconName": "sun",
      "advice": "Light clothing and sunscreen recommended."
    }
  ]
}`;

    const prompt = `Plan a ${durationDays}-day trip to ${destination} for ${travelersCount} ${travelerType} traveler(s).
Budget Level: ${budgetLevel} ${estimatedBudget ? `(Target Budget: ${currency} ${estimatedBudget})` : ''}.
Interests: ${interests.join(', ')}.
Travel Dates: ${startDate || 'Upcoming'} to ${endDate || 'Upcoming'}.
Currency Code: ${currency}.

IMPORTANT LANGUAGE INSTRUCTION:
Generate ALL content string values (summary, day theme, activity title, activity description, packing list item names, food names/descriptions, hidden gem titles/descriptions, weather advice) in ${targetLangName} language (${language}). Keep the JSON keys in English, but translate the string content into ${targetLangName}.

IMPORTANT CURRENCY INSTRUCTION:
All numerical estimates (totalBudgetEstimate, activity estimatedCost, hotel pricePerNight, budgetBreakdown lodging/food/activities/transport/shopping/misc) MUST be given in ${currency}. Ensure realistic values suited to ${currency} (e.g. if currency is INR, a total budget of 50000 to 150000 INR; if USD, 800 to 3000 USD).

Provide:
- A day-by-day itinerary (${durationDays} days) with 3-4 distinct activities per day (morning, afternoon, evening) with real approximate latitude and longitude coordinates.
- A recommended packing list tailored to ${destination} and climate.
- 4 authentic food/dish/restaurant recommendations.
- 3 hidden gems or local secret spots.
- Local emergency contact information.
- A multi-day weather forecast outlook.`;

    let tripData: any = null;

    if (gemini) {
      try {
        const response = await generateContentWithFallback(gemini, {
          contents: prompt,
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        });

        const text = response.text || '';
        tripData = parseGeminiJson(text, null);
      } catch (error) {
        console.warn('Gemini AI trip generation failed or hit high demand. Falling back to local trip generator:', error);
      }
    }

    if (!tripData) {
      tripData = createDefaultTripPlan({
        destination,
        durationDays,
        budgetLevel,
        estimatedBudget,
        travelerType,
        travelersCount,
        interests,
        currency,
        language
      });
    }

    return res.json({
      ...tripData,
      coverImageUrl: tripData.coverImageUrl || getDestinationCoverUrl(destination)
    });
  });

  // 2. Multi-turn AI Travel Assistant Chatbot Endpoint
  app.post('/api/chat', async (req, res) => {
    const { messages, tripContext, language = 'en' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const targetLangName = LANGUAGE_NAMES[language] || 'English';
    const gemini = getGeminiClient();

    const systemInstruction = `You are "EasyTrip AI", a friendly, knowledgeable, and helpful travel companion assistant.
${tripContext ? `Current trip context: Destination ${tripContext.destination}, ${tripContext.durationDays} days trip, Budget: ${tripContext.budgetLevel}.` : ''}
Provide helpful, concise, well-formatted answers about travel advice, tipping, packing, local customs, translations, safety tips, and itineraries.
Keep your responses friendly, scannable, with clear bullet points where appropriate. Use bullet points and bold text for key places or tips.
CRITICAL LANGUAGE REQUIREMENT: Always respond in the ${targetLangName} (${language}) language.`;

    if (gemini) {
      try {
        const contents = messages.map((m: { sender: string; text: string }) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        const response = await generateContentWithFallback(gemini, {
          contents,
          systemInstruction,
          temperature: 0.7,
        });

        return res.json({
          reply: response.text || 'I am here to assist with your travel planning!',
          suggestedActions: ['Suggest local hidden gems', 'Recommend evening restaurants', 'Tipping etiquette tips']
        });
      } catch (error) {
        console.warn('Chat generation failed with Gemini fallback models, using contextual fallback:', error);
      }
    }

    const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
    let responseText = `I'm happy to help with your trip! Here are some quick tips for your journey:\n\n• **Local Customs**: Always carry small cash for local markets and public transit.\n• **Safety**: Keep digital copies of your passport and travel documents.\n• **Budget**: Try eating at local food halls during lunch for delicious, affordable meals!`;

    if (lastUserMsg.includes('tipping') || lastUserMsg.includes('tip')) {
      responseText = `Tipping etiquette varies by region!\n\n• **USA / Canada**: 15% - 20% at restaurants.\n• **Europe**: Rounding up or leaving 5-10% for good service.\n• **Japan / South Korea**: Tipping is generally not expected and can sometimes be considered rude.`;
    } else if (lastUserMsg.includes('pack') || lastUserMsg.includes('weather')) {
      responseText = `When packing for your trip:\n\n1. **Layering**: Pack light, moisture-wicking layers.\n2. **Footwear**: Wear comfortable, broken-in walking shoes.\n3. **Essentials**: Bring a universal power adapter and refillable water bottle.`;
    }

    return res.json({
      reply: responseText,
      suggestedActions: ['Check weather outlook', 'Best local dishes', 'Emergency numbers']
    });
  });

  // Vite Middleware & Static Serving Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyTrip AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

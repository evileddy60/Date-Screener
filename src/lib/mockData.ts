
import type { UserProfile, ProfileCard, PotentialMatch, MatchFeedback } from '@/types';

// UserProfiles are typically static in this mock setup or managed by AuthContext/localStorage separately
export const mockUserProfiles: UserProfile[] = [
  {
    id: 'matcher1',
    email: 'matcher1@example.com',
    name: 'Sarah Miller',
    role: 'recommender',
    bio: "Passionate about connecting people! I believe there's someone for everyone.",
    photoUrl: 'https://placehold.co/400x400/E6E6FA/000000?text=SM',
  },
  {
    id: 'matcher2',
    email: 'matcher2@example.com',
    name: 'David Chen',
    role: 'recommender',
    bio: "Been playing matchmaker for friends for years. Let's find some great connections.",
    photoUrl: 'https://placehold.co/400x400/7FFFD4/000000?text=DC',
  },
  {
    id: 'matcher3',
    email: 'recommender@example.com',
    name: 'Maria Garcia',
    role: 'recommender',
    bio: "Hoping to help my friends find their special someone. I have a good intuition for these things!",
    photoUrl: 'https://placehold.co/400x400/DB7093/FFFFFF?text=MG',
  },
];

const PROFILE_CARDS_STORAGE_KEY = 'dateScreenerProfileCards_v1';
const POTENTIAL_MATCHES_STORAGE_KEY = 'dateScreenerPotentialMatches_v1';

// --- Initial Default Data ---
const initialDefaultProfileCards: ProfileCard[] = [
  {
    id: 'pc1',
    createdByMatcherId: 'matcher1',
    matcherName: 'Sarah Miller',
    friendName: 'Alex Johnson',
    friendEmail: 'alex.johnson.friend@example.com',
    bio: "Alex is an adventure enthusiast, loves hiking and exploring new cafes. Looking for someone with a good sense of humor and a kind heart. Values open communication and shared experiences. Enjoys reading sci-fi novels and trying new recipes on weekends.",
    interests: ['hiking', 'coffee', 'sci-fi', 'cooking', 'travel', 'live music'],
    photoUrl: 'https://placehold.co/400x400/FF7F50/FFFFFF?text=AJ',
    preferences: { ageRange: '28-35', seeking: 'long-term relationship', gender: 'Any', location: 'New York City area' },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'pc2',
    createdByMatcherId: 'matcher2',
    matcherName: 'David Chen',
    friendName: 'Jamie Lee',
    friendEmail: 'jamie.lee.friend@example.com',
    bio: "Jamie is a creative professional, passionate about art and music. Enjoys quiet evenings, good books, and meaningful conversations. Volunteers at an animal shelter and loves dogs.",
    interests: ['art', 'live music', 'books', 'volunteering', 'dogs', 'photography', 'museums'],
    photoUrl: 'https://placehold.co/400x400/8A2BE2/FFFFFF?text=JL',
    preferences: { ageRange: '30-38', seeking: 'companionship or long-term', gender: 'Any', location: 'New York City area' },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'pc3',
    createdByMatcherId: 'matcher1',
    matcherName: 'Sarah Miller',
    friendName: 'Chris Davis',
    friendEmail: 'chris.davis.friend@example.com',
    bio: "Chris is a software engineer by day, aspiring chef by night. Loves technology, board games, and cycling. Looking for a partner to share laughs and adventures with. Very analytical but also very caring.",
    interests: ['technology', 'board games', 'cycling', 'cooking', 'movies', 'podcasts'],
    photoUrl: 'https://placehold.co/400x400/3CB371/FFFFFF?text=CD',
    preferences: { ageRange: '29-36', seeking: 'long-term relationship', gender: 'Women', location: 'San Francisco Bay Area' },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'pc4',
    createdByMatcherId: 'matcher3',
    matcherName: 'Maria Garcia',
    friendName: 'Diana Prince',
    friendEmail: 'diana.prince.friend@example.com',
    bio: "Diana is a compassionate and strong individual, working in humanitarian aid. Enjoys history, museum visits, and athletic activities. Values honesty and courage. Looking for someone intellectually stimulating and kind.",
    interests: ['history', 'museums', 'athletics', 'humanitarian work', 'philosophy', 'documentaries'],
    photoUrl: 'https://placehold.co/400x400/1E90FF/FFFFFF?text=DP',
    preferences: { ageRange: '30-40', seeking: 'meaningful connection', gender: 'Men', location: 'Global / Flexible' },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'pc5',
    createdByMatcherId: 'matcher2',
    matcherName: 'David Chen',
    friendName: 'Ken Adams',
    friendEmail: 'ken.adams.friend@example.com',
    bio: "Ken is a laid-back writer who enjoys surfing, beach bonfires, and playing guitar. Looking for someone spontaneous and easygoing. He's also a big foodie and loves trying new restaurants.",
    interests: ['surfing', 'guitar', 'writing', 'beach life', 'foodie', 'travel'],
    photoUrl: 'https://placehold.co/400x400/FFD700/000000?text=KA',
    preferences: { ageRange: '27-34', seeking: 'fun and companionship, open to more', gender: 'Women', location: 'Southern California' },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];
const initialDefaultPotentialMatches: PotentialMatch[] = [];

// --- In-memory state variables ---
let _profileCards: ProfileCard[];
let _potentialMatches: PotentialMatch[];

// --- Helper functions for localStorage ---
function loadDataFromLocalStorage<T>(key: string, defaultData: T[]): T[] {
  if (typeof window !== 'undefined') {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        // If no data in localStorage, store the defaults and return them
        localStorage.setItem(key, JSON.stringify(defaultData));
        return [...defaultData]; // Return a copy of defaults
      }
    } catch (error) {
      console.error(`Error loading data for ${key} from localStorage:`, error);
      // Fallback to default if parsing fails or other errors
      return [...defaultData]; // Return a copy of defaults
    }
  }
  // For server-side rendering or non-browser environments, return defaults
  return [...defaultData]; // Return a copy of defaults
}

function saveDataToLocalStorage<T>(key: string, data: T[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data for ${key} to localStorage:`, error);
    }
  }
}

// --- Initialize data ---
// This block will run once when the module is first imported.
_profileCards = loadDataFromLocalStorage<ProfileCard>(PROFILE_CARDS_STORAGE_KEY, initialDefaultProfileCards);
_potentialMatches = loadDataFromLocalStorage<PotentialMatch>(POTENTIAL_MATCHES_STORAGE_KEY, initialDefaultPotentialMatches);


// --- Exported functions for Profile Cards ---
export function getMockProfileCards(): ProfileCard[] {
  // Return a copy to prevent accidental direct mutation of the internal array
  return [..._profileCards];
}

export function saveMockProfileCard(card: ProfileCard): void {
  const index = _profileCards.findIndex(c => c.id === card.id);
  if (index !== -1) {
    _profileCards[index] = card; // Update existing
  } else {
    _profileCards.push(card); // Add new
  }
  saveDataToLocalStorage<ProfileCard>(PROFILE_CARDS_STORAGE_KEY, _profileCards);
}

// --- Exported functions for Potential Matches ---
export function getMockPotentialMatches(): PotentialMatch[] {
  // Return a copy
  return [..._potentialMatches];
}

export function saveMockPotentialMatch(match: PotentialMatch): void {
  const index = _potentialMatches.findIndex(m => m.id === match.id);
  if (index !== -1) {
    _potentialMatches[index] = match; // Update existing
  } else {
    _potentialMatches.push(match); // Add new
  }
  saveDataToLocalStorage<PotentialMatch>(POTENTIAL_MATCHES_STORAGE_KEY, _potentialMatches);
}

// MockMatchFeedback is not persisted to localStorage in this iteration
export const mockMatchFeedback: MatchFeedback[] = [];

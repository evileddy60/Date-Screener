
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

// --- Initial Default Data ---
// These arrays will hold the "global" state of profile cards and potential matches.
// Changes made during an app session will modify these arrays.
// These arrays will reset to these defaults if the mockData.ts file is not updated by me and the app restarts.
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


// --- In-memory state variables, initialized with defaults ---
// We create copies so that modifications to _profileCards don't affect initialDefaultProfileCards
let _profileCards: ProfileCard[] = JSON.parse(JSON.stringify(initialDefaultProfileCards));
let _potentialMatches: PotentialMatch[] = JSON.parse(JSON.stringify(initialDefaultPotentialMatches));


// --- Exported functions for Profile Cards ---
export function getMockProfileCards(): ProfileCard[] {
  // Return a copy to prevent accidental direct mutation of the internal array from outside this module
  return JSON.parse(JSON.stringify(_profileCards));
}

export function saveMockProfileCard(card: ProfileCard): void {
  const index = _profileCards.findIndex(c => c.id === card.id);
  if (index !== -1) {
    _profileCards[index] = card; // Update existing
  } else {
    _profileCards.push(card); // Add new
  }
  // No localStorage saving here. Changes are only in-memory for this module's scope.
  // To "persist" these changes across app restarts, the initialDefaultProfileCards array
  // at the top of this file would need to be manually updated by the developer (or AI).
}

// --- Exported functions for Potential Matches ---
export function getMockPotentialMatches(): PotentialMatch[] {
  // Return a copy
  return JSON.parse(JSON.stringify(_potentialMatches));
}

export function saveMockPotentialMatch(match: PotentialMatch): void {
  const index = _potentialMatches.findIndex(m => m.id === match.id);
  if (index !== -1) {
    _potentialMatches[index] = match; // Update existing
  } else {
    _potentialMatches.push(match); // Add new
  }
  // No localStorage saving.
}

// MockMatchFeedback is not persisted in this iteration
export const mockMatchFeedback: MatchFeedback[] = [];

// Function to reset mock data to initial defaults (useful for testing or explicit reset)
// This would typically be called by a developer/tester, not end-users.
export function resetMockDataToDefaults(): void {
  _profileCards = JSON.parse(JSON.stringify(initialDefaultProfileCards));
  _potentialMatches = JSON.parse(JSON.stringify(initialDefaultPotentialMatches));
  console.log("Mock data has been reset to initial defaults.");
}

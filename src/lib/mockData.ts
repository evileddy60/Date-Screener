
import type { UserProfile, ProfileCard, PotentialMatch, MatchFeedback } from '@/types';

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

export const mockProfileCards: ProfileCard[] = [
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

// PotentialMatches will be populated by the AI flow.
// This can start empty or with a few examples if needed for initial UI testing.
export const mockPotentialMatches: PotentialMatch[] = [
  // Example: AI suggests Alex (pc1) and Jamie (pc2) might be a good match.
  // Sarah (matcher1) and David (matcher2) would need to approve this.
  /*
  {
    id: 'pm_example_1',
    profileCardAId: 'pc1', 
    profileCardBId: 'pc2',
    matcherAId: 'matcher1',
    matcherBId: 'matcher2',
    compatibilityScore: 85,
    compatibilityReason: "Shared interests in creative pursuits (music, art, coffee) and meaningful connections. Complementary personalities observed from bios. Both in NYC.",
    statusMatcherA: 'pending',
    statusMatcherB: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), // Half a day ago
  }
  */
];

export const mockMatchFeedback: MatchFeedback[] = [
];

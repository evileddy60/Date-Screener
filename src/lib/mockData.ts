
import type { UserProfile, ProfileCard, PotentialMatch, MatchFeedback } from '@/types';

// UserProfiles are now primarily Matchers
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
    email: 'recommender@example.com', // Keep this for easy login
    name: 'Maria Garcia',
    role: 'recommender',
    bio: "Hoping to help my friends find their special someone. I have a good intuition for these things!",
    photoUrl: 'https://placehold.co/400x400/DB7093/FFFFFF?text=MG',
  },
];

export const mockProfileCards: ProfileCard[] = [
  {
    id: 'pc1',
    createdByMatcherId: 'matcher1', // Sarah Miller
    matcherName: 'Sarah Miller',
    friendName: 'Alex Johnson',
    friendEmail: 'alex.johnson.friend@example.com',
    bio: "Alex is an adventure enthusiast, loves hiking and exploring new cafes. Looking for someone with a good sense of humor and a kind heart. Values open communication and shared experiences. Enjoys reading sci-fi novels and trying new recipes on weekends.",
    interests: ['hiking', 'coffee', 'sci-fi', 'cooking', 'travel'],
    photoUrl: 'https://placehold.co/400x400/FF7F50/FFFFFF?text=AJ',
    preferences: { ageRange: '28-35', seeking: 'long-term relationship', gender: 'Any', location: 'New York' },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'pc2',
    createdByMatcherId: 'matcher2', // David Chen
    matcherName: 'David Chen',
    friendName: 'Jamie Lee',
    friendEmail: 'jamie.lee.friend@example.com',
    bio: "Jamie is a creative professional, passionate about art and music. Enjoys quiet evenings, good books, and meaningful conversations. Volunteers at an animal shelter and loves dogs.",
    interests: ['art', 'music', 'books', 'volunteering', 'dogs', 'photography'],
    photoUrl: 'https://placehold.co/400x400/8A2BE2/FFFFFF?text=JL',
    preferences: { ageRange: '30-38', seeking: 'companionship', gender: 'Any', location: 'New York' },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'pc3',
    createdByMatcherId: 'matcher1', // Sarah Miller
    matcherName: 'Sarah Miller',
    friendName: 'Chris Davis',
    friendEmail: 'chris.davis.friend@example.com',
    bio: "Chris is a software engineer by day, aspiring chef by night. Loves technology, board games, and cycling. Looking for a partner to share laughs and adventures with.",
    interests: ['technology', 'board games', 'cycling', 'cooking', 'movies'],
    photoUrl: 'https://placehold.co/400x400/3CB371/FFFFFF?text=CD',
    preferences: { ageRange: '29-36', seeking: 'long-term relationship', gender: 'Any', location: 'San Francisco' },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'pc4',
    createdByMatcherId: 'matcher3', // Maria Garcia
    matcherName: 'Maria Garcia',
    friendName: 'Diana Prince',
    friendEmail: 'diana.prince.friend@example.com',
    bio: "Diana is a compassionate and strong individual, working in humanitarian aid. Enjoys history, museum visits, and athletic activities. Values honesty and courage.",
    interests: ['history', 'museums', 'athletics', 'humanitarian work', 'philosophy'],
    photoUrl: 'https://placehold.co/400x400/1E90FF/FFFFFF?text=DP',
    preferences: { ageRange: '30-40', seeking: 'meaningful connection', gender: 'Any', location: 'Global' },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

// Mock data for PotentialMatches between ProfileCards, awaiting Matcher approval
export const mockPotentialMatches: PotentialMatch[] = [
  // Example: AI suggests Alex (pc1) and Jamie (pc2) might be a good match.
  // Sarah (matcher1) and David (matcher2) would need to approve this.
  {
    id: 'pm1',
    profileCardAId: 'pc1', 
    profileCardBId: 'pc2',
    matcherAId: 'matcher1',
    matcherBId: 'matcher2',
    compatibilityScore: 85,
    compatibilityReason: "Shared interests in creative pursuits and meaningful connections. Complementary personalities.",
    statusMatcherA: 'pending',
    statusMatcherB: 'pending',
    createdAt: new Date().toISOString(),
  }
];

// Mock data for MatchFeedback from Matchers on PotentialMatches
export const mockMatchFeedback: MatchFeedback[] = [
    // Example: Sarah (matcher1) accepts the suggested pairing of her friend Alex (pc1) with Jamie (pc2)
  /*
  {
    id: 'mf1',
    potentialMatchId: 'pm1',
    matcherId: 'matcher1',
    isInterested: true,
    comments: "This looks like a great suggestion! I think Alex and Jamie could get along well.",
    createdAt: new Date().toISOString(),
  }
  */
];

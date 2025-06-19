
export type UserRole = 'single' | 'recommender'; // 'single' role will be phased out from active use

export interface PrivacySettingsData {
  profileVisibility: string;
  // allowRecommendationsFrom: string; // This seems less relevant for a matcher's own profile settings
  // optOutOfAllRecommendations: boolean; // This also seems less relevant for a matcher
  emailNotificationsForNewMatches: boolean; // Renamed for clarity (matchmaker context)
  emailNotificationsForMatchUpdates: boolean; // Renamed for clarity
}

export const defaultPrivacySettings: PrivacySettingsData = {
  profileVisibility: 'recommenders_only', // Default for matchmakers
  emailNotificationsForNewMatches: true,
  emailNotificationsForMatchUpdates: true,
};

export interface UserProfile { // This is now the Matcher's profile
  id: string;
  email: string;
  name: string;
  role: UserRole; // Will primarily be 'recommender'
  bio?: string;
  interests?: string[]; // Matcher's interests (less relevant now)
  photoUrl?: string;
  preferences?: Record<string, any>; // Matcher's preferences (less relevant now)
  privacySettings?: PrivacySettingsData;
}

export const FRIEND_GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Other", "Prefer not to say"] as const;

export interface ProfileCard { // Profile of a single friend, created by a Matcher
  id: string;
  createdByMatcherId: string;
  matcherName: string; // Name of the matcher who created this card
  friendName: string;
  friendEmail?: string; // For potential future email notifications to the friend
  friendAge?: number; // Actual age of the friend
  friendGender?: typeof FRIEND_GENDER_OPTIONS[number]; // Friend's own gender
  bio: string;
  interests: string[];
  photoUrl?: string;
  preferences: {
    ageRange?: string; // e.g., "25-35"
    seeking?: string[]; // Changed from string to string[]
    gender?: string; // e.g., "Men", "Women", "Other" - Gender the friend is seeking
    location?: string; // e.g., "50 km"
  };
  createdAt: string; // ISO date string
}

export interface PotentialMatch { // Represents a potential match between two ProfileCards
  id: string;
  profileCardAId: string; // ID of the first ProfileCard
  profileCardBId: string; // ID of the second ProfileCard
  matcherAId: string; // Matcher who owns ProfileCardA
  matcherBId: string; // Matcher who owns ProfileCardB
  compatibilityScore?: number; // Optional: from AI
  compatibilityReason?: string; // Optional: from AI
  statusMatcherA: 'pending' | 'accepted' | 'rejected';
  statusMatcherB: 'pending' | 'accepted' | 'rejected';
  statusFriendA?: 'pending' | 'accepted' | 'rejected'; // If Matchers accept, then friend is notified
  statusFriendB?: 'pending' | 'accepted' | 'rejected';
  friendEmailSent?: boolean; // Tracks if the introduction email has been sent (or simulated)
  createdAt: string; // ISO date string
  updatedAt?: string;
}

// This type might evolve or be replaced by PotentialMatch status updates
export interface MatchFeedback {
  id: string;
  potentialMatchId: string; 
  matcherId: string; // Matcher giving feedback on the PotentialMatch
  isInterested: boolean; // Matcher accepts or rejects the PotentialMatch pairing
  comments?: string;
  createdAt: string; // ISO date string
}

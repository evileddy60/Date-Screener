
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

export const FRIEND_GENDER_OPTIONS = ["Man", "Woman", "Other"] as const;
export const PREFERRED_GENDER_OPTIONS = ["Men", "Women", "Other"] as const; // Gender options someone is interested in
export const EDUCATION_LEVEL_OPTIONS = [
    "No formal education",
    "High School Diploma or GED",
    "Some College (No Degree)",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate (Ph.D., M.D., J.D., etc.)",
    "Trade/Vocational School",
    "Prefer not to say"
] as const;


export interface ProfileCard { // Profile of a single friend, created by a Matcher
  id: string;
  createdByMatcherId: string;
  matcherName: string; // Name of the matcher who created this card
  friendName: string;
  friendEmail?: string; // For potential future email notifications to the friend
  friendAge?: number; // Actual age of the friend
  friendGender?: typeof FRIEND_GENDER_OPTIONS[number]; // Friend's own gender
  friendPostalCode?: string; // Friend's Canadian Postal Code (e.g., "A1A1A1" or "A1A 1A1")
  educationLevel?: typeof EDUCATION_LEVEL_OPTIONS[number] | ""; // Added
  occupation?: string; // Added (e.g., "Software Engineer", "Teacher")
  bio: string;
  interests: string[];
  photoUrl?: string;
  preferences: {
    ageRange?: string; // e.g., "25-35"
    seeking?: string[]; // Changed from string to string[]
    gender?: typeof PREFERRED_GENDER_OPTIONS[number] | ""; // e.g., "Men", "Women", "Other" - Gender the friend is seeking
    location?: string; // e.g., "within 50 km" - This is relative to friendPostalCode
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

    

    

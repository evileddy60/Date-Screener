export type UserRole = 'single' | 'recommender';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  interests?: string[];
  photoUrl?: string;
  // For singles, provided by recommenders
  recommenderNotes?: { recommenderId: string; recommenderName: string, notes: string }[]; 
  // For storing preferences like age range, location, etc.
  preferences?: Record<string, any>; 
}

export interface Recommendation {
  id: string;
  recommenderId: string; // User ID of the recommender
  recommenderName: string;
  singleId: string; // User ID of the single person being recommended for
  potentialMatchId: string; // User ID of the potential match
  potentialMatchName: string;
  potentialMatchPhotoUrl?: string;
  notes: string; // Personal notes from the recommender
  familyIntro?: string; // Introduction from family, if applicable
  status: 'pending' | 'accepted' | 'rejected' | 'contacted';
  createdAt: string; // ISO date string
}

export interface MatchFeedback {
  id: string;
  recommendationId: string; 
  userId: string; // User who is giving feedback (the single)
  rating?: number; // e.g., 1-5 stars
  comments?: string;
  isInterested?: boolean; // explicit interest or decline
  createdAt: string; // ISO date string
}

// For AI suggestions input
export interface MatchImprovementInput {
  userProfileSummary: string; // Summary of the single's profile
  recommenderProfileSummary: string; // Summary of the recommender's approach/profile
  pastMatchFeedbackSummary: string; // Summary of feedback from previous matches
}


import type { UserProfile } from '@/types';
// Note: ProfileCard and PotentialMatch types are still imported if used by mockUserProfiles or other logic,
// but their mock data arrays and management functions are removed.

// UserProfiles are typically static in this mock setup or managed by AuthContext/localStorage separately.
// This array is used by AuthContext to bootstrap new user profiles and by various UI components to display matcher names.
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

// --- ProfileCard and PotentialMatch mock data and functions are removed. ---
// All operations for these entities will now go through src/lib/firestoreService.ts

// The resetMockDataToDefaults function might be removed or adapted if mockUserProfiles are also moved to Firestore eventually.
// For now, it might only reset this mockUserProfiles array if needed for testing.
export function resetMockDataToDefaults(): void {
  // This function would need to be re-evaluated.
  // If mockUserProfiles are the only thing left, this might not be necessary,
  // or it could repopulate mockUserProfiles to its initial state.
  // For now, let's make it a no-op as its original purpose is gone.
  console.log("Mock data reset function called - ProfileCards and PotentialMatches are now in Firestore.");
}

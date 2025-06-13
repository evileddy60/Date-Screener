import type { UserProfile, Recommendation, MatchFeedback } from '@/types';

export const mockUserProfiles: UserProfile[] = [
  {
    id: 'user1',
    email: 'single@example.com',
    name: 'Alex Johnson',
    role: 'single',
    bio: "Adventure enthusiast, love hiking and exploring new cafes. Looking for someone with a good sense of humor and a kind heart. Values open communication and shared experiences. I enjoy reading sci-fi novels and trying new recipes on weekends.",
    interests: ['hiking', 'coffee', 'sci-fi', 'cooking'],
    photoUrl: 'https://placehold.co/400x400/FF7F50/FFFFFF?text=AJ',
    preferences: { ageRange: '28-35', seeking: 'long-term relationship' },
    recommenderNotes: [
      { recommenderId: 'user2', recommenderName: 'Sarah Miller (Friend)', notes: 'Alex is amazing! Very thoughtful and has a great outlook on life. Would be great with someone who is active and loves deep conversations.'}
    ]
  },
  {
    id: 'user2',
    email: 'recommender@example.com',
    name: 'Sarah Miller',
    role: 'recommender',
    bio: "Alex's best friend. I know Alex well and want to help find someone great! I'm good at spotting compatible personalities.",
    photoUrl: 'https://placehold.co/400x400/E6E6FA/000000?text=SM',
  },
  {
    id: 'user3',
    email: 'potentialmatch1@example.com',
    name: 'Jamie Lee',
    role: 'single',
    bio: "Creative professional, passionate about art and music. Enjoys quiet evenings, good books, and meaningful conversations. I volunteer at an animal shelter and love dogs.",
    interests: ['art', 'music', 'books', 'volunteering', 'dogs'],
    photoUrl: 'https://placehold.co/400x400/8A2BE2/FFFFFF?text=JL',
    preferences: { ageRange: '30-38', seeking: 'companionship' },
  },
  {
    id: 'user4',
    email: 'another_single@example.com',
    name: 'Chris Davis',
    role: 'single',
    bio: "Software engineer by day, aspiring chef by night. I love technology, board games, and cycling. Looking for a partner to share laughs and adventures with.",
    interests: ['technology', 'board games', 'cycling', 'cooking'],
    photoUrl: 'https://placehold.co/400x400/3CB371/FFFFFF?text=CD',
    preferences: { ageRange: '29-36', seeking: 'long-term relationship' },
  },
  {
    id: 'user5',
    email: 'recommender_family@example.com',
    name: 'Maria Garcia (Aunt)',
    role: 'recommender',
    bio: "Alex's aunt. I have a good feeling about finding the right person for Alex. Family is important, and so is finding a kind soul.",
    photoUrl: 'https://placehold.co/400x400/DB7093/FFFFFF?text=MG',
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec1',
    recommenderId: 'user2',
    recommenderName: 'Sarah Miller',
    singleId: 'user1', // Alex Johnson
    potentialMatchId: 'user3', // Jamie Lee
    potentialMatchName: 'Jamie Lee',
    potentialMatchPhotoUrl: 'https://placehold.co/400x400/8A2BE2/FFFFFF?text=JL',
    notes: "I think Jamie would be a great match for Alex! They both seem to value deeper connections and have creative interests. Jamie's love for animals might also resonate with Alex's kind nature.",
    familyIntro: "Jamie seems like a wonderful person, introduced by a mutual friend who speaks very highly of their character.",
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'rec2',
    recommenderId: 'user5',
    recommenderName: 'Maria Garcia (Aunt)',
    singleId: 'user1', // Alex Johnson
    potentialMatchId: 'user4', // Chris Davis
    potentialMatchName: 'Chris Davis',
    potentialMatchPhotoUrl: 'https://placehold.co/400x400/3CB371/FFFFFF?text=CD',
    notes: "Chris sounds like a stable and fun person. My friend's son knows him from a cycling club and says he's very genuine. Could be a good fit for Alex's adventurous side!",
    familyIntro: "Chris comes from a good family, known for their kindness and community involvement.",
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
];

export const mockMatchFeedback: MatchFeedback[] = [
  {
    id: 'fb1',
    recommendationId: 'rec2',
    userId: 'user1',
    isInterested: true,
    comments: "Chris seems really interesting! I'd like to connect.",
    rating: 5,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
  }
];


import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import type { ProfileCard, PotentialMatch, UserProfile } from '@/types';

const PROFILE_CARDS_COLLECTION = 'profileCards';
const POTENTIAL_MATCHES_COLLECTION = 'potentialMatches';
const USER_PROFILES_COLLECTION = 'userProfiles';

// --- UserProfile Functions ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) {
    console.error("Firestore DB instance is not available for getUserProfile.");
    throw new Error("Database service unavailable. Cannot load profile.");
  }
  if (!userId) {
    console.error("getUserProfile called with no userId");
    return null;
  }
  const userProfileRef = doc(db, USER_PROFILES_COLLECTION, userId);
  try {
    const userProfileSnap = await getDoc(userProfileRef);
    if (userProfileSnap.exists()) {
      return { id: userProfileSnap.id, ...userProfileSnap.data() } as UserProfile;
    }
    console.log(`User profile with ID ${userId} not found in Firestore.`);
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // It's important to re-throw or handle it so AuthContext knows about the failure.
    throw error;
  }
}

export async function setUserProfile(userProfile: UserProfile): Promise<void> {
  if (!db) {
    console.error("Firestore DB instance is not available for setUserProfile.");
    throw new Error("Database service unavailable. Cannot save profile.");
  }
  if (!userProfile || !userProfile.id) {
    console.error("setUserProfile called with invalid userProfile data:", userProfile);
    // throw new Error("setUserProfile: Invalid userProfile data or missing ID.");
    return; // Or throw error
  }
  const userProfileRef = doc(db, USER_PROFILES_COLLECTION, userProfile.id);
  try {
    await setDoc(userProfileRef, userProfile, { merge: true });
  } catch (error) {
    console.error("Error setting user profile:", error);
    throw error;
  }
}


// --- ProfileCard Functions ---

export async function addProfileCard(
  cardData: Omit<ProfileCard, 'id' | 'createdAt' | 'matcherName' | 'createdByMatcherId'>,
  matcherId: string,
  matcherName: string
): Promise<ProfileCard> {
  if (!db) {
    console.error("Firestore DB instance is not available for addProfileCard.");
    throw new Error("Database service unavailable. Cannot create profile card.");
  }
  const docRef = await addDoc(collection(db, PROFILE_CARDS_COLLECTION), {
    ...cardData,
    createdByMatcherId: matcherId,
    matcherName: matcherName,
    createdAt: new Date().toISOString(),
  });
  return {
    id: docRef.id,
    ...cardData,
    createdByMatcherId: matcherId,
    matcherName: matcherName,
    createdAt: new Date().toISOString()
  };
}

export async function updateProfileCard(cardData: ProfileCard): Promise<void> {
  if (!db) {
    console.error("Firestore DB instance is not available for updateProfileCard.");
    throw new Error("Database service unavailable. Cannot update profile card.");
  }
  const cardRef = doc(db, PROFILE_CARDS_COLLECTION, cardData.id);
  // Ensure we don't try to overwrite `id` or `createdAt` inside the document itself if they are part of cardData
  const { id, createdAt, ...dataToUpdate } = cardData;
  await updateDoc(cardRef, dataToUpdate);
}

export async function getProfileCardById(cardId: string): Promise<ProfileCard | null> {
  if (!db) {
    console.error("Firestore DB instance is not available for getProfileCardById.");
    // For read operations, we might allow it to proceed and let Firestore SDK handle it,
    // or throw as well for consistency. Let's throw for now.
    throw new Error("Database service unavailable. Cannot fetch profile card.");
  }
  const cardRef = doc(db, PROFILE_CARDS_COLLECTION, cardId);
  const cardSnap = await getDoc(cardRef);
  if (cardSnap.exists()) {
    return { id: cardSnap.id, ...cardSnap.data() } as ProfileCard;
  }
  return null;
}

export async function getProfileCardsByMatcher(matcherId: string): Promise<ProfileCard[]> {
  if (!db) {
    console.error("Firestore DB instance is not available for getProfileCardsByMatcher.");
    throw new Error("Database service unavailable. Cannot fetch profile cards.");
  }
  const q = query(collection(db, PROFILE_CARDS_COLLECTION), where('createdByMatcherId', '==', matcherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileCard));
}

export async function getAllProfileCards(): Promise<ProfileCard[]> {
  if (!db) {
    console.error("Firestore DB instance is not available for getAllProfileCards.");
    throw new Error("Database service unavailable. Cannot fetch all profile cards.");
  }
  const querySnapshot = await getDocs(collection(db, PROFILE_CARDS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileCard));
}

export async function deleteProfileCard(cardId: string): Promise<void> {
  if (!db) {
    console.error("Firestore DB instance is not available for deleteProfileCard.");
    throw new Error("Database service unavailable. Cannot delete profile card.");
  }
  const cardRef = doc(db, PROFILE_CARDS_COLLECTION, cardId);
  // TODO: Consider deleting related PotentialMatch documents if needed.
  // For now, just deleting the card.
  await deleteDoc(cardRef);
}


// --- PotentialMatch Functions ---

export async function addPotentialMatch(
  matchData: Omit<PotentialMatch, 'id' | 'createdAt'>
): Promise<PotentialMatch> {
  if (!db) {
    console.error("Firestore DB instance is not available for addPotentialMatch.");
    throw new Error("Database service unavailable. Cannot create potential match.");
  }
  const docRef = await addDoc(collection(db, POTENTIAL_MATCHES_COLLECTION), {
    ...matchData,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...matchData, createdAt: new Date().toISOString() };
}

export async function updatePotentialMatch(matchData: PotentialMatch): Promise<void> {
  if (!db) {
    console.error("Firestore DB instance is not available for updatePotentialMatch.");
    throw new Error("Database service unavailable. Cannot update potential match.");
  }
  const matchRef = doc(db, POTENTIAL_MATCHES_COLLECTION, matchData.id);
  const { id, createdAt, ...dataToUpdate } = matchData; // Exclude id and original createdAt from direct update
  await updateDoc(matchRef, {
      ...dataToUpdate,
      updatedAt: new Date().toISOString() // Ensure updatedAt is always set on update
  });
}

export async function getPotentialMatchById(matchId: string): Promise<PotentialMatch | null> {
  if (!db) {
    console.error("Firestore DB instance is not available for getPotentialMatchById.");
    throw new Error("Database service unavailable. Cannot fetch potential match.");
  }
  const matchRef = doc(db, POTENTIAL_MATCHES_COLLECTION, matchId);
  const matchSnap = await getDoc(matchRef);
  if (matchSnap.exists()) {
    return { id: matchSnap.id, ...matchSnap.data() } as PotentialMatch;
  }
  return null;
}

export async function getPotentialMatchesByMatcher(matcherId: string): Promise<PotentialMatch[]> {
  if (!db) {
    console.error("Firestore DB instance is not available for getPotentialMatchesByMatcher.");
    throw new Error("Database service unavailable. Cannot fetch potential matches.");
  }
  const qMatcherA = query(collection(db, POTENTIAL_MATCHES_COLLECTION), where('matcherAId', '==', matcherId));
  const qMatcherB = query(collection(db, POTENTIAL_MATCHES_COLLECTION), where('matcherBId', '==', matcherId));

  const [snapA, snapB] = await Promise.all([getDocs(qMatcherA), getDocs(qMatcherB)]);

  const matchesMap = new Map<string, PotentialMatch>();
  snapA.docs.forEach(doc => matchesMap.set(doc.id, { id: doc.id, ...doc.data() } as PotentialMatch));
  snapB.docs.forEach(doc => matchesMap.set(doc.id, { id: doc.id, ...doc.data() } as PotentialMatch)); // Overwrites if duplicate, which is fine

  return Array.from(matchesMap.values());
}

export async function findExistingPotentialMatch(profileCardAId: string, profileCardBId: string): Promise<PotentialMatch | null> {
  if (!db) {
    console.error("Firestore DB instance is not available for findExistingPotentialMatch.");
    throw new Error("Database service unavailable. Cannot find existing potential match.");
  }
  // Check for (A, B)
  const q1 = query(collection(db, POTENTIAL_MATCHES_COLLECTION),
    where('profileCardAId', '==', profileCardAId),
    where('profileCardBId', '==', profileCardBId)
  );
  const snap1 = await getDocs(q1);
  if (!snap1.empty) {
    return { id: snap1.docs[0].id, ...snap1.docs[0].data() } as PotentialMatch;
  }

  // Check for (B, A)
  const q2 = query(collection(db, POTENTIAL_MATCHES_COLLECTION),
    where('profileCardAId', '==', profileCardBId),
    where('profileCardBId', '==', profileCardAId)
  );
  const snap2 = await getDocs(q2);
  if (!snap2.empty) {
    return { id: snap2.docs[0].id, ...snap2.docs[0].data() } as PotentialMatch;
  }
  return null;
}

// --- Utility for clearing collections (for testing/reset - USE WITH CAUTION) ---
export async function clearProfileCardsCollection(): Promise<void> {
   if (!db) { console.error("DB not available for clearProfileCardsCollection"); return; }
  const querySnapshot = await getDocs(collection(db, PROFILE_CARDS_COLLECTION));
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log("ProfileCards collection cleared.");
}

export async function clearPotentialMatchesCollection(): Promise<void> {
  if (!db) { console.error("DB not available for clearPotentialMatchesCollection"); return; }
  const querySnapshot = await getDocs(collection(db, POTENTIAL_MATCHES_COLLECTION));
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log("PotentialMatches collection cleared.");
}

export async function clearUserProfilesCollection(): Promise<void> {
  if (!db) { console.error("DB not available for clearUserProfilesCollection"); return; }
  const querySnapshot = await getDocs(collection(db, USER_PROFILES_COLLECTION));
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log("UserProfiles collection cleared.");
}

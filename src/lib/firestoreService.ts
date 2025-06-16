
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
  writeBatch
} from 'firebase/firestore';
import type { ProfileCard, PotentialMatch } from '@/types';

const PROFILE_CARDS_COLLECTION = 'profileCards';
const POTENTIAL_MATCHES_COLLECTION = 'potentialMatches';

// --- ProfileCard Functions ---

export async function addProfileCard(
  cardData: Omit<ProfileCard, 'id' | 'createdAt' | 'matcherName'>,
  matcherId: string,
  matcherName: string
): Promise<ProfileCard> {
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
  const cardRef = doc(db, PROFILE_CARDS_COLLECTION, cardData.id);
  // Ensure we don't try to overwrite `id` or `createdAt` inside the document itself if they are part of cardData
  const { id, createdAt, ...dataToUpdate } = cardData;
  await updateDoc(cardRef, dataToUpdate);
}

export async function getProfileCardById(cardId: string): Promise<ProfileCard | null> {
  const cardRef = doc(db, PROFILE_CARDS_COLLECTION, cardId);
  const cardSnap = await getDoc(cardRef);
  if (cardSnap.exists()) {
    return { id: cardSnap.id, ...cardSnap.data() } as ProfileCard;
  }
  return null;
}

export async function getProfileCardsByMatcher(matcherId: string): Promise<ProfileCard[]> {
  const q = query(collection(db, PROFILE_CARDS_COLLECTION), where('createdByMatcherId', '==', matcherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileCard));
}

export async function getAllProfileCards(): Promise<ProfileCard[]> {
  const querySnapshot = await getDocs(collection(db, PROFILE_CARDS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileCard));
}

// --- PotentialMatch Functions ---

export async function addPotentialMatch(
  matchData: Omit<PotentialMatch, 'id' | 'createdAt'>
): Promise<PotentialMatch> {
  const docRef = await addDoc(collection(db, POTENTIAL_MATCHES_COLLECTION), {
    ...matchData,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...matchData, createdAt: new Date().toISOString() };
}

export async function updatePotentialMatch(matchData: PotentialMatch): Promise<void> {
  const matchRef = doc(db, POTENTIAL_MATCHES_COLLECTION, matchData.id);
  const { id, createdAt, ...dataToUpdate } = matchData; // Exclude id and original createdAt from direct update
  await updateDoc(matchRef, {
      ...dataToUpdate,
      updatedAt: new Date().toISOString() // Ensure updatedAt is always set on update
  });
}

export async function getPotentialMatchById(matchId: string): Promise<PotentialMatch | null> {
  const matchRef = doc(db, POTENTIAL_MATCHES_COLLECTION, matchId);
  const matchSnap = await getDoc(matchRef);
  if (matchSnap.exists()) {
    return { id: matchSnap.id, ...matchSnap.data() } as PotentialMatch;
  }
  return null;
}

export async function getPotentialMatchesByMatcher(matcherId: string): Promise<PotentialMatch[]> {
  const qMatcherA = query(collection(db, POTENTIAL_MATCHES_COLLECTION), where('matcherAId', '==', matcherId));
  const qMatcherB = query(collection(db, POTENTIAL_MATCHES_COLLECTION), where('matcherBId', '==', matcherId));

  const [snapA, snapB] = await Promise.all([getDocs(qMatcherA), getDocs(qMatcherB)]);
  
  const matchesMap = new Map<string, PotentialMatch>();
  snapA.docs.forEach(doc => matchesMap.set(doc.id, { id: doc.id, ...doc.data() } as PotentialMatch));
  snapB.docs.forEach(doc => matchesMap.set(doc.id, { id: doc.id, ...doc.data() } as PotentialMatch)); // Overwrites if duplicate, which is fine

  return Array.from(matchesMap.values());
}

export async function findExistingPotentialMatch(profileCardAId: string, profileCardBId: string): Promise<PotentialMatch | null> {
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
  const querySnapshot = await getDocs(collection(db, PROFILE_CARDS_COLLECTION));
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log("ProfileCards collection cleared.");
}

export async function clearPotentialMatchesCollection(): Promise<void> {
  const querySnapshot = await getDocs(collection(db, POTENTIAL_MATCHES_COLLECTION));
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log("PotentialMatches collection cleared.");
}

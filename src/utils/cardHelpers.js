// src/utils/cardHelpers.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Generate a unique card ID
 * Format: random string + timestamp for uniqueness
 */
export function generateCardId() {
  const randomPart = Math.random().toString(36).substring(2, 11);
  const timePart = Date.now().toString(36);
  return `${randomPart}${timePart}`;
}

/**
 * Save a new card to Firebase with user ownership
 * @param {string} cardId - Unique card identifier
 * @param {object} profileData - Card profile data
 * @param {string} userId - User ID (from Firebase Auth)
 * @returns {Promise<object>} Result with success status
 */
export async function saveCard(cardId, profileData, userId = null) {
  try {
    const cardData = {
      profile: profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Require userId (we only support authenticated publishing)
    if (!userId) {
      throw new Error("User ID missing during save (saveCard called with null userId)");
    }

    cardData.userId = userId;
    cardData.isPublic = true;
    console.log("Saving card with userId:", userId);
    await setDoc(doc(db, "cards", cardId), cardData);
    return { success: true, cardId };
  } catch (error) {
    console.error("Error saving card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing card in Firebase
 * @param {string} cardId - Unique card identifier
 * @param {object} profileData - Updated card profile data
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<object>} Result with success status
 */
export async function updateCard(cardId, profileData, userId = null) {
  try {
    // If userId provided, verify ownership first
    if (userId) {
      const cardDoc = await getDoc(doc(db, "cards", cardId));
      if (cardDoc.exists()) {
        const cardData = cardDoc.data();
        if (cardData.userId && cardData.userId !== userId) {
          return {
            success: false,
            error: "You don't have permission to edit this card",
          };
        }
      }
    }

    await updateDoc(doc(db, "cards", cardId), {
      profile: profileData,
      userId: userId,
      updatedAt: serverTimestamp(),
    });

    return { success: true, cardId };
  } catch (error) {
    console.error("Error updating card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Load a card from Firebase
 * @param {string} cardId - Unique card identifier
 * @returns {Promise<object>} Result with card data or error
 */
export async function loadCard(cardId) {
  try {
    const cardDoc = await getDoc(doc(db, "cards", cardId));
    if (cardDoc.exists()) {
      return { success: true, data: cardDoc.data() };
    } else {
      return { success: false, error: "Card not found" };
    }
  } catch (error) {
    console.error("Error loading card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all cards owned by a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Result with array of cards
 */
export async function getUserCards(userId) {
  try {
    const q = query(collection(db, "cards"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const cards = [];

    querySnapshot.forEach((docSnap) => {
      cards.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    // Sort by creation date (newest first), handling Firestore Timestamp
    cards.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    return { success: true, cards };
  } catch (error) {
    console.error("Error getting user cards:", error);
    return { success: false, error: error.message, cards: [] };
  }
}

/**
 * Check if user owns a card
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user owns the card
 */
export async function isCardOwner(cardId, userId) {
  try {
    const cardDoc = await getDoc(doc(db, "cards", cardId));
    if (cardDoc.exists()) {
      const cardData = cardDoc.data();
      return cardData.userId === userId;
    }
    return false;
  } catch (error) {
    console.error("Error checking card ownership:", error);
    return false;
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

/**
 * Get the full card URL
 * @param {string} cardId - Card identifier
 * @param {boolean} embed - Whether to add embed parameter
 * @returns {string} Full card URL
 */
export function getCardUrl(cardId, embed = false) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = `${origin}/card/${cardId}`;
  return embed ? `${baseUrl}?embed=true` : baseUrl;
}

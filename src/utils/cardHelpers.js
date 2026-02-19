// src/utils/cardHelpers.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
 * Save a new card to Firebase
 * @param {string} cardId - Unique card identifier
 * @param {object} profileData - Card profile data
 * @returns {Promise<object>} Result with success status
 */
export async function saveCard(cardId, profileData) {
  try {
    await setDoc(doc(db, "cards", cardId), {
      profile: profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
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
 * @returns {Promise<object>} Result with success status
 */
export async function updateCard(cardId, profileData) {
  try {
    await updateDoc(doc(db, "cards", cardId), {
      profile: profileData,
      updatedAt: new Date().toISOString(),
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

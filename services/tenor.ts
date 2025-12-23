import { TenorResponse } from '../types';

const DEFAULT_API_KEY = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
const CLIENT_KEY = "sticker_swift_web";
const BASE_URL = "https://tenor.googleapis.com/v2/search";

/**
 * Retrieves the API Key.
 * Priority: LocalStorage (User Custom Key) > Default Hardcoded Key
 */
export const getApiKey = () => {
  return localStorage.getItem('sticker_swift_api_key') || DEFAULT_API_KEY;
};

/**
 * Searches for GIFs/Stickers using the external API.
 * Added searchFilter param: 'sticker' (transparent), 'gif' (rectangular), 'static' (images)
 */
export const searchStickers = async (
  query: string, 
  limit: number = 30, 
  pos?: string,
  searchFilter: 'sticker' | 'gif' | 'static' = 'sticker'
): Promise<TenorResponse> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const apiKey = getApiKey();
    
    // Request multiple GIF formats to ensure we have a fallback for images
    // Added searchfilter parameter to API URL
    let url = `${BASE_URL}?q=${encodedQuery}&key=${apiKey}&client_key=${CLIENT_KEY}&limit=${limit}&media_filter=gif,tinygif,nanogif,mediumgif${pos ? `&pos=${pos}` : ''}`;
    
    // Apply the type filter
    if (searchFilter !== 'gif') {
        url += `&searchfilter=${searchFilter}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      // If user provided a bad key, this will fail.
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: TenorResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch stickers:", error);
    // Return empty result on failure to prevent app crash
    return { results: [], next: "" };
  }
};
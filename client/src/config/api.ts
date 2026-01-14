/**
 * API Configuration
 * Provides utilities for determining the correct API base URL in different environments
 */

/**
 * Get the API base URL dynamically based on the current environment
 * Priority:
 * 1. VITE_API_URL environment variable (for production deploys)
 * 2. localhost:5000 for development
 * 3. Same domain as frontend (if backend and frontend are on same host)
 */
export const getApiUrl = (): string => {
  // First, check for environment variable (highest priority)
  if (import.meta.env.VITE_API_URL) {
    console.log('[API Config] Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // If running in a browser environment
  if (typeof window !== 'undefined') {
    // In development (localhost:5173 frontend with localhost:3000 backend)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    // In production/deployed environments, use the same host with inferred backend port
    // If backend is served on same domain, use current protocol and host
    const protocol = window.location.protocol;
    const host = window.location.hostname;

    // If port is not standard (80/443), include it
    let baseUrl = `${protocol}//${host}`;
    if (window.location.port && window.location.port !== '80' && window.location.port !== '443') {
      baseUrl += `:${window.location.port}`;
    }

    console.log('[API Config] Using API URL:', baseUrl);
    return baseUrl;
  }

  // Fallback for SSR or non-browser environments
  return 'http://localhost:3000';
};

/**
 * Construct a full media URL from a relative path
 * @param relativePath - The relative path from the server (e.g., /uploads/file.png)
 * @returns Full URL to the media file
 */
export const getMediaUrl = (relativePath: string): string => {
  if (!relativePath) return '';

  // If already a full URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // Otherwise, prepend the API base URL
  const baseUrl = getApiUrl();
  return `${baseUrl}${relativePath}`;
};

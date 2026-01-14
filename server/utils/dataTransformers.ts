/**
 * Utility functions to transform data between snake_case (Supabase) and camelCase (Frontend)
 */

/**
 * Converts snake_case keys to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase keys to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transforms object keys from snake_case to camelCase
 */
export function transformKeysToCamel<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToCamel(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = transformKeysToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

/**
 * Recursively transforms object keys from camelCase to snake_case
 */
export function transformKeysToSnake<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToSnake(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      // Special handling for _id -> id conversion
      if (key === '_id') {
        acc['id'] = obj[key];
        return acc;
      }
      
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = transformKeysToSnake(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

/**
 * Transforms site settings from Supabase format to frontend format
 */
export function transformSiteSettings(settings: any) {
  if (!settings) return settings;
  
  // Convert all snake_case to camelCase
  const transformed = transformKeysToCamel(settings);
  
  // Ensure _id is set for backward compatibility
  if (transformed.id && !transformed._id) {
    transformed._id = transformed.id;
  }
  
  return transformed;
}

/**
 * Transforms page data from Supabase format to frontend format
 */
export function transformPage(page: any) {
  if (!page) return page;
  
  const transformed = transformKeysToCamel(page);
  
  // Map is_published to isPublished for backward compatibility
  if ('isPublished' in transformed) {
    transformed.is_published = transformed.isPublished;
  }
  
  return transformed;
}

/**
 * Transforms post data from Supabase format to frontend format
 */
export function transformPost(post: any) {
  if (!post) return post;
  
  const transformed = transformKeysToCamel(post);
  
  // Map is_published to isPublished for backward compatibility
  if ('isPublished' in transformed) {
    transformed.is_published = transformed.isPublished;
  }
  
  return transformed;
}

/**
 * Transforms user data from Supabase format to frontend format
 */
export function transformUser(user: any) {
  if (!user) return user;
  
  const transformed = transformKeysToCamel(user);
  
  // Ensure _id is set for backward compatibility
  if (transformed.id && !transformed._id) {
    transformed._id = transformed.id;
  }
  
  // Remove password from response
  delete transformed.password;
  
  return transformed;
}

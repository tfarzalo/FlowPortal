/**
 * Supabase Admin Service
 * Direct Supabase queries for admin operations (settings, pages, posts, users, dashboard stats)
 * Replaces backend API calls with direct database queries
 */

import { supabase } from '../lib/supabase';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Transform snake_case to camelCase for frontend
 */
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
}

/**
 * Transform camelCase to snake_case for database
 */
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
}

// ==================== SITE SETTINGS ====================

export interface ServiceBlock {
  id: string;
  title: string;
  description: string;
  iconName: string;
  enabled: boolean;
}

export interface SiteSettings {
  _id?: string;
  id?: string;
  siteName: string;
  tagline: string;
  siteUrl: string;
  logoUrl?: string;
  faviconUrl?: string;
  landingPageIconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  googleMapsUrl?: string;
  metaDescription?: string;
  metaKeywords?: string;
  privacyStatement?: string;
  comingSoonMode: boolean;
  defaultTheme: 'light' | 'dark';
  buttonStyles: {
    primaryButtonBg: string;
    primaryButtonText: string;
    primaryButtonHoverBg: string;
    primaryButtonHoverText: string;
    primaryButtonBorder: string;
    primaryButtonBorderColor: string;
    secondaryButtonBg: string;
    secondaryButtonText: string;
    secondaryButtonHoverBg: string;
    secondaryButtonHoverText: string;
    secondaryButtonBorder: string;
    secondaryButtonBorderColor: string;
  };
  landingPage: {
    heroBackgroundImageUrl?: string;
    heroTagline?: string;
    companyInfo: {
      ccbLicense?: string;
      yearsInBusiness?: string;
      established?: string;
      teamDescription?: string;
      awardsDescription?: string;
    };
    serviceBlocks: ServiceBlock[];
  };
  updatedAt?: string;
  createdAt?: string;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'FlowPortal',
  tagline: '',
  siteUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  contactEmail: '',
  contactPhone: '',
  address: '',
  businessHours: {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
    saturday: 'Closed',
    sunday: 'Closed',
  },
  socialMedia: {},
  comingSoonMode: false,
  defaultTheme: 'dark',
  buttonStyles: {
    primaryButtonBg: '#2563eb',
    primaryButtonText: '#ffffff',
    primaryButtonHoverBg: '#1e40af',
    primaryButtonHoverText: '#ffffff',
    primaryButtonBorder: '0px',
    primaryButtonBorderColor: '#2563eb',
    secondaryButtonBg: 'transparent',
    secondaryButtonText: '#2563eb',
    secondaryButtonHoverBg: '#2563eb',
    secondaryButtonHoverText: '#ffffff',
    secondaryButtonBorder: '2px',
    secondaryButtonBorderColor: '#2563eb',
  },
  landingPage: {
    companyInfo: {},
    serviceBlocks: [],
  },
};

function mergeSiteSettings(base: SiteSettings, overrides?: Partial<SiteSettings>): SiteSettings {
  if (!overrides) {
    return { ...base };
  }

  return {
    ...base,
    ...overrides,
    businessHours: {
      ...base.businessHours,
      ...overrides.businessHours,
    },
    socialMedia: {
      ...base.socialMedia,
      ...overrides.socialMedia,
    },
    buttonStyles: {
      ...base.buttonStyles,
      ...overrides.buttonStyles,
    },
    landingPage: {
      ...base.landingPage,
      ...overrides.landingPage,
      companyInfo: {
        ...base.landingPage.companyInfo,
        ...overrides.landingPage?.companyInfo,
      },
      serviceBlocks: overrides.landingPage?.serviceBlocks ?? base.landingPage.serviceBlocks,
    },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Error fetching site settings:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  const camelData = toCamelCase(data) as SiteSettings;
  // Add _id for backward compatibility
  return { ...mergeSiteSettings(DEFAULT_SITE_SETTINGS, camelData), _id: camelData.id };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  // Remove _id if present, use id instead
  const { _id, ...cleanSettings } = settings;
  const id = _id || cleanSettings.id;

  const settingsPayload = id
    ? cleanSettings
    : mergeSiteSettings(DEFAULT_SITE_SETTINGS, cleanSettings as SiteSettings);

  // Transform to snake_case for database
  const snakeSettings = toSnakeCase(settingsPayload);
  
  // Remove id from the update payload (it's in the WHERE clause)
  delete snakeSettings.id;

  const { data, error } = id
    ? await supabase
        .from('site_settings')
        .update(snakeSettings)
        .eq('id', id)
        .select()
        .single()
    : await supabase
        .from('site_settings')
        .insert(snakeSettings)
        .select()
        .single();

  if (error) {
    console.error('[Supabase] Error updating site settings:', error);
    throw new Error(error.message);
  }

  const camelData = toCamelCase(data) as SiteSettings;
  return { ...mergeSiteSettings(DEFAULT_SITE_SETTINGS, camelData), _id: camelData.id };
}

// ==================== PAGES ====================

export interface Page {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getPages(publishedOnly: boolean = false): Promise<Page[]> {
  let query = supabase.from('pages').select('*');
  
  if (publishedOnly) {
    query = query.eq('is_published', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching pages:', error);
    throw new Error(error.message);
  }

  return (data || []).map(page => {
    const camelPage = toCamelCase(page);
    return { ...camelPage, _id: camelPage.id };
  });
}

export async function getPageById(id: string): Promise<Page> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching page:', error);
    throw new Error(error.message);
  }

  const camelPage = toCamelCase(data);
  return { ...camelPage, _id: camelPage.id };
}

export async function getPageBySlug(slug: string): Promise<Page> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching page by slug:', error);
    throw new Error(error.message);
  }

  const camelPage = toCamelCase(data);
  return { ...camelPage, _id: camelPage.id };
}

export async function getPublishedPageBySlug(slug: string): Promise<Page> {
  const startTime = performance.now();
  console.log(`[Supabase] Fetching published page by slug: ${slug}`);
  
  // Select only fields that exist in the pages table
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, content, meta_description, meta_keywords, is_published, created_by, created_at, updated_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  const queryTime = performance.now() - startTime;
  console.log(`[Supabase] Query completed in ${queryTime.toFixed(2)}ms`);

  if (error) {
    console.error('[Supabase] Error fetching published page by slug:', error);
    if (error.code === 'PGRST116') {
      throw new Error('Page not found');
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Page not found');
  }

  const camelPage = toCamelCase(data);
  return { ...camelPage, _id: camelPage.id };
}

export async function createPage(pageData: Partial<Page>): Promise<Page> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if user exists in auth.users by checking their profile
  let createdBy: string | null = null;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      createdBy = user.id;
    } else {
      console.warn('[createPage] User profile not found, creating page without created_by');
    }
  } catch (err) {
    console.warn('[createPage] Error checking user profile:', err);
  }

  // Transform to snake_case and add created_by only if valid
  const pageToCreate = {
    ...pageData,
    ...(createdBy && { createdBy })
  };
  
  const snakePage = toSnakeCase(pageToCreate);

  const { data, error } = await supabase
    .from('pages')
    .insert(snakePage)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating page:', error);
    throw new Error(error.message);
  }

  const camelPage = toCamelCase(data);
  return { ...camelPage, _id: camelPage.id };
}

export async function updatePage(id: string, updates: Partial<Page>): Promise<Page> {
  // Remove _id and id from updates
  const { _id, id: _, ...cleanUpdates } = updates;
  
  // Transform to snake_case
  const snakeUpdates = toSnakeCase(cleanUpdates);

  const { data, error } = await supabase
    .from('pages')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating page:', error);
    throw new Error(error.message);
  }

  const camelPage = toCamelCase(data);
  return { ...camelPage, _id: camelPage.id };
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting page:', error);
    throw new Error(error.message);
  }
}

// ==================== POSTS ====================

export interface Post {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getPosts(publishedOnly: boolean = false): Promise<Post[]> {
  let query = supabase.from('posts').select('*');
  
  if (publishedOnly) {
    query = query.eq('is_published', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching posts:', error);
    throw new Error(error.message);
  }

  return (data || []).map(post => {
    const camelPost = toCamelCase(post);
    return { ...camelPost, _id: camelPost.id };
  });
}

export async function getPostById(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching post:', error);
    throw new Error(error.message);
  }

  const camelPost = toCamelCase(data);
  return { ...camelPost, _id: camelPost.id };
}

export async function createPost(postData: Partial<Post>): Promise<Post> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Transform to snake_case and add created_by
  const snakePost = toSnakeCase({
    ...postData,
    createdBy: user.id,
    publishedAt: postData.isPublished ? new Date().toISOString() : null,
  });

  const { data, error } = await supabase
    .from('posts')
    .insert(snakePost)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating post:', error);
    throw new Error(error.message);
  }

  const camelPost = toCamelCase(data);
  return { ...camelPost, _id: camelPost.id };
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  // Remove _id and id from updates
  const { _id, id: _, ...cleanUpdates } = updates;
  
  // Update publishedAt if isPublished is being set to true
  if (cleanUpdates.isPublished === true) {
    const { data: currentPost } = await supabase
      .from('posts')
      .select('published_at')
      .eq('id', id)
      .single();
    
    if (currentPost && !currentPost.published_at) {
      cleanUpdates.publishedAt = new Date().toISOString();
    }
  }
  
  // Transform to snake_case
  const snakeUpdates = toSnakeCase(cleanUpdates);

  const { data, error } = await supabase
    .from('posts')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating post:', error);
    throw new Error(error.message);
  }

  const camelPost = toCamelCase(data);
  return { ...camelPost, _id: camelPost.id };
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting post:', error);
    throw new Error(error.message);
  }
}

// ==================== DASHBOARD STATS ====================

export interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  totalFormEntries: number;
  unreadFormEntries: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Run all queries in parallel
  const [pagesData, postsData, usersData, formEntriesData] = await Promise.all([
    supabase.from('pages').select('is_published', { count: 'exact', head: false }),
    supabase.from('posts').select('is_published', { count: 'exact', head: false }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('form_entries').select('status', { count: 'exact', head: false }),
  ]);

  const errors = [pagesData.error, postsData.error, usersData.error, formEntriesData.error].filter(Boolean);
  if (errors.length > 0) {
    const message = errors.map((err) => err?.message).join(' | ');
    throw new Error(message || 'Failed to load dashboard stats');
  }

  // Calculate page stats
  const totalPages = pagesData.data?.length || 0;
  const publishedPages = pagesData.data?.filter(p => p.is_published).length || 0;
  const draftPages = totalPages - publishedPages;

  // Calculate post stats
  const totalPosts = postsData.data?.length || 0;
  const publishedPosts = postsData.data?.filter(p => p.is_published).length || 0;
  const draftPosts = totalPosts - publishedPosts;

  // Calculate user stats
  const totalUsers = usersData.count || 0;

  // Calculate form entry stats
  const totalFormEntries = formEntriesData.data?.length || 0;
  const unreadFormEntries = formEntriesData.data?.filter(f => f.status === 'new').length || 0;

  return {
    totalPages,
    publishedPages,
    draftPages,
    totalPosts,
    publishedPosts,
    draftPosts,
    totalUsers,
    totalFormEntries,
    unreadFormEntries,
  };
}

// ==================== USERS ====================

export interface User {
  _id?: string;
  id?: string;
  email: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export async function createUser(input: {
  email: string;
  password: string;
  role?: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  const { email, password, role = 'user', firstName, lastName } = input;
  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('[Supabase] Error creating auth user:', signUpError);
    throw new Error(signUpError.message);
  }

  const newUserId = signUpData.user?.id;
  if (!newUserId) {
    throw new Error('Failed to create auth user');
  }

  if (adminSession) {
    const { error: restoreError } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
    if (restoreError) {
      console.error('[Supabase] Error restoring admin session:', restoreError);
    }
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: newUserId,
      email: email.toLowerCase(),
      role,
      first_name: firstName || null,
      last_name: lastName || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating user record:', error);
    throw new Error(error.message);
  }

  const camelUser = toCamelCase(data);
  return { ...camelUser, _id: camelUser.id };
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching users:', error);
    throw new Error(error.message);
  }

  return (data || []).map(user => {
    const camelUser = toCamelCase(user);
    return { ...camelUser, _id: camelUser.id };
  });
}

export async function getUserById(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching user:', error);
    throw new Error(error.message);
  }

  const camelUser = toCamelCase(data);
  return { ...camelUser, _id: camelUser.id };
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  // Remove _id and id from updates
  const { _id, id: _, ...cleanUpdates } = updates;
  
  // Transform to snake_case
  const snakeUpdates = toSnakeCase(cleanUpdates);

  const { data, error } = await supabase
    .from('users')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating user:', error);
    throw new Error(error.message);
  }

  const camelUser = toCamelCase(data);
  return { ...camelUser, _id: camelUser.id };
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting user:', error);
    throw new Error(error.message);
  }
}

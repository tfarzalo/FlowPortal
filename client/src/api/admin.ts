import api from './api';
import axios from 'axios';

// ==================== SITE SETTINGS ====================

export interface ServiceBlock {
  id: string;
  title: string;
  description: string;
  iconName: string;
  enabled: boolean;
}

export interface SiteSettings {
  _id: string;
  siteName: string;
  tagline: string;
  siteUrl: string; // Full URL to the production site (e.g., https://newportplumbing.com)
  logoUrl?: string;
  faviconUrl?: string;
  landingPageIconUrl?: string; // Dedicated icon/logo for landing page hero section
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
  privacyStatement?: string; // HTML content for privacy/SMS consent statement in footer
  comingSoonMode: boolean;
  defaultTheme: 'light' | 'dark';
  // Button styling configuration
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
  // Landing page configuration
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
  updatedAt: string;
}

// Description: Get site settings (public endpoint - no auth required)
// Endpoint: GET /api/site-settings
// Request: {}
// Response: { settings: SiteSettings }
export const getPublicSiteSettings = async () => {
  try {
    const response = await axios.get('/api/site-settings');
    return response.data.settings;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get site settings (admin endpoint - requires auth)
// Endpoint: GET /api/admin/settings
// Request: {}
// Response: { settings: SiteSettings }
export const getSiteSettings = async () => {
  try {
    const response = await api.get('/api/admin/settings');
    return response.data.settings;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Update site settings
// Endpoint: PUT /api/admin/settings
// Request: Partial<SiteSettings>
// Response: { settings: SiteSettings }
export const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
  try {
    const response = await api.put('/api/admin/settings', settings);
    return response.data.settings;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// ==================== PAGES ====================

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  createdBy: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Description: Get all pages
// Endpoint: GET /api/admin/pages
// Request: { publishedOnly?: boolean }
// Response: { pages: Page[] }
export const getPages = async (publishedOnly: boolean = false) => {
  try {
    const response = await api.get('/api/admin/pages', {
      params: { publishedOnly }
    });
    return response.data.pages;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get page by ID
// Endpoint: GET /api/admin/pages/:id
// Request: {}
// Response: { page: Page }
export const getPageById = async (id: string) => {
  try {
    const response = await api.get(`/api/admin/pages/${id}`);
    return response.data.page;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Create a new page
// Endpoint: POST /api/admin/pages
// Request: { title: string, slug: string, content: string, metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { page: Page }
export const createPage = async (pageData: Partial<Page>) => {
  try {
    const response = await api.post('/api/admin/pages', pageData);
    return response.data.page;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Update a page
// Endpoint: PUT /api/admin/pages/:id
// Request: { title?: string, slug?: string, content?: string, metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { page: Page }
export const updatePage = async (id: string, updates: Partial<Page>) => {
  try {
    const response = await api.put(`/api/admin/pages/${id}`, updates);
    return response.data.page;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Delete a page
// Endpoint: DELETE /api/admin/pages/:id
// Request: {}
// Response: { success: boolean }
export const deletePage = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/pages/${id}`);
    return response.data.success;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// ==================== POSTS ====================

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  category: string;
  tags: string[];
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdBy: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Description: Get all posts
// Endpoint: GET /api/admin/posts
// Request: { publishedOnly?: boolean, category?: string }
// Response: { posts: Post[] }
export const getPosts = async (publishedOnly: boolean = false, category?: string) => {
  try {
    const response = await api.get('/api/admin/posts', {
      params: { publishedOnly, category }
    });
    return response.data.posts;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get post by ID
// Endpoint: GET /api/admin/posts/:id
// Request: {}
// Response: { post: Post }
export const getPostById = async (id: string) => {
  try {
    const response = await api.get(`/api/admin/posts/${id}`);
    return response.data.post;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Create a new post
// Endpoint: POST /api/admin/posts
// Request: { title: string, slug: string, content: string, excerpt?: string, featuredImageUrl?: string, category?: string, tags?: string[], metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { post: Post }
export const createPost = async (postData: Partial<Post>) => {
  try {
    const response = await api.post('/api/admin/posts', postData);
    return response.data.post;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Update a post
// Endpoint: PUT /api/admin/posts/:id
// Request: { title?: string, slug?: string, content?: string, excerpt?: string, featuredImageUrl?: string, category?: string, tags?: string[], metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { post: Post }
export const updatePost = async (id: string, updates: Partial<Post>) => {
  try {
    const response = await api.put(`/api/admin/posts/${id}`, updates);
    return response.data.post;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Delete a post
// Endpoint: DELETE /api/admin/posts/:id
// Request: {}
// Response: { success: boolean }
export const deletePost = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/posts/${id}`);
    return response.data.success;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// ==================== DASHBOARD STATS ====================

export interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  totalPosts: number;
  publishedPosts: number;
}

// Description: Get admin dashboard stats
// Endpoint: GET /api/admin/stats
// Request: {}
// Response: { stats: DashboardStats }
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/stats');
    return response.data.stats;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// ==================== EXPORT ====================

export interface ExportInfo {
  fileCount: number;
  totalSize: number;
  formattedSize: string;
}

// Description: Get export information (file count and size)
// Endpoint: GET /api/admin/export/info
// Request: {}
// Response: { fileCount: number, totalSize: number, formattedSize: string }
export const getExportInfo = async () => {
  try {
    const response = await api.get('/api/admin/export/info');
    return response.data as ExportInfo;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Download application source code as zip
// Endpoint: GET /api/admin/export/download
// Request: {}
// Response: Blob (zip file)
export const downloadApplicationZip = async () => {
  try {
    console.log('[downloadApplicationZip] Starting download request...');

    const response = await api.get('/api/admin/export/download', {
      responseType: 'blob'
    });

    console.log('[downloadApplicationZip] Response received:', {
      status: response.status,
      dataType: typeof response.data,
      dataSize: response.data?.size || 'unknown',
      headers: response.headers
    });

    // Verify we received actual blob data
    if (!response.data || response.data.size === 0) {
      throw new Error('Received empty file from server');
    }

    // Create a blob from the response
    const blob = new Blob([response.data], { type: 'application/zip' });
    console.log('[downloadApplicationZip] Blob created:', blob.size, 'bytes');

    // Create a temporary download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'FlowPortal-export.zip';
    if (contentDisposition) {
      // Match filename with or without quotes and capture only the name
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        // Remove surrounding quotes if present
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    console.log('[downloadApplicationZip] Triggering download with filename:', filename);

    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);

    // Force download
    link.click();

    // Small delay before cleanup to ensure download starts
    await new Promise(resolve => setTimeout(resolve, 100));

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log('[downloadApplicationZip] Download triggered successfully');
    return { success: true };
  } catch (error: unknown) {
    console.error('[downloadApplicationZip] Download error:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to download application');
  }
};

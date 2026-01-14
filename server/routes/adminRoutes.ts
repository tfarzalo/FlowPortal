import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import { ROLES } from 'shared';
import siteSettingsService from '../services/siteSettingsService';
import pageService from '../services/pageService';
import postService from '../services/postService';
import exportService from '../services/exportService';
import { IUser } from '../services/userService';
import { transformSiteSettings, transformPage, transformPost, transformKeysToCamel, transformKeysToSnake } from '../utils/dataTransformers';

const router = express.Router();

interface AuthRequest extends Request {
  user?: IUser;
}

// ==================== SITE SETTINGS ====================

// Description: Get site settings
// Endpoint: GET /api/admin/settings
// Request: {}
// Response: { settings: ISiteSettings }
router.get('/settings', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log('Fetching site settings');
    const settings = await siteSettingsService.getSettings();
    const transformed = transformSiteSettings(settings);
    res.status(200).json({ settings: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching site settings: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update site settings
// Endpoint: PUT /api/admin/settings
// Request: Partial<ISiteSettings>
// Response: { settings: ISiteSettings }
router.put('/settings', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log('[AdminRoutes] Updating site settings, received fields:', Object.keys(req.body));
    console.log('[AdminRoutes] Logo URL in request:', req.body.logoUrl);
    console.log('[AdminRoutes] Favicon URL in request:', req.body.faviconUrl);

    // Transform incoming camelCase data to snake_case for Supabase
    const snakeCaseData = transformKeysToSnake(req.body);
    console.log('[AdminRoutes] Transformed to snake_case, fields:', Object.keys(snakeCaseData));

    const settings = await siteSettingsService.updateSettings(snakeCaseData);
    const transformed = transformSiteSettings(settings);

    console.log('[AdminRoutes] Settings updated, returning response');

    res.status(200).json({ settings: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(`[AdminRoutes] Error updating site settings: ${errorMessage}`);
    console.error('[AdminRoutes] Error stack:', errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// ==================== PAGES ====================

// Description: Get all pages
// Endpoint: GET /api/admin/pages
// Request: { publishedOnly?: boolean }
// Response: { pages: IPage[] }
router.get('/pages', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const publishedOnly = req.query.publishedOnly === 'true';
    console.log(`Fetching all pages (publishedOnly: ${publishedOnly})`);
    const pages = await pageService.getAllPages(publishedOnly);
    const transformed = pages.map(transformPage);
    res.status(200).json({ pages: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching pages: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get page by ID
// Endpoint: GET /api/admin/pages/:id
// Request: {}
// Response: { page: IPage }
router.get('/pages/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log(`Fetching page with ID: ${req.params.id}`);
    const page = await pageService.getPageById(req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    const transformed = transformPage(page);
    res.status(200).json({ page: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching page: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Create a new page
// Endpoint: POST /api/admin/pages
// Request: { title: string, slug: string, content: string, metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { page: IPage }
router.post('/pages', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`Creating new page: ${req.body.title}`);
    const snakeCaseData = transformKeysToSnake(req.body);
    const page = await pageService.createPage(snakeCaseData, req.user?.id);
    const transformed = transformPage(page);
    res.status(201).json({ page: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating page: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update a page
// Endpoint: PUT /api/admin/pages/:id
// Request: { title?: string, slug?: string, content?: string, metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { page: IPage }
router.put('/pages/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log(`Updating page with ID: ${req.params.id}`);
    const snakeCaseData = transformKeysToSnake(req.body);
    const page = await pageService.updatePage(req.params.id, snakeCaseData);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    const transformed = transformPage(page);
    res.status(200).json({ page: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating page: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Delete a page
// Endpoint: DELETE /api/admin/pages/:id
// Request: {}
// Response: { success: boolean }
router.delete('/pages/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log(`Deleting page with ID: ${req.params.id}`);
    const success = await pageService.deletePage(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting page: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// ==================== POSTS ====================

// Description: Get all posts
// Endpoint: GET /api/admin/posts
// Request: { publishedOnly?: boolean, category?: string }
// Response: { posts: IPost[] }
router.get('/posts', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const publishedOnly = req.query.publishedOnly === 'true';
    const category = req.query.category as string;

    console.log(`Fetching all posts (publishedOnly: ${publishedOnly}, category: ${category || 'all'})`);

    let posts;
    if (category) {
      posts = await postService.getPostsByCategory(category, publishedOnly);
    } else {
      posts = await postService.getAllPosts(publishedOnly);
    }

    const transformed = posts.map(transformPost);
    res.status(200).json({ posts: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching posts: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get post by ID
// Endpoint: GET /api/admin/posts/:id
// Request: {}
// Response: { post: IPost }
router.get('/posts/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log(`Fetching post with ID: ${req.params.id}`);
    const post = await postService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const transformed = transformPost(post);
    res.status(200).json({ post: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching post: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Create a new post
// Endpoint: POST /api/admin/posts
// Request: { title: string, slug: string, content: string, excerpt?: string, featuredImageUrl?: string, category?: string, tags?: string[], metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { post: IPost }
router.post('/posts', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`Creating new post: ${req.body.title}`);
    const snakeCaseData = transformKeysToSnake(req.body);
    const post = await postService.createPost(snakeCaseData, req.user?.id);
    const transformed = transformPost(post);
    res.status(201).json({ post: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating post: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update a post
// Endpoint: PUT /api/admin/posts/:id
// Request: { title?: string, slug?: string, content?: string, excerpt?: string, featuredImageUrl?: string, category?: string, tags?: string[], metaDescription?: string, metaKeywords?: string, isPublished?: boolean }
// Response: { post: IPost }
router.put('/posts/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log(`Updating post with ID: ${req.params.id}`);
    const snakeCaseData = transformKeysToSnake(req.body);
    const post = await postService.updatePost(req.params.id, snakeCaseData);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const transformed = transformPost(post);
    res.status(200).json({ post: transformed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating post: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Delete a post
// Endpoint: DELETE /api/admin/posts/:id
// Request: {}
// Response: { success: boolean }
router.delete('/posts/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log(`Deleting post with ID: ${req.params.id}`);
    const success = await postService.deletePost(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting post: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get admin dashboard stats
// Endpoint: GET /api/admin/stats
// Request: {}
// Response: { stats: { totalPages: number, totalPosts: number, publishedPages: number, publishedPosts: number } }
router.get('/stats', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log('Fetching admin dashboard stats');
    const [allPages, publishedPages, allPosts, publishedPosts] = await Promise.all([
      pageService.getAllPages(false),
      pageService.getAllPages(true),
      postService.getAllPosts(false),
      postService.getAllPosts(true),
    ]);

    const stats = {
      totalPages: allPages.length,
      publishedPages: publishedPages.length,
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
    };

    res.status(200).json({ stats });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching admin stats: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// ==================== EXPORT ====================

// Description: Download application source code as zip
// Endpoint: GET /api/admin/export/download
// Request: {}
// Response: application/zip file stream
router.get('/export/download', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log('[AdminRoutes] Starting application export download');
    await exportService.createApplicationZip(res);
    console.log('[AdminRoutes] Application export completed successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(`[AdminRoutes] Error exporting application: ${errorMessage}`);
    console.error('[AdminRoutes] Error stack:', errorStack);

    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    }
  }
});

// Description: Get export information (file count and size)
// Endpoint: GET /api/admin/export/info
// Request: {}
// Response: { fileCount: number, totalSize: number, formattedSize: string }
router.get('/export/info', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    console.log('[AdminRoutes] Fetching export information');
    const info = await exportService.getExportSize();

    // Format size to human-readable format
    const formatSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    res.status(200).json({
      fileCount: info.fileCount,
      totalSize: info.totalSize,
      formattedSize: formatSize(info.totalSize)
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[AdminRoutes] Error fetching export info: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;

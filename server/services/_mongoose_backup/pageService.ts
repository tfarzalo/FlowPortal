import Page, { IPage } from '../models/Page';
import mongoose from 'mongoose';

class PageService {
  /**
   * Create a new page
   */
  async createPage(pageData: Partial<IPage>, userId: string): Promise<IPage> {
    const page = new Page({
      ...pageData,
      createdBy: userId,
    });

    await page.save();
    return page;
  }

  /**
   * Get all pages (with optional filter for published status)
   */
  async getAllPages(publishedOnly: boolean = false): Promise<IPage[]> {
    const filter = publishedOnly ? { isPublished: true } : {};
    return await Page.find(filter)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
  }

  /**
   * Get page by ID
   */
  async getPageById(id: string): Promise<IPage | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Page.findById(id).populate('createdBy', 'email');
  }

  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string): Promise<IPage | null> {
    return await Page.findOne({ slug }).populate('createdBy', 'email');
  }

  /**
   * Update page
   */
  async updatePage(id: string, updates: Partial<IPage>): Promise<IPage | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Page.findByIdAndUpdate(id, updates, { new: true }).populate('createdBy', 'email');
  }

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Page.findByIdAndDelete(id);
    return !!result;
  }
}

export default new PageService();

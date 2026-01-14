import Post, { IPost } from '../models/Post';
import mongoose from 'mongoose';

class PostService {
  /**
   * Create a new post
   */
  async createPost(postData: Partial<IPost>, userId: string): Promise<IPost> {
    const post = new Post({
      ...postData,
      createdBy: userId,
      publishedAt: postData.isPublished ? new Date() : undefined,
    });

    await post.save();
    return post;
  }

  /**
   * Get all posts (with optional filter for published status)
   */
  async getAllPosts(publishedOnly: boolean = false): Promise<IPost[]> {
    const filter = publishedOnly ? { isPublished: true } : {};
    return await Post.find(filter)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
  }

  /**
   * Get post by ID
   */
  async getPostById(id: string): Promise<IPost | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Post.findById(id).populate('createdBy', 'email');
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string): Promise<IPost | null> {
    return await Post.findOne({ slug }).populate('createdBy', 'email');
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: string, publishedOnly: boolean = false): Promise<IPost[]> {
    const filter: any = { category };
    if (publishedOnly) {
      filter.isPublished = true;
    }
    return await Post.find(filter)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
  }

  /**
   * Update post
   */
  async updatePost(id: string, updates: Partial<IPost>): Promise<IPost | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    // If publishing the post, set publishedAt
    if (updates.isPublished) {
      const post = await Post.findById(id);
      if (post && !post.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    return await Post.findByIdAndUpdate(id, updates, { new: true }).populate('createdBy', 'email');
  }

  /**
   * Delete post
   */
  async deletePost(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Post.findByIdAndDelete(id);
    return !!result;
  }
}

export default new PostService();

import FormEntry, { IFormEntry } from '../models/FormEntry';

export class FormEntryService {
  /**
   * Create a new form entry
   */
  static async createEntry(data: {
    formType: string;
    data: Record<string, any>;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IFormEntry> {
    console.log(`[FormEntryService] Creating form entry for type: ${data.formType}`);

    const entry = new FormEntry(data);
    await entry.save();

    console.log(`[FormEntryService] Form entry created with ID: ${entry._id}`);
    return entry;
  }

  /**
   * Get all form entries with optional filtering
   */
  static async getAllEntries(filters?: {
    formType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }): Promise<IFormEntry[]> {
    console.log('[FormEntryService] Fetching form entries with filters:', filters);

    const query: any = {};

    if (filters?.formType) {
      query.formType = filters.formType;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    if (filters?.searchQuery) {
      query.$or = [
        { customerName: { $regex: filters.searchQuery, $options: 'i' } },
        { customerEmail: { $regex: filters.searchQuery, $options: 'i' } },
        { customerPhone: { $regex: filters.searchQuery, $options: 'i' } },
      ];
    }

    const entries = await FormEntry.find(query).sort({ createdAt: -1 });
    console.log(`[FormEntryService] Found ${entries.length} entries`);

    return entries;
  }

  /**
   * Get a single form entry by ID
   */
  static async getEntryById(id: string): Promise<IFormEntry | null> {
    console.log(`[FormEntryService] Fetching form entry by ID: ${id}`);
    const entry = await FormEntry.findById(id);

    if (!entry) {
      console.log('[FormEntryService] Form entry not found');
      return null;
    }

    return entry;
  }

  /**
   * Update form entry status and notes
   */
  static async updateEntry(
    id: string,
    updates: {
      status?: 'new' | 'read' | 'replied' | 'archived';
      notes?: string;
    }
  ): Promise<IFormEntry | null> {
    console.log(`[FormEntryService] Updating form entry: ${id}`, updates);

    const entry = await FormEntry.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!entry) {
      console.log('[FormEntryService] Form entry not found for update');
      return null;
    }

    console.log('[FormEntryService] Form entry updated successfully');
    return entry;
  }

  /**
   * Delete a form entry
   */
  static async deleteEntry(id: string): Promise<boolean> {
    console.log(`[FormEntryService] Deleting form entry: ${id}`);

    const result = await FormEntry.findByIdAndDelete(id);

    if (!result) {
      console.log('[FormEntryService] Form entry not found for deletion');
      return false;
    }

    console.log('[FormEntryService] Form entry deleted successfully');
    return true;
  }

  /**
   * Get form entry statistics
   */
  static async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byFormType: Record<string, number>;
    recentCount: number;
  }> {
    console.log('[FormEntryService] Calculating form entry statistics');

    const [total, byStatus, byFormType, recentCount] = await Promise.all([
      FormEntry.countDocuments(),
      FormEntry.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      FormEntry.aggregate([
        { $group: { _id: '$formType', count: { $sum: 1 } } },
      ]),
      FormEntry.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusMap[item._id] = item.count;
    });

    const formTypeMap: Record<string, number> = {};
    byFormType.forEach((item: any) => {
      formTypeMap[item._id] = item.count;
    });

    return {
      total,
      byStatus: statusMap,
      byFormType: formTypeMap,
      recentCount,
    };
  }
}

export default FormEntryService;

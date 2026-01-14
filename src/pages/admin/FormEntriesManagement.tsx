import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import {
  getFormEntries,
  getFormEntryById,
  updateFormEntry,
  deleteFormEntry,
  getFormEntryStats,
  type FormEntry,
  type FormEntryStats,
} from '@/api/forms';

export default function FormEntriesManagement() {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [stats, setStats] = useState<FormEntryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [statusFilter, formTypeFilter, searchQuery]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (formTypeFilter !== 'all') filters.formType = formTypeFilter;
      if (searchQuery) filters.searchQuery = searchQuery;

      const response = await getFormEntries(filters);
      setEntries(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load form entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getFormEntryStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewEntry = async (id: string) => {
    try {
      const response = await getFormEntryById(id);
      setSelectedEntry(response);
      setViewDialogOpen(true);

      // Mark as read if it's new
      if (response.status === 'new') {
        await updateFormEntry(id, { status: 'read' });
        fetchEntries();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error fetching entry:', error);
      toast.error('Failed to load entry details');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    try {
      await updateFormEntry(id, { status });
      toast.success('Status updated successfully');
      fetchEntries();
      fetchStats();
      if (selectedEntry && selectedEntry._id === id) {
        setSelectedEntry({ ...selectedEntry, status });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      await updateFormEntry(id, { notes });
      toast.success('Notes saved successfully');
      fetchEntries();
      if (selectedEntry && selectedEntry._id === id) {
        setSelectedEntry({ ...selectedEntry, notes });
      }
    } catch (error: any) {
      console.error('Error updating notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      await deleteFormEntry(entryToDelete);
      toast.success('Entry deleted successfully');
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      fetchEntries();
      fetchStats();
      if (selectedEntry && selectedEntry._id === entryToDelete) {
        setViewDialogOpen(false);
        setSelectedEntry(null);
      }
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-blue-500',
      read: 'bg-yellow-500',
      replied: 'bg-green-500',
      archived: 'bg-gray-500',
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Form Entries</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all form submissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.new || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Replied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.replied || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search form entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Form Type</Label>
              <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
          <CardDescription>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No form entries found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Form Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="text-sm">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.customerName || 'N/A'}
                      </TableCell>
                      <TableCell>{entry.customerEmail || 'N/A'}</TableCell>
                      <TableCell>{entry.customerPhone || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{entry.formType}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEntry(entry._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEntryToDelete(entry._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Entry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Entry Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedEntry && formatDate(selectedEntry.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <div className="text-sm mt-1">{selectedEntry.customerName || 'N/A'}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedEntry.status}
                    onValueChange={(value: any) => handleUpdateStatus(selectedEntry._id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="text-sm mt-1">
                    <a href={`mailto:${selectedEntry.customerEmail}`} className="text-blue-600 hover:underline">
                      {selectedEntry.customerEmail || 'N/A'}
                    </a>
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="text-sm mt-1">
                    <a href={`tel:${selectedEntry.customerPhone}`} className="text-blue-600 hover:underline">
                      {selectedEntry.customerPhone || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Form Data</Label>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  {Object.entries(selectedEntry.data).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <div className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="col-span-2">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea
                  value={selectedEntry.notes || ''}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry, notes: e.target.value })}
                  placeholder="Add internal notes about this submission..."
                  rows={4}
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdateNotes(selectedEntry._id, selectedEntry.notes || '')}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntry}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { uploadMedia, getMedia, deleteMedia, updateMedia, Media } from '@/api/media';
import { getMediaUrl } from '@/config/api';
import { Loader2, Trash2, Upload, Download, Edit2, X, Check, ExternalLink, Copy } from 'lucide-react';

export default function MediaManagement() {
  const { user } = useAuth();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const categories = ['image', 'logo', 'pdf', 'document', 'other'];

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia();
  }, [filterCategory]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const media = await getMedia(filterCategory || undefined);
      setMediaList(media);
    } catch (error: any) {
      toast.error(`Failed to fetch media: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }

    try {
      setUploadLoading(true);
      await uploadMedia(selectedFile, category, description);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      setCategory('');
      setDescription('');
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Refresh the list
      fetchMedia();
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      await deleteMedia(id);
      toast.success('Media deleted successfully!');
      fetchMedia();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const startEdit = (media: Media) => {
    setEditingMedia(media._id);
    setEditDescription(media.description || '');
    setEditCategory(media.category);
  };

  const cancelEdit = () => {
    setEditingMedia(null);
    setEditDescription('');
    setEditCategory('');
  };

  const saveEdit = async (id: string) => {
    try {
      await updateMedia(id, {
        description: editDescription,
        category: editCategory,
      });
      toast.success('Media updated successfully!');
      cancelEdit();
      fetchMedia();
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType?: string): string => {
    if (!mimeType) return '📁';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const copyUrlToClipboard = (url: string) => {
    const fullUrl = getMediaUrl(url);
    console.log('[MediaManagement] Copying URL to clipboard:', fullUrl);
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success('URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  };

  const viewInNewTab = (url: string) => {
    // Construct the full URL - handle both absolute and relative URLs
    const fullUrl = getMediaUrl(url);
    console.log('[MediaManagement] Opening URL in new tab:', fullUrl);
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">Media Management</h1>

      {user ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Media</CardTitle>
            <CardDescription>Upload images, logos, PDFs, documents, and other files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button onClick={handleUpload} disabled={uploadLoading || !selectedFile}>
                {uploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please <a href="/login" className="text-primary underline">log in</a> to upload media files.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Browse and manage uploaded media files</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="filter">Filter:</Label>
              <Select value={filterCategory || "all"} onValueChange={(value) => setFilterCategory(value === "all" ? "" : value)}>
                <SelectTrigger id="filter" className="w-[150px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : mediaList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No media files found. Upload some files to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {mediaList.map((media) => (
                <Card key={media._id}>
                  <CardContent className="pt-6">
                    {editingMedia === media._id ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getFileIcon(media.mimeType)}</span>
                            <div>
                              <p className="font-medium">{media.originalName}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(media.size)} • {media.mimeType}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Category</Label>
                          <Select value={editCategory} onValueChange={setEditCategory}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => saveEdit(media._id)} size="sm">
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={cancelEdit} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-3xl">{getFileIcon(media.mimeType)}</span>
                          <div className="flex-1">
                            <p className="font-medium">{media.originalName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(media.size)} • {media.category}
                            </p>
                            {media.description && (
                              <p className="text-sm mt-1">{media.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded {new Date(media.createdAt).toLocaleDateString()}
                              {media.uploadedBy && ` by ${media.uploadedBy.email}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                              URL: {media.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewInNewTab(media.url)}
                            title="View in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyUrlToClipboard(media.url)}
                            title="Copy URL to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewInNewTab(media.url)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {user && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(media)}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(media._id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPages, deletePage, Page } from "../../api/admin";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getPages(false);
      setPages(data);
    } catch (error: any) {
      toast.error(`Failed to load pages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;

    try {
      await deletePage(pageToDelete._id);
      toast.success("Page deleted successfully");
      loadPages();
    } catch (error: any) {
      toast.error(`Failed to delete page: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const confirmDelete = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pages</h1>
          <p className="text-muted-foreground">
            Manage your site's static pages
          </p>
        </div>
        <Button onClick={() => navigate('/admin/pages/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No pages found</p>
              <Button onClick={() => navigate('/admin/pages/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Page
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page._id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      /{page.slug}
                    </TableCell>
                    <TableCell>
                      {page.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {page.isPublished && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/${page.slug}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/pages/edit/${page._id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(page)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page "{pageToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

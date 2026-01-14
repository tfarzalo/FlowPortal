import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, deletePost, Post } from "../../api/admin";
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

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts(false);
      setPosts(data);
    } catch (error: any) {
      toast.error(`Failed to load posts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await deletePost(postToDelete._id);
      toast.success("Post deleted successfully");
      loadPosts();
    } catch (error: any) {
      toast.error(`Failed to delete post: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const confirmDelete = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and articles
          </p>
        </div>
        <Button onClick={() => navigate('/admin/posts/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts found</p>
              <Button onClick={() => navigate('/admin/posts/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {post.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.isPublished && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/posts/edit/${post._id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(post)}
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
              This will permanently delete the post "{postToDelete?.title}".
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

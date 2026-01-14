import { useEffect, useState, useMemo, Suspense, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPageById, createPage, updatePage } from "../../api/admin";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ArrowLeft, Save, Code, Eye } from "lucide-react";
import { toast } from "sonner";
import 'react-quill/dist/quill.snow.css';

// Lazy load ReactQuill to reduce initial bundle and avoid findDOMNode warnings in strict mode
const ReactQuill = lazy(() => import('react-quill'));

const EditorLoadingFallback = () => (
  <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center text-muted-foreground">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p>Loading editor...</p>
    </div>
  </div>
);

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    metaDescription: "",
    metaKeywords: "",
    isPublished: false,
  });

  // Quill editor modules configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  useEffect(() => {
    if (isEditMode && id) {
      loadPage(id);
    }
  }, [id, isEditMode]);

  const loadPage = async (pageId: string) => {
    try {
      setLoading(true);
      const page = await getPageById(pageId);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaDescription: page.metaDescription || "",
        metaKeywords: page.metaKeywords || "",
        isPublished: page.isPublished,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Failed to load page: ${err.message || 'Unknown error'}`);
      navigate("/admin/pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      setSaving(true);
      if (isEditMode && id) {
        await updatePage(id, formData);
        toast.success("Page updated successfully");
      } else {
        await createPage(formData);
        toast.success("Page created successfully");
      }
      navigate("/admin/pages");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Failed to save page: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title }));
    // Auto-generate slug from title if creating new page and slug hasn't been manually edited
    if (!isEditMode && !formData.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/pages")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pages
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Page" : "Create New Page"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode
            ? "Update the page content and settings"
            : "Create a new static page for your site"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter page title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="page-url-slug"
                required
              />
              <p className="text-sm text-muted-foreground">
                The URL slug for this page (e.g., "about" for /about)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content *</Label>
                <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'visual' | 'code')} className="w-auto">
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="visual" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Visual
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {editorMode === 'visual' ? (
                <div className="border rounded-md quill-wrapper">
                  <Suspense fallback={<EditorLoadingFallback />}>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter page content..."
                    />
                  </Suspense>
                </div>
              ) : (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter page content (HTML supported)"
                  className="min-h-[400px] font-mono text-sm"
                  required
                />
              )}
              <p className="text-sm text-muted-foreground">
                {editorMode === 'visual'
                  ? 'Use the visual editor with formatting tools, or switch to Code mode to edit HTML directly.'
                  : 'Edit HTML code directly. Switch to Visual mode for a WYSIWYG editor.'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked })
                }
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish this page
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="Brief description for search engines"
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Recommended length: 150-160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={formData.metaKeywords}
                onChange={(e) =>
                  setFormData({ ...formData, metaKeywords: e.target.value })
                }
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of keywords
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : isEditMode ? "Update Page" : "Create Page"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/pages")}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

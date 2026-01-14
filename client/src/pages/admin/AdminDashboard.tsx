import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats, downloadApplicationZip, getExportInfo, ExportInfo } from "../../api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FileText, NewspaperIcon, CheckCircle, Clock, Download, Package } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportInfo, setExportInfo] = useState<ExportInfo | null>(null);
  const [downloading, setDownloading] = useState(false);

  console.log('[AdminDashboard] Component rendering');

  useEffect(() => {
    console.log('[AdminDashboard] useEffect running, loading stats');
    loadStats();
    loadExportInfo();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error(`Failed to load dashboard stats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadExportInfo = async () => {
    try {
      const info = await getExportInfo();
      setExportInfo(info);
    } catch (error: any) {
      console.error('Failed to load export info:', error.message);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      toast.info('Preparing download... This may take a few moments.');

      console.log('[AdminDashboard] Starting download process...');
      await downloadApplicationZip();

      console.log('[AdminDashboard] Download completed');
      toast.success('Application downloaded successfully!');
    } catch (error: any) {
      console.error('[AdminDashboard] Download error:', error);
      toast.error(`Failed to download application: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDirectDownload = () => {
    // Direct download link as alternative method for iframe/preview environments
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    const downloadUrl = `/api/admin/export/download?token=${encodeURIComponent(token)}`;
    window.open(downloadUrl, '_blank');
    toast.info('Download started in new window');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Pages",
      value: stats.totalPages,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Published Pages",
      value: stats.publishedPages,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: NewspaperIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Published Posts",
      value: stats.publishedPosts,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your site content, settings, and more from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="/admin/pages/new"
              className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold mb-1">Create New Page</h3>
              <p className="text-sm text-muted-foreground">
                Add a new static page to your site
              </p>
            </a>
            <a
              href="/admin/posts/new"
              className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold mb-1">Create New Post</h3>
              <p className="text-sm text-muted-foreground">
                Publish a new blog post or article
              </p>
            </a>
            <a
              href="/admin/media"
              className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold mb-1">Manage Media</h3>
              <p className="text-sm text-muted-foreground">
                Upload and organize your media files
              </p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground">Draft Pages</p>
                <p className="text-2xl font-bold">
                  {stats.totalPages - stats.publishedPages}
                </p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground">Draft Posts</p>
                <p className="text-2xl font-bold">
                  {stats.totalPosts - stats.publishedPosts}
                </p>
              </div>
              <NewspaperIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Export Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Download Source Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download a complete copy of the FlowPortal application source code as a ZIP file.
                  This includes all code files, configurations, and documentation (excluding node_modules,
                  uploads, and build artifacts).
                </p>
                {exportInfo && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{exportInfo.fileCount} files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>~{exportInfo.formattedSize}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Preparing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download ZIP</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDirectDownload}
                  variant="outline"
                  disabled={downloading}
                  className="flex items-center gap-2 text-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Direct Download</span>
                </Button>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The download may take a moment to prepare. If the download doesn't start automatically,
                try the "Direct Download" button which opens in a new window. The exported ZIP file
                will contain the complete application structure, ready for deployment or backup purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

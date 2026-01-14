import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats } from "../../api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, NewspaperIcon, CheckCircle, Clock, Users, FileStack } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[AdminDashboard] Component rendering');

  useEffect(() => {
    console.log('[AdminDashboard] useEffect running, loading stats');
    loadStats();
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
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      title: "Form Entries",
      value: stats.totalFormEntries,
      icon: FileStack,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your site content, settings, and more from here. Now powered by direct Supabase integration!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
            <a
              href="/admin/settings"
              className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold mb-1">Site Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your site name, colors, and more
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
                  {stats.draftPages}
                </p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground">Draft Posts</p>
                <p className="text-2xl font-bold">
                  {stats.draftPosts}
                </p>
              </div>
              <NewspaperIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground">Unread Forms</p>
                <p className="text-2xl font-bold">
                  {stats.unreadFormEntries}
                </p>
              </div>
              <FileStack className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              FlowPortal is now running on a <strong>unified single-page architecture</strong> with direct Supabase integration.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>✅ Direct Supabase authentication (no backend server needed)</li>
              <li>✅ Real-time database queries from the frontend</li>
              <li>✅ Secure file uploads to Supabase Storage</li>
              <li>✅ Row Level Security (RLS) enforced at database level</li>
              <li>✅ Deployed as a single frontend application</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

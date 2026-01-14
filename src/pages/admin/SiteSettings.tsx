import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings as SiteSettingsType, ServiceBlock } from "../../api/admin";
import { getMedia, Media } from "../../api/media";
import { getMediaUrl } from "../../config/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import { Save, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";

export default function SiteSettings() {
  const { refetchSettings } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoMedia, setLogoMedia] = useState<Media[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [faviconDialogOpen, setFaviconDialogOpen] = useState(false);
  const [landingIconDialogOpen, setLandingIconDialogOpen] = useState(false);
  const [heroBackgroundDialogOpen, setHeroBackgroundDialogOpen] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLogoMedia();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('[SiteSettings] Loading settings...');
      const data = await getSiteSettings();
      console.log('[SiteSettings] Settings loaded successfully:', {
        siteName: data.siteName,
        hasLogo: !!data.logoUrl,
        hasFavicon: !!data.faviconUrl,
        hasSocialMedia: !!data.socialMedia,
        hasBusinessHours: !!data.businessHours
      });

      // Ensure socialMedia and businessHours are initialized
      if (!data.socialMedia) {
        console.warn('[SiteSettings] socialMedia is undefined, initializing to empty object');
        data.socialMedia = {};
      }
      if (!data.businessHours) {
        console.warn('[SiteSettings] businessHours is undefined, initializing to defaults');
        data.businessHours = {
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 5:00 PM',
          saturday: 'Closed',
          sunday: 'Closed'
        };
      }
      // Ensure landingPage is initialized
      if (!data.landingPage) {
        console.warn('[SiteSettings] landingPage is undefined, initializing to defaults');
        data.landingPage = {
          companyInfo: {},
          serviceBlocks: []
        };
      }
      if (!data.landingPage.companyInfo) {
        data.landingPage.companyInfo = {};
      }
      if (!data.landingPage.serviceBlocks) {
        data.landingPage.serviceBlocks = [];
      }
      // Ensure buttonStyles is initialized
      if (!data.buttonStyles) {
        console.warn('[SiteSettings] buttonStyles is undefined, initializing to defaults');
        data.buttonStyles = {
          primaryButtonBg: '#2563eb',
          primaryButtonText: '#ffffff',
          primaryButtonHoverBg: '#1e40af',
          primaryButtonHoverText: '#ffffff',
          primaryButtonBorder: '0px',
          primaryButtonBorderColor: '#2563eb',
          secondaryButtonBg: 'transparent',
          secondaryButtonText: '#2563eb',
          secondaryButtonHoverBg: '#2563eb',
          secondaryButtonHoverText: '#ffffff',
          secondaryButtonBorder: '2px',
          secondaryButtonBorderColor: '#2563eb'
        };
      }

      setSettings(data);
    } catch (error: any) {
      console.error('[SiteSettings] Error loading settings:', error);
      toast.error(`Failed to load settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadLogoMedia = async () => {
    try {
      setLoadingLogos(true);
      console.log('[SiteSettings] Loading logo media...');
      const media = await getMedia('logo');
      console.log('[SiteSettings] Loaded logo media successfully:', {
        count: media.length,
        items: media.map(m => ({ name: m.originalName, url: m.url }))
      });
      setLogoMedia(media);
    } catch (error: any) {
      console.error('[SiteSettings] Failed to load logo media:', error);
      toast.error(`Failed to load logo media: ${error.message}`);
    } finally {
      setLoadingLogos(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      console.log('[SiteSettings] Saving settings...', {
        siteName: settings.siteName,
        hasLogo: !!settings.logoUrl,
        hasFavicon: !!settings.faviconUrl
      });
      const updatedSettings = await updateSiteSettings(settings);
      setSettings(updatedSettings);
      await refetchSettings();
      console.log('[SiteSettings] Settings saved successfully');
      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error('[SiteSettings] Failed to save settings:', error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const selectLogo = (media: Media) => {
    if (!settings) return;
    console.log('[SiteSettings] Selected logo:', media);
    // Store the relative URL path (e.g., /uploads/file.png) not the full URL
    const logoUrl = media.url;
    console.log('[SiteSettings] Setting logo URL to:', logoUrl);
    setSettings({ ...settings, logoUrl });
    setLogoDialogOpen(false);
    toast.success(`Logo updated to ${media.originalName}`);
  };

  const selectFavicon = (media: Media) => {
    if (!settings) return;
    console.log('[SiteSettings] Selected favicon:', media);
    // Store the relative URL path (e.g., /uploads/file.png) not the full URL
    const faviconUrl = media.url;
    console.log('[SiteSettings] Setting favicon URL to:', faviconUrl);
    setSettings({ ...settings, faviconUrl });
    setFaviconDialogOpen(false);
    toast.success(`Favicon updated to ${media.originalName}`);
  };

  const updateField = (field: keyof SiteSettingsType, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateBusinessHours = (day: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        [day]: value,
      },
    });
  };

  const updateSocialMedia = (platform: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialMedia: {
        ...settings.socialMedia,
        [platform]: value,
      },
    });
  };

  const selectLandingIcon = (media: Media) => {
    if (!settings) return;
    console.log('[SiteSettings] Selected landing page icon:', media);
    const landingPageIconUrl = media.url;
    console.log('[SiteSettings] Setting landing page icon URL to:', landingPageIconUrl);
    setSettings({ ...settings, landingPageIconUrl });
    setLandingIconDialogOpen(false);
    toast.success(`Landing page icon updated to ${media.originalName}`);
  };

  const selectHeroBackground = (media: Media) => {
    if (!settings) return;
    console.log('[SiteSettings] Selected hero background:', media);
    setSettings({
      ...settings,
      landingPage: {
        ...settings.landingPage,
        heroBackgroundImageUrl: media.url
      }
    });
    setHeroBackgroundDialogOpen(false);
    toast.success(`Hero background updated to ${media.originalName}`);
  };

  const updateLandingPageField = (field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      landingPage: {
        ...settings.landingPage,
        [field]: value,
      },
    });
  };

  const updateCompanyInfo = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      landingPage: {
        ...settings.landingPage,
        companyInfo: {
          ...settings.landingPage.companyInfo,
          [field]: value,
        },
      },
    });
  };

  const addServiceBlock = () => {
    if (!settings) return;
    const newBlock: ServiceBlock = {
      id: `service-${Date.now()}`,
      title: 'New Service',
      description: 'Service description',
      iconName: 'Wrench',
      enabled: true
    };
    setSettings({
      ...settings,
      landingPage: {
        ...settings.landingPage,
        serviceBlocks: [...settings.landingPage.serviceBlocks, newBlock]
      }
    });
  };

  const updateServiceBlock = (id: string, updates: Partial<ServiceBlock>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      landingPage: {
        ...settings.landingPage,
        serviceBlocks: settings.landingPage.serviceBlocks.map(block =>
          block.id === id ? { ...block, ...updates } : block
        )
      }
    });
  };

  const deleteServiceBlock = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      landingPage: {
        ...settings.landingPage,
        serviceBlocks: settings.landingPage.serviceBlocks.filter(block => block.id !== id)
      }
    });
  };

  const updateButtonStyle = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      buttonStyles: {
        ...settings.buttonStyles,
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
          <p className="text-muted-foreground">
            Configure your site's branding and contact information
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Site Status & Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comingSoonMode">Coming Soon Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Display a "Coming Soon" page to visitors while you work on the site
                </p>
              </div>
              <Switch
                id="comingSoonMode"
                checked={settings.comingSoonMode}
                onCheckedChange={(checked) => updateField('comingSoonMode', checked)}
              />
            </div>
            <div className="pt-4 border-t">
              <Label htmlFor="defaultTheme">Default Theme</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose the default theme for your landing page
              </p>
              <Select
                value={settings.defaultTheme}
                onValueChange={(value) => updateField('defaultTheme', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateField('siteName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="siteUrl">Site URL</Label>
              <p className="text-sm text-muted-foreground mb-2">
                The full URL of your website (e.g., https://newportplumbing.com)
              </p>
              <Input
                id="siteUrl"
                type="url"
                placeholder="https://example.com"
                value={settings.siteUrl || ''}
                onChange={(e) => updateField('siteUrl', e.target.value)}
              />
            </div>

            {/* Logo and Favicon Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Site Logo</Label>
                <div className="flex items-center gap-2 mt-2">
                  {settings.logoUrl && (
                    <div className="w-20 h-20 border rounded flex items-center justify-center bg-gray-50">
                      <img
                        src={getMediaUrl(settings.logoUrl)}
                        alt="Site Logo"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.error('[SiteSettings] Logo image failed to load:', getMediaUrl(settings.logoUrl));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select from Media Library
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Select Logo from Media Library</DialogTitle>
                        <DialogDescription>
                          Choose a logo file from your media library
                        </DialogDescription>
                      </DialogHeader>
                      {loadingLogos ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : logoMedia.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No logo files found in media library. Please upload a logo first.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {logoMedia.map((media) => (
                            <div
                              key={media._id}
                              className="border rounded p-2 cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                              onClick={() => selectLogo(media)}
                            >
                              <div className="aspect-square bg-gray-50 rounded flex items-center justify-center mb-2">
                                <img
                                  src={getMediaUrl(media.url)}
                                  alt={media.originalName}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    console.error('[SiteSettings] Media image failed to load:', getMediaUrl(media.url));
                                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image</text></svg>';
                                  }}
                                />
                              </div>
                              <p className="text-xs truncate text-center">{media.originalName}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                {settings.logoUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {settings.logoUrl}
                  </p>
                )}
              </div>

              <div>
                <Label>Favicon</Label>
                <div className="flex items-center gap-2 mt-2">
                  {settings.faviconUrl && (
                    <div className="w-8 h-8 border rounded flex items-center justify-center bg-gray-50">
                      <img
                        src={getMediaUrl(settings.faviconUrl)}
                        alt="Favicon"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.error('[SiteSettings] Favicon image failed to load:', getMediaUrl(settings.faviconUrl));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <Dialog open={faviconDialogOpen} onOpenChange={setFaviconDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select from Media Library
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Select Favicon from Media Library</DialogTitle>
                        <DialogDescription>
                          Choose a favicon file from your media library
                        </DialogDescription>
                      </DialogHeader>
                      {loadingLogos ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : logoMedia.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No logo files found in media library. Please upload a favicon first.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {logoMedia.map((media) => (
                            <div
                              key={media._id}
                              className="border rounded p-2 cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                              onClick={() => selectFavicon(media)}
                            >
                              <div className="aspect-square bg-gray-50 rounded flex items-center justify-center mb-2">
                                <img
                                  src={getMediaUrl(media.url)}
                                  alt={media.originalName}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    console.error('[SiteSettings] Media image failed to load:', getMediaUrl(media.url));
                                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image</text></svg>';
                                  }}
                                />
                              </div>
                              <p className="text-xs truncate text-center">{media.originalName}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                {settings.faviconUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {settings.faviconUrl}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={settings.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={settings.metaKeywords || ''}
                onChange={(e) => updateField('metaKeywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Button Styles */}
        <Card>
          <CardHeader>
            <CardTitle>Button Styles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Button Styles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Primary Button</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryButtonBg">Background Color</Label>
                  <Input
                    id="primaryButtonBg"
                    type="color"
                    value={settings.buttonStyles?.primaryButtonBg || '#2563eb'}
                    onChange={(e) => updateButtonStyle('primaryButtonBg', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryButtonText">Text Color</Label>
                  <Input
                    id="primaryButtonText"
                    type="color"
                    value={settings.buttonStyles?.primaryButtonText || '#ffffff'}
                    onChange={(e) => updateButtonStyle('primaryButtonText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryButtonBorderColor">Border Color</Label>
                  <Input
                    id="primaryButtonBorderColor"
                    type="color"
                    value={settings.buttonStyles?.primaryButtonBorderColor || '#2563eb'}
                    onChange={(e) => updateButtonStyle('primaryButtonBorderColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryButtonHoverBg">Hover Background</Label>
                  <Input
                    id="primaryButtonHoverBg"
                    type="color"
                    value={settings.buttonStyles?.primaryButtonHoverBg || '#1e40af'}
                    onChange={(e) => updateButtonStyle('primaryButtonHoverBg', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryButtonHoverText">Hover Text Color</Label>
                  <Input
                    id="primaryButtonHoverText"
                    type="color"
                    value={settings.buttonStyles?.primaryButtonHoverText || '#ffffff'}
                    onChange={(e) => updateButtonStyle('primaryButtonHoverText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryButtonBorder">Border Width (px)</Label>
                  <Input
                    id="primaryButtonBorder"
                    type="text"
                    value={settings.buttonStyles?.primaryButtonBorder || '0px'}
                    onChange={(e) => updateButtonStyle('primaryButtonBorder', e.target.value)}
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Button Styles */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Secondary Button</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="secondaryButtonBg">Background Color</Label>
                  <Input
                    id="secondaryButtonBg"
                    type="color"
                    value={settings.buttonStyles?.secondaryButtonBg || '#transparent'}
                    onChange={(e) => updateButtonStyle('secondaryButtonBg', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButtonText">Text Color</Label>
                  <Input
                    id="secondaryButtonText"
                    type="color"
                    value={settings.buttonStyles?.secondaryButtonText || '#2563eb'}
                    onChange={(e) => updateButtonStyle('secondaryButtonText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButtonBorderColor">Border Color</Label>
                  <Input
                    id="secondaryButtonBorderColor"
                    type="color"
                    value={settings.buttonStyles?.secondaryButtonBorderColor || '#2563eb'}
                    onChange={(e) => updateButtonStyle('secondaryButtonBorderColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButtonHoverBg">Hover Background</Label>
                  <Input
                    id="secondaryButtonHoverBg"
                    type="color"
                    value={settings.buttonStyles?.secondaryButtonHoverBg || '#2563eb'}
                    onChange={(e) => updateButtonStyle('secondaryButtonHoverBg', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButtonHoverText">Hover Text Color</Label>
                  <Input
                    id="secondaryButtonHoverText"
                    type="color"
                    value={settings.buttonStyles?.secondaryButtonHoverText || '#ffffff'}
                    onChange={(e) => updateButtonStyle('secondaryButtonHoverText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButtonBorder">Border Width (px)</Label>
                  <Input
                    id="secondaryButtonBorder"
                    type="text"
                    value={settings.buttonStyles?.secondaryButtonBorder || '2px'}
                    onChange={(e) => updateButtonStyle('secondaryButtonBorder', e.target.value)}
                    placeholder="2px"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
              <Input
                id="googleMapsUrl"
                value={settings.googleMapsUrl || ''}
                onChange={(e) => updateField('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.businessHours).map(([day, hours]) => (
              <div key={day} className="grid grid-cols-2 gap-4 items-center">
                <Label className="capitalize">{day}</Label>
                <Input
                  value={hours}
                  onChange={(e) => updateBusinessHours(day, e.target.value)}
                  placeholder="9:00 AM - 5:00 PM"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
              <div key={platform}>
                <Label htmlFor={platform} className="capitalize">{platform}</Label>
                <Input
                  id={platform}
                  value={settings.socialMedia[platform as keyof typeof settings.socialMedia] || ''}
                  onChange={(e) => updateSocialMedia(platform, e.target.value)}
                  placeholder={`https://${platform}.com/...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Landing Page - Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Landing Page - Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Landing Page Icon */}
            <div>
              <Label>Landing Page Icon / Brand Logo</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Icon or logo displayed in the hero section (can be different from main logo)
              </p>
              <div className="flex items-center gap-2 mt-2">
                {settings.landingPageIconUrl && (
                  <div className="w-20 h-20 border rounded flex items-center justify-center bg-gray-50">
                    <img
                      src={getMediaUrl(settings.landingPageIconUrl)}
                      alt="Landing Page Icon"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <Dialog open={landingIconDialogOpen} onOpenChange={setLandingIconDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Select from Media Library
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Landing Page Icon</DialogTitle>
                      <DialogDescription>
                        Choose an icon or logo for the landing page hero section
                      </DialogDescription>
                    </DialogHeader>
                    {loadingLogos ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : logoMedia.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No logo files found in media library.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {logoMedia.map((media) => (
                          <div
                            key={media._id}
                            className="border rounded p-2 cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                            onClick={() => selectLandingIcon(media)}
                          >
                            <div className="aspect-square bg-gray-50 rounded flex items-center justify-center mb-2">
                              <img
                                src={getMediaUrl(media.url)}
                                alt={media.originalName}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <p className="text-xs truncate text-center">{media.originalName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Hero Background Image */}
            <div>
              <Label>Hero Background Image</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Background image for the landing page hero section
              </p>
              <div className="flex items-center gap-2 mt-2">
                {settings.landingPage?.heroBackgroundImageUrl && (
                  <div className="w-32 h-20 border rounded flex items-center justify-center bg-gray-50">
                    <img
                      src={getMediaUrl(settings.landingPage.heroBackgroundImageUrl)}
                      alt="Hero Background"
                      className="max-w-full max-h-full object-cover rounded"
                    />
                  </div>
                )}
                <Dialog open={heroBackgroundDialogOpen} onOpenChange={setHeroBackgroundDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Select from Media Library
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Hero Background Image</DialogTitle>
                      <DialogDescription>
                        Choose a background image for the hero section
                      </DialogDescription>
                    </DialogHeader>
                    {loadingLogos ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : logoMedia.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No images found in media library.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {logoMedia.map((media) => (
                          <div
                            key={media._id}
                            className="border rounded p-2 cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                            onClick={() => selectHeroBackground(media)}
                          >
                            <div className="aspect-video bg-gray-50 rounded flex items-center justify-center mb-2">
                              <img
                                src={getMediaUrl(media.url)}
                                alt={media.originalName}
                                className="max-w-full max-h-full object-cover rounded"
                              />
                            </div>
                            <p className="text-xs truncate text-center">{media.originalName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Hero Tagline */}
            <div>
              <Label htmlFor="heroTagline">Hero Section Tagline</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Custom tagline for the hero section (if different from main tagline)
              </p>
              <Input
                id="heroTagline"
                value={settings.landingPage?.heroTagline || ''}
                onChange={(e) => updateLandingPageField('heroTagline', e.target.value)}
                placeholder="e.g., Discover the Difference"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Info / Licensing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information & Licensing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ccbLicense">CCB License Number</Label>
                <Input
                  id="ccbLicense"
                  value={settings.landingPage?.companyInfo?.ccbLicense || ''}
                  onChange={(e) => updateCompanyInfo('ccbLicense', e.target.value)}
                  placeholder="e.g., #24586"
                />
              </div>
              <div>
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  value={settings.landingPage?.companyInfo?.yearsInBusiness || ''}
                  onChange={(e) => updateCompanyInfo('yearsInBusiness', e.target.value)}
                  placeholder="e.g., Since 1978"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="established">Established Year</Label>
                <Input
                  id="established"
                  value={settings.landingPage?.companyInfo?.established || ''}
                  onChange={(e) => updateCompanyInfo('established', e.target.value)}
                  placeholder="e.g., 1978"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Team Description</Label>
                <Input
                  id="teamDescription"
                  value={settings.landingPage?.companyInfo?.teamDescription || ''}
                  onChange={(e) => updateCompanyInfo('teamDescription', e.target.value)}
                  placeholder="e.g., Licensed Plumbers"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="awardsDescription">Awards & Recognition</Label>
              <Input
                id="awardsDescription"
                value={settings.landingPage?.companyInfo?.awardsDescription || ''}
                onChange={(e) => updateCompanyInfo('awardsDescription', e.target.value)}
                placeholder="e.g., Best Plumbing 15 Years"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Blocks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service Blocks</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Configure the service offerings displayed on the landing page
              </p>
            </div>
            <Button onClick={addServiceBlock} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.landingPage?.serviceBlocks?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No service blocks configured. Click "Add Service" to create one.
              </p>
            ) : (
              settings.landingPage?.serviceBlocks?.map((block) => (
                <div key={block.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={block.enabled}
                        onCheckedChange={(checked) => updateServiceBlock(block.id, { enabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteServiceBlock(block.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Service Title</Label>
                      <Input
                        value={block.title}
                        onChange={(e) => updateServiceBlock(block.id, { title: e.target.value })}
                        placeholder="e.g., Water Heater Service"
                      />
                    </div>
                    <div>
                      <Label>Icon Name</Label>
                      <Input
                        value={block.iconName}
                        onChange={(e) => updateServiceBlock(block.id, { iconName: e.target.value })}
                        placeholder="e.g., Wrench, Home, Droplet, Flame"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={block.description}
                      onChange={(e) => updateServiceBlock(block.id, { description: e.target.value })}
                      placeholder="Service description"
                      rows={2}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Privacy Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="privacyStatement">Footer Privacy/SMS Consent Statement (HTML)</Label>
              <Textarea
                id="privacyStatement"
                value={settings?.privacyStatement || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, privacyStatement: e.target.value } : null)}
                placeholder="Enter HTML content for the privacy statement displayed in the footer..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This HTML content will be displayed in the footer. You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;span&gt;).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

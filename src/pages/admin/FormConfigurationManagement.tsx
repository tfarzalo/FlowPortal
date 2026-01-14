import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import {
  getFormConfigurationByType,
  updateFormConfiguration,
  createFormConfiguration,
  type FormConfiguration,
  type EmailConfiguration,
} from '@/api/forms';

export default function FormConfigurationManagement() {
  const [config, setConfig] = useState<FormConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const createDefaultConfig = (): FormConfiguration => ({
    formType: 'booking',
    formName: 'Booking',
    fields: [],
    emailConfiguration: {
      enabled: false,
      recipients: [],
      subject: 'New Form Submission',
      fromName: 'FlowPortal',
      fromEmail: 'no-reply@example.com',
      includeAllFields: true,
    },
    serviceOptions: [],
    availableTimes: [],
    enabled: true,
  });

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await getFormConfigurationByType('booking');
      setConfig(response ?? createDefaultConfig());
    } catch (error: any) {
      console.error('Error fetching configuration:', error);
      toast.error('Failed to load configuration. You may need to create one first.');
      setConfig(createDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!config) return;

    try {
      setSaving(true);
      if (config._id || config.id) {
        // Update existing
        await updateFormConfiguration(config._id || config.id!, config);
      } else {
        // Create new
        await createFormConfiguration(config);
      }
      toast.success('Configuration saved successfully');
      fetchConfiguration();
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Email testing is not supported in the new architecture
  // Can be implemented via Supabase Edge Functions if needed

  const updateEmailConfig = (field: keyof EmailConfiguration, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      emailConfiguration: {
        ...config.emailConfiguration,
        [field]: value,
      },
    });
  };

  const addEmailRecipient = () => {
    if (!config) return;
    setConfig({
      ...config,
      emailConfiguration: {
        ...config.emailConfiguration,
        recipients: [...config.emailConfiguration.recipients, ''],
      },
    });
  };

  const updateEmailRecipient = (index: number, value: string) => {
    if (!config) return;
    const newRecipients = [...config.emailConfiguration.recipients];
    newRecipients[index] = value;
    setConfig({
      ...config,
      emailConfiguration: {
        ...config.emailConfiguration,
        recipients: newRecipients,
      },
    });
  };

  const removeEmailRecipient = (index: number) => {
    if (!config) return;
    const newRecipients = config.emailConfiguration.recipients.filter((_: string, i: number) => i !== index);
    setConfig({
      ...config,
      emailConfiguration: {
        ...config.emailConfiguration,
        recipients: newRecipients,
      },
    });
  };

  const addServiceOption = () => {
    if (!config) return;
    setConfig({
      ...config,
      serviceOptions: [...(config.serviceOptions || []), ''],
    });
  };

  const updateServiceOption = (index: number, value: string) => {
    if (!config) return;
    const newOptions = [...(config.serviceOptions || [])];
    newOptions[index] = value;
    setConfig({
      ...config,
      serviceOptions: newOptions,
    });
  };

  const removeServiceOption = (index: number) => {
    if (!config) return;
    const newOptions = (config.serviceOptions || []).filter((_: string, i: number) => i !== index);
    setConfig({
      ...config,
      serviceOptions: newOptions,
    });
  };

  const addTimeSlot = () => {
    if (!config) return;
    setConfig({
      ...config,
      availableTimes: [...(config.availableTimes || []), ''],
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    if (!config) return;
    const newTimes = [...(config.availableTimes || [])];
    newTimes[index] = value;
    setConfig({
      ...config,
      availableTimes: newTimes,
    });
  };

  const removeTimeSlot = (index: number) => {
    if (!config) return;
    const newTimes = (config.availableTimes || []).filter((_: string, i: number) => i !== index);
    setConfig({
      ...config,
      availableTimes: newTimes,
    });
  };

  if (loading) {
    return <div className="p-6">Loading configuration...</div>;
  }

  if (!config) {
    return <div className="p-6">No configuration found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Form Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage booking form fields, options, and email notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveConfiguration} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="options">Service Options</TabsTrigger>
          <TabsTrigger value="times">Time Slots</TabsTrigger>
          <TabsTrigger value="email">Email Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic form settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Form Name</Label>
                <Input
                  value={config.formName}
                  onChange={(e) => setConfig({ ...config, formName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Success Message</Label>
                <Textarea
                  value={config.successMessage || ''}
                  onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
                  placeholder="Message shown after successful form submission"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
                <Label>Enable Form</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Options</CardTitle>
              <CardDescription>Manage available service types for the booking form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.serviceOptions || []).map((option: string, index: number) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateServiceOption(index, e.target.value)}
                    placeholder="Service name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeServiceOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addServiceOption} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service Option
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="times" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>Configure time slots for service bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.availableTimes || []).map((time: string, index: number) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    placeholder="e.g., 9:00 AM - 11:00 AM"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimeSlot(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addTimeSlot} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notification Settings</CardTitle>
              <CardDescription>Configure email notifications for form submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.emailConfiguration.enabled}
                  onCheckedChange={(checked) => updateEmailConfig('enabled', checked)}
                />
                <Label>Enable Email Notifications</Label>
              </div>

              <div className="space-y-2">
                <Label>Recipients</Label>
                {config.emailConfiguration.recipients.map((recipient: string, index: number) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateEmailRecipient(index, e.target.value)}
                      placeholder="email@example.com"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmailRecipient(index)}
                      disabled={config.emailConfiguration.recipients.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addEmailRecipient} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={config.emailConfiguration.fromName}
                    onChange={(e) => updateEmailConfig('fromName', e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    value={config.emailConfiguration.fromEmail}
                    onChange={(e) => updateEmailConfig('fromEmail', e.target.value)}
                    placeholder="noreply@yourdomain.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={config.emailConfiguration.subject}
                  onChange={(e) => updateEmailConfig('subject', e.target.value)}
                  placeholder="Email subject line"
                />
              </div>

              <div className="space-y-2">
                <Label>Reply-To Email (Optional)</Label>
                <Input
                  type="email"
                  value={config.emailConfiguration.replyTo || ''}
                  onChange={(e) => updateEmailConfig('replyTo', e.target.value)}
                  placeholder="reply@yourdomain.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Message (Optional)</Label>
                <Textarea
                  value={config.emailConfiguration.customMessage || ''}
                  onChange={(e) => updateEmailConfig('customMessage', e.target.value)}
                  placeholder="Add a custom message to include in the email"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.emailConfiguration.includeAllFields}
                  onCheckedChange={(checked) => updateEmailConfig('includeAllFields', checked)}
                />
                <Label>Include All Form Fields in Email</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm">Email Configuration Note</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                SMTP settings are configured via environment variables. If SMTP is not configured,
                test emails will use Ethereal (a fake SMTP service for development). Check the
                console for preview URLs when testing emails.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

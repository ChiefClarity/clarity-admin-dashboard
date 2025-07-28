'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { 
  Settings, 
  Save, 
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Cloud,
  Calendar,
  BarChart
} from 'lucide-react';
import { reportsApi } from '@/lib/api/reports/reports-api';
import type { ReportConfig } from '@/lib/api/reports/types';
import { cn } from '@/lib/utils';

interface ReportConfigProps {
  config: ReportConfig;
  onUpdate: () => void;
}

export function ReportConfig({ config, onUpdate }: ReportConfigProps) {
  const [formData, setFormData] = useState<ReportConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ReportConfig>) => 
      reportsApi.updateConfig(data).then(res => res.data),
    onSuccess: (updatedConfig) => {
      toast({
        title: 'Configuration saved',
        description: 'Report settings have been updated successfully.',
        variant: 'success',
      });
      setFormData(updatedConfig);
      setHasChanges(false);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save configuration',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleFieldChange = (field: keyof ReportConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.defaultDelay < 0 || formData.defaultDelay > 1440) {
      toast({
        title: 'Invalid delay',
        description: 'Delay must be between 0 and 1440 minutes (24 hours).',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData(config);
    setHasChanges(false);
  };

  const cronExamples = [
    { label: 'Every Monday at 9 AM', value: '0 9 * * MON' },
    { label: 'Every weekday at 8 AM', value: '0 8 * * MON-FRI' },
    { label: 'Every Sunday at 10 AM', value: '0 10 * * SUN' },
    { label: 'First Monday of month at 9 AM', value: '0 9 1-7 * MON' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Settings
          </CardTitle>
          <CardDescription>
            Configure default settings for all weekly email reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base">
                Enable Weekly Reports
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, reports will be sent automatically after service visits
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleFieldChange('enabled', checked)}
              className={cn(
                formData.enabled && 'data-[state=checked]:bg-green-600'
              )}
            />
          </div>

          {!formData.enabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Reports are disabled</AlertTitle>
              <AlertDescription>
                No automatic reports will be sent while this setting is disabled.
              </AlertDescription>
            </Alert>
          )}

          {/* Timing Settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultDelay" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Report Delay
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="defaultDelay"
                  type="number"
                  min="0"
                  max="1440"
                  value={formData.defaultDelay}
                  onChange={(e) => handleFieldChange('defaultDelay', parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes after job completion</span>
              </div>
              <p className="text-xs text-muted-foreground">
                How long to wait before sending the report (0-1440 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleCron" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Weekly Summary Schedule
              </Label>
              <Select
                value={formData.scheduleCron}
                onValueChange={(value) => handleFieldChange('scheduleCron', value)}
              >
                <SelectTrigger id="scheduleCron">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cronExamples.map((example) => (
                    <SelectItem key={example.value} value={example.value}>
                      {example.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Schedule for weekly summary reports (separate from post-service reports)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>
            Configure what information to include in reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeCharts" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Include Visual Charts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show chemistry trend charts in email reports
                </p>
              </div>
              <Switch
                id="includeCharts"
                checked={formData.includeCharts}
                onCheckedChange={(checked) => handleFieldChange('includeCharts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weatherEnabled" className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Include Weather Data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Fetch and display local weather information
                </p>
              </div>
              <Switch
                id="weatherEnabled"
                checked={formData.weatherEnabled}
                onCheckedChange={(checked) => handleFieldChange('weatherEnabled', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiProvider" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Provider
            </Label>
            <Select
              value={formData.aiProvider}
              onValueChange={(value) => handleFieldChange('aiProvider', value)}
            >
              <SelectTrigger id="aiProvider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">
                  Claude (Anthropic) - Recommended
                </SelectItem>
                <SelectItem value="gemini">
                  Gemini (Google)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              AI service used to generate personalized insights
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultFormat">Default Format</Label>
            <Select
              value={formData.defaultFormat}
              onValueChange={(value) => handleFieldChange('defaultFormat', value)}
            >
              <SelectTrigger id="defaultFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML (Rich formatting)</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasChanges && (
              <>
                <AlertCircle className="h-4 w-4 text-warning" />
                You have unsaved changes
              </>
            )}
            {updateMutation.isSuccess && !hasChanges && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Configuration saved
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || updateMutation.isPending}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!hasChanges || updateMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
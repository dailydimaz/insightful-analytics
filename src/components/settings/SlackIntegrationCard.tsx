import { useState } from "react";
import { MessageSquare, Trash2, TestTube, Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSlackIntegration } from "@/hooks/useSlackIntegration";
import { useSubscription } from "@/hooks/useSubscription";
import { useSites } from "@/hooks/useSites";
import { useToast } from "@/hooks/use-toast";
import { isBillingEnabled } from "@/lib/billing";

export function SlackIntegrationCard() {
  const { sites } = useSites();
  const siteId = sites?.[0]?.id;
  const { 
    integration, 
    isLoading, 
    setupIntegration, 
    updateSettings, 
    testWebhook, 
    removeIntegration 
  } = useSlackIntegration(siteId);
  const { plan, isSelfHosted } = useSubscription();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelName, setChannelName] = useState("");

  // Only show for cloud users with Business plan
  if (!isBillingEnabled() || isSelfHosted) {
    return null;
  }

  const planName = plan?.name?.toLowerCase() || 'free';
  const hasSlackAccess = planName === 'business';

  if (!hasSlackAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Receive analytics notifications in Slack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Slack integration is available on the Business plan
            </p>
            <Button variant="outline" disabled>
              Upgrade to unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSetup = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Webhook URL required",
        description: "Please enter your Slack webhook URL",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
      toast({
        title: "Invalid webhook URL",
        description: "Please enter a valid Slack webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await setupIntegration.mutateAsync({
        webhookUrl,
        channelName: channelName || undefined,
      });
      toast({
        title: "Connected",
        description: "Slack integration has been set up successfully",
      });
      setWebhookUrl("");
      setChannelName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set up Slack integration",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    try {
      await testWebhook.mutateAsync();
      toast({
        title: "Test sent",
        description: "Check your Slack channel for the test message",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send test message",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    try {
      await removeIntegration.mutateAsync();
      toast({
        title: "Removed",
        description: "Slack integration has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove integration",
        variant: "destructive",
      });
    }
  };

  const handleNotifyToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({
        notifyOn: { [key]: value },
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Slack Integration
        </CardTitle>
        <CardDescription>
          Receive analytics notifications directly in Slack
        </CardDescription>
      </CardHeader>
      <CardContent>
        {integration ? (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-medium">Connected</span>
                {integration.channel_name && (
                  <span className="text-muted-foreground">
                    to #{integration.channel_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTest}
                  disabled={testWebhook.isPending}
                >
                  {testWebhook.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-1" />
                  )}
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={handleRemove}
                  disabled={removeIntegration.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of your analytics
                    </p>
                  </div>
                  <Switch
                    checked={integration.notify_on.daily_digest}
                    onCheckedChange={(v) => handleNotifyToggle('daily_digest', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary every Monday
                    </p>
                  </div>
                  <Switch
                    checked={integration.notify_on.weekly_digest}
                    onCheckedChange={(v) => handleNotifyToggle('weekly_digest', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Goal Completed</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a goal is achieved
                    </p>
                  </div>
                  <Switch
                    checked={integration.notify_on.goal_completed}
                    onCheckedChange={(v) => handleNotifyToggle('goal_completed', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Traffic Spike</p>
                    <p className="text-sm text-muted-foreground">
                      Alert when traffic is unusually high
                    </p>
                  </div>
                  <Switch
                    checked={integration.notify_on.traffic_spike}
                    onCheckedChange={(v) => handleNotifyToggle('traffic_spike', v)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
              <p className="text-xs text-muted-foreground">
                <a 
                  href="https://api.slack.com/messaging/webhooks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  How to get a webhook URL <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channelName">Channel Name (optional)</Label>
              <Input
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g., analytics"
              />
            </div>
            <Button onClick={handleSetup} disabled={setupIntegration.isPending}>
              {setupIntegration.isPending ? "Connecting..." : "Connect Slack"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

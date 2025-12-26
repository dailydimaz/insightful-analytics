import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Slack webhook URL validation regex (matches official Slack webhook format)
const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+$/;

export function isValidSlackWebhookUrl(url: string): boolean {
  return SLACK_WEBHOOK_REGEX.test(url);
}

interface SlackNotifySettings {
  daily_digest: boolean;
  weekly_digest: boolean;
  goal_completed: boolean;
  traffic_spike: boolean;
}

interface SlackIntegration {
  id: string;
  site_id: string;
  user_id: string;
  webhook_url: string;
  channel_name: string | null;
  notify_on: SlackNotifySettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSlackIntegration(siteId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const integrationQuery = useQuery({
    queryKey: ['slack-integration', siteId],
    queryFn: async () => {
      if (!siteId || !user) return null;

      const { data, error } = await supabase
        .from('slack_integrations')
        .select('*')
        .eq('site_id', siteId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          notify_on: (data.notify_on || {
            daily_digest: true,
            weekly_digest: false,
            goal_completed: true,
            traffic_spike: false,
          }) as unknown as SlackNotifySettings,
        } as SlackIntegration;
      }
      return null;
    },
    enabled: !!siteId && !!user,
  });

  const setupIntegration = useMutation({
    mutationFn: async ({ 
      webhookUrl, 
      channelName,
      notifyOn 
    }: { 
      webhookUrl: string; 
      channelName?: string;
      notifyOn?: Partial<SlackNotifySettings>;
    }) => {
      if (!user || !siteId) throw new Error('Not authenticated or no site selected');

      // Server-side validation of webhook URL
      if (!isValidSlackWebhookUrl(webhookUrl)) {
        throw new Error('Invalid Slack webhook URL format. URL must be a valid Slack incoming webhook URL.');
      }

      const defaultNotifyOn: SlackNotifySettings = {
        daily_digest: true,
        weekly_digest: false,
        goal_completed: true,
        traffic_spike: false,
        ...notifyOn,
      };

      const { data, error } = await supabase
        .from('slack_integrations')
        .upsert({
          site_id: siteId,
          user_id: user.id,
          webhook_url: webhookUrl,
          channel_name: channelName || null,
          notify_on: defaultNotifyOn as unknown as any,
          is_active: true,
        } as any, {
          onConflict: 'site_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack-integration', siteId] });
    },
  });

  const updateSettings = useMutation({
    mutationFn: async ({ 
      notifyOn,
      isActive 
    }: { 
      notifyOn?: Partial<SlackNotifySettings>;
      isActive?: boolean;
    }) => {
      if (!user || !siteId) throw new Error('Not authenticated or no site selected');

      const currentData = integrationQuery.data;
      if (!currentData) throw new Error('No integration found');

      const updates: any = {};
      if (notifyOn) {
        updates.notify_on = { ...currentData.notify_on, ...notifyOn };
      }
      if (isActive !== undefined) {
        updates.is_active = isActive;
      }

      const { error } = await supabase
        .from('slack_integrations')
        .update(updates)
        .eq('site_id', siteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack-integration', siteId] });
    },
  });

  const testWebhook = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error('No site selected');

      const { data, error } = await supabase.functions.invoke('slack-notify', {
        body: { siteId, test: true },
      });

      if (error) throw error;
      return data;
    },
  });

  const removeIntegration = useMutation({
    mutationFn: async () => {
      if (!user || !siteId) throw new Error('Not authenticated or no site selected');

      const { error } = await supabase
        .from('slack_integrations')
        .delete()
        .eq('site_id', siteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack-integration', siteId] });
    },
  });

  return {
    integration: integrationQuery.data,
    isLoading: integrationQuery.isLoading,
    error: integrationQuery.error,
    setupIntegration,
    updateSettings,
    testWebhook,
    removeIntegration,
  };
}

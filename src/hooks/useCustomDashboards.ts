import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardWidget {
  id: string;
  type: 'visitors' | 'pageviews' | 'top_pages' | 'top_referrers' | 'devices' | 'geo' | 'goals' | 'realtime' | 'retention';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: number;
}

interface CustomDashboard {
  id: string;
  site_id: string;
  user_id: string;
  name: string;
  layout: DashboardWidget[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomDashboards(siteId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const dashboardsQuery = useQuery({
    queryKey: ['custom-dashboards', siteId],
    queryFn: async () => {
      if (!siteId || !user) return [];

      const { data, error } = await supabase
        .from('custom_dashboards')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map((d: any) => ({
        ...d,
        layout: Array.isArray(d.layout) ? d.layout : [],
      })) as CustomDashboard[];
    },
    enabled: !!siteId && !!user,
  });

  const createDashboard = useMutation({
    mutationFn: async ({ name, layout }: { name: string; layout?: DashboardWidget[] }) => {
      if (!user || !siteId) throw new Error('Not authenticated or no site selected');

      const defaultLayout: DashboardWidget[] = layout || [
        { id: 'visitors', type: 'visitors', title: 'Visitors', size: 'medium', position: 0 },
        { id: 'pageviews', type: 'pageviews', title: 'Page Views', size: 'medium', position: 1 },
        { id: 'top_pages', type: 'top_pages', title: 'Top Pages', size: 'large', position: 2 },
        { id: 'top_referrers', type: 'top_referrers', title: 'Top Referrers', size: 'large', position: 3 },
      ];

      const { data, error } = await supabase
        .from('custom_dashboards')
        .insert({
          site_id: siteId,
          user_id: user.id,
          name,
          layout: defaultLayout as unknown as any,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards', siteId] });
    },
  });

  const updateDashboard = useMutation({
    mutationFn: async ({ 
      dashboardId, 
      name, 
      layout,
      isDefault 
    }: { 
      dashboardId: string; 
      name?: string; 
      layout?: DashboardWidget[];
      isDefault?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (layout !== undefined) updates.layout = layout;
      if (isDefault !== undefined) updates.is_default = isDefault;

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('custom_dashboards')
          .update({ is_default: false })
          .eq('site_id', siteId)
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('custom_dashboards')
        .update(updates)
        .eq('id', dashboardId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards', siteId] });
    },
  });

  const deleteDashboard = useMutation({
    mutationFn: async (dashboardId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('custom_dashboards')
        .delete()
        .eq('id', dashboardId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards', siteId] });
    },
  });

  return {
    dashboards: dashboardsQuery.data || [],
    isLoading: dashboardsQuery.isLoading,
    error: dashboardsQuery.error,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TeamMember {
  id: string;
  site_id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
}

interface TeamInvitation {
  id: string;
  site_id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useTeam(siteId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const teamMembersQuery = useQuery({
    queryKey: ['team-members', siteId],
    queryFn: async () => {
      if (!siteId) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (email, full_name)
        `)
        .eq('site_id', siteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map((member: any) => ({
        ...member,
        email: member.profiles?.email,
        full_name: member.profiles?.full_name,
      })) as TeamMember[];
    },
    enabled: !!siteId && !!user,
  });

  const invitationsQuery = useQuery({
    queryKey: ['team-invitations', siteId],
    queryFn: async () => {
      if (!siteId) return [];

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('site_id', siteId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamInvitation[];
    },
    enabled: !!siteId && !!user,
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'viewer' | 'editor' | 'admin' }) => {
      if (!user || !siteId) throw new Error('Not authenticated or no site selected');

      // Generate invitation token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          site_id: siteId,
          email,
          role,
          invited_by: user.id,
          token,
          expires_at: expiresAt,
        });

      if (error) throw error;
      return { token };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', siteId] });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'viewer' | 'editor' | 'admin' }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', siteId] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', siteId] });
    },
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', siteId] });
    },
  });

  return {
    members: teamMembersQuery.data || [],
    invitations: invitationsQuery.data || [],
    isLoading: teamMembersQuery.isLoading || invitationsQuery.isLoading,
    error: teamMembersQuery.error || invitationsQuery.error,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
}

export function useApiKeys() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const apiKeysQuery = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!user,
  });

  const createApiKey = useMutation({
    mutationFn: async ({ name, expiresInDays }: { name: string; expiresInDays?: number }) => {
      if (!user) throw new Error('Not authenticated');

      // Generate a random API key
      const keyBytes = new Uint8Array(32);
      crypto.getRandomValues(keyBytes);
      const rawKey = Array.from(keyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const fullKey = `mk_${rawKey}`;
      const keyPrefix = fullKey.substring(0, 10);
      
      // Hash the key for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(fullKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          expires_at: expiresAt,
        });

      if (error) throw error;

      // Return the full key only once - user must save it
      return { key: fullKey, prefix: keyPrefix };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const toggleApiKey = useMutation({
    mutationFn: async ({ keyId, isActive }: { keyId: string; isActive: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return {
    apiKeys: apiKeysQuery.data || [],
    isLoading: apiKeysQuery.isLoading,
    error: apiKeysQuery.error,
    createApiKey,
    deleteApiKey,
    toggleApiKey,
  };
}

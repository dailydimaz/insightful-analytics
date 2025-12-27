import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { isSelfHosted, type PlanType, PLANS } from '@/lib/billing';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanType;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const selfHosted = isSelfHosted();

  // Always call hooks unconditionally to follow React Rules of Hooks
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no subscription exists, create a free one
      if (!data) {
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            status: 'active',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSub as Subscription;
      }

      return data as Subscription;
    },
    enabled: !!user && !selfHosted, // Disable for self-hosted
  });

  const createSubscription = useMutation({
    mutationFn: async (plan: PlanType) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  // Return self-hosted config after all hooks are called
  if (selfHosted) {
    return {
      subscription: {
        id: 'self-hosted',
        user_id: user?.id || '',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan: 'selfhosted' as PlanType,
        status: 'active',
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Subscription,
      plan: PLANS.selfhosted,
      isLoading: false,
      isSelfHosted: true,
      billingEnabled: false,
      createSubscription,
      cancelSubscription,
    };
  }

  const subscription = subscriptionQuery.data;
  const planKey = (subscription?.plan || 'free') as PlanType;
  const plan = PLANS[planKey] || PLANS.free;

  return {
    subscription,
    plan,
    isLoading: subscriptionQuery.isLoading,
    isSelfHosted: false,
    billingEnabled: true,
    createSubscription,
    cancelSubscription,
  };
}

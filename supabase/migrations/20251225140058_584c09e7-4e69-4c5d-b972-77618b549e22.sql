-- API Keys table for API access feature (Pro/Business)
CREATE TABLE public.api_keys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Team members table for collaboration (Business)
CREATE TABLE public.team_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(site_id, user_id)
);

-- Team invitations table
CREATE TABLE public.team_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom dashboards table (Business)
CREATE TABLE public.custom_dashboards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    layout JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Slack integrations table (Business)
CREATE TABLE public.slack_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    channel_name TEXT,
    notify_on JSONB NOT NULL DEFAULT '{"daily_digest": true, "weekly_digest": false, "goal_completed": true, "traffic_spike": false}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(site_id)
);

-- Enable RLS on all tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_integrations ENABLE ROW LEVEL SECURITY;

-- API Keys policies
CREATE POLICY "Users can view own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Team members policies
CREATE POLICY "Site owners can manage team members"
ON public.team_members FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = team_members.site_id 
    AND sites.user_id = auth.uid()
));

CREATE POLICY "Team members can view their membership"
ON public.team_members FOR SELECT
USING (auth.uid() = user_id);

-- Team invitations policies
CREATE POLICY "Site owners can manage invitations"
ON public.team_invitations FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = team_invitations.site_id 
    AND sites.user_id = auth.uid()
));

CREATE POLICY "Invitees can view their invitations"
ON public.team_invitations FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Custom dashboards policies
CREATE POLICY "Users can manage own dashboards"
ON public.custom_dashboards FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Team members can view site dashboards"
ON public.custom_dashboards FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.site_id = custom_dashboards.site_id 
    AND team_members.user_id = auth.uid()
));

-- Slack integrations policies
CREATE POLICY "Site owners can manage Slack integration"
ON public.slack_integrations FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = slack_integrations.site_id 
    AND sites.user_id = auth.uid()
));

-- Update triggers
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_dashboards_updated_at
BEFORE UPDATE ON public.custom_dashboards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_slack_integrations_updated_at
BEFORE UPDATE ON public.slack_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
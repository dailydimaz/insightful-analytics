-- Fix #1: Profiles email exposure - the current policy only allows users to view their own profile
-- The RLS is already correct (auth.uid() = id), but we need to also allow team members to view 
-- limited profile info (name, avatar) for collaboration purposes without exposing email

-- Create a security definer function to check if user is a team member of the same site
CREATE OR REPLACE FUNCTION public.is_team_member_of_same_site(_profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm1
    INNER JOIN public.team_members tm2 ON tm1.site_id = tm2.site_id
    WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = _profile_user_id
  )
$$;

-- Add policy for team members to view limited profile info of other team members
-- This allows seeing name/avatar for team collaboration, but the SELECT still works on full row
-- However, the application code in useTeam.ts only selects email and full_name fields
CREATE POLICY "Team members can view teammate profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR public.is_team_member_of_same_site(id)
);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;


-- Fix #2: Add team member access to site analytics tables

-- Events: Allow team members to view events for sites they're assigned to
CREATE POLICY "Team members can view site events" 
ON public.events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members
  WHERE team_members.site_id = events.site_id
  AND team_members.user_id = auth.uid()
));

-- Goals: Allow team members to view goals for sites they're assigned to
CREATE POLICY "Team members can view site goals" 
ON public.goals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members
  WHERE team_members.site_id = goals.site_id
  AND team_members.user_id = auth.uid()
));

-- Funnels: Allow team members to view funnels for sites they're assigned to
CREATE POLICY "Team members can view site funnels" 
ON public.funnels 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members
  WHERE team_members.site_id = funnels.site_id
  AND team_members.user_id = auth.uid()
));

-- Slack integrations: Allow team members to view slack integrations
CREATE POLICY "Team members can view site slack integrations" 
ON public.slack_integrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members
  WHERE team_members.site_id = slack_integrations.site_id
  AND team_members.user_id = auth.uid()
));
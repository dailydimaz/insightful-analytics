-- Add policy to allow team members to view sites they've been assigned to
CREATE POLICY "Team members can view assigned sites"
ON public.sites
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.site_id = sites.id
    AND team_members.user_id = auth.uid()
  )
);
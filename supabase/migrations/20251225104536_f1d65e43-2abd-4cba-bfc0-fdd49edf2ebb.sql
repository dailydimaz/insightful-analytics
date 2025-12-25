-- Enable realtime on events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Create goals table for conversion tracking
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_name TEXT NOT NULL DEFAULT 'pageview',
  url_match TEXT,
  match_type TEXT NOT NULL DEFAULT 'contains' CHECK (match_type IN ('exact', 'contains', 'starts_with', 'regex')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
CREATE POLICY "Users can view goals for own sites"
ON public.goals
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = goals.site_id AND sites.user_id = auth.uid()
));

CREATE POLICY "Users can create goals for own sites"
ON public.goals
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = goals.site_id AND sites.user_id = auth.uid()
));

CREATE POLICY "Users can update goals for own sites"
ON public.goals
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = goals.site_id AND sites.user_id = auth.uid()
));

CREATE POLICY "Users can delete goals for own sites"
ON public.goals
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = goals.site_id AND sites.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
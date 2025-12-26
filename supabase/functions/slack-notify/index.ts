import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackMessage {
  text: string;
  blocks?: any[];
}

// Validate Slack webhook URL format (server-side validation)
const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+$/;

function isValidSlackWebhookUrl(url: string): boolean {
  return SLACK_WEBHOOK_REGEX.test(url);
}

// Extract user ID from Authorization header
async function getUserIdFromRequest(req: Request, supabase: any): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('Error getting user from token:', error);
    return null;
  }
  
  return user.id;
}

// Check if user has access to the site (owner or team member)
async function userHasSiteAccess(supabase: any, userId: string, siteId: string): Promise<boolean> {
  // Check if user owns the site
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('user_id')
    .eq('id', siteId)
    .single();

  if (siteError) {
    console.error('Error checking site ownership:', siteError);
    return false;
  }

  if (site?.user_id === userId) {
    return true;
  }

  // Check if user is a team member
  const { data: teamMember, error: memberError } = await supabase
    .from('team_members')
    .select('id')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) {
    console.error('Error checking team membership:', memberError);
    return false;
  }

  return !!teamMember;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create anon client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    // Verify user authentication
    const userId = await getUserIdFromRequest(req, supabaseAuth);
    if (!userId) {
      console.error('Unauthorized: No valid user token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const { siteId, test, type, data } = await req.json();

    if (!siteId) {
      throw new Error('Site ID is required');
    }

    // Validate siteId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(siteId)) {
      throw new Error('Invalid site ID format');
    }

    // Authorization check: verify user has access to this site
    const hasAccess = await userHasSiteAccess(supabaseAdmin, userId, siteId);
    if (!hasAccess) {
      console.error(`Unauthorized: User ${userId} does not have access to site ${siteId}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not have access to this site' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Get the Slack integration for this site
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('slack_integrations')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_active', true)
      .maybeSingle();

    if (integrationError) {
      console.error('Error fetching integration:', integrationError);
      throw new Error('Failed to fetch Slack integration');
    }

    if (!integration) {
      throw new Error('No active Slack integration found for this site');
    }

    // Server-side webhook URL validation
    if (!isValidSlackWebhookUrl(integration.webhook_url)) {
      console.error('Invalid webhook URL detected:', integration.webhook_url.substring(0, 30) + '...');
      throw new Error('Invalid Slack webhook URL format');
    }

    // Get site info
    const { data: site } = await supabaseAdmin
      .from('sites')
      .select('name, domain')
      .eq('id', siteId)
      .single();

    let message: SlackMessage;

    if (test) {
      // Send test message
      message = {
        text: `🧪 Test notification from ${site?.name || 'your site'}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🧪 Test Notification*\n\nThis is a test message from your analytics dashboard.\n\n*Site:* ${site?.name || 'Unknown'}\n*Domain:* ${site?.domain || 'Not set'}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Sent at ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      };
    } else if (type === 'daily_digest') {
      message = {
        text: `📊 Daily Analytics Digest for ${site?.name}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📊 Daily Analytics Digest',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${site?.name}*\n${site?.domain || 'No domain set'}`,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Visitors*\n${data?.visitors || 0}` },
              { type: 'mrkdwn', text: `*Page Views*\n${data?.pageviews || 0}` },
              { type: 'mrkdwn', text: `*Bounce Rate*\n${data?.bounceRate || 0}%` },
              { type: 'mrkdwn', text: `*Avg. Duration*\n${data?.avgDuration || '0s'}` },
            ],
          },
        ],
      };
    } else if (type === 'goal_completed') {
      message = {
        text: `🎯 Goal Achieved: ${data?.goalName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🎯 Goal Achieved!*\n\n*Goal:* ${data?.goalName}\n*Conversions:* ${data?.conversions}\n*Site:* ${site?.name}`,
            },
          },
        ],
      };
    } else if (type === 'traffic_spike') {
      message = {
        text: `🚀 Traffic Spike Detected on ${site?.name}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🚀 Traffic Spike Detected!*\n\n*Site:* ${site?.name}\n*Current Visitors:* ${data?.currentVisitors}\n*Normal Average:* ${data?.averageVisitors}\n*Increase:* ${data?.increasePercent}%`,
            },
          },
        ],
      };
    } else {
      throw new Error('Unknown notification type');
    }

    // Send to Slack
    console.log(`Sending Slack notification for site ${siteId}, type: ${test ? 'test' : type}`);
    const slackResponse = await fetch(integration.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error('Slack API error:', errorText);
      throw new Error(`Slack API error: ${slackResponse.status}`);
    }

    console.log('Slack notification sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in slack-notify function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

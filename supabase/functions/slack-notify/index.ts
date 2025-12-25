import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackMessage {
  text: string;
  blocks?: any[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { siteId, test, type, data } = await req.json();

    if (!siteId) {
      throw new Error('Site ID is required');
    }

    // Get the Slack integration for this site
    const { data: integration, error: integrationError } = await supabase
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

    // Get site info
    const { data: site } = await supabase
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

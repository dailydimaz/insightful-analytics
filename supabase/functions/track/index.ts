import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Parse user agent to extract browser, OS, and device type
function parseUserAgent(ua: string): { browser: string; os: string; device_type: string } {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device_type = 'desktop';

  // Detect browser
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) {
    device_type = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    device_type = 'tablet';
  }

  return { browser, os, device_type };
}

// Generate a simple hash for visitor fingerprinting
function generateVisitorId(ip: string, ua: string): string {
  const str = `${ip}-${ua}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { site_id, url, referrer, event_name = 'pageview', properties = {} } = body;

    // Validate required fields
    if (!site_id) {
      return new Response(JSON.stringify({ error: 'site_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get headers for geo and user agent
    const userAgent = req.headers.get('user-agent') || '';
    const cfCountry = req.headers.get('cf-ipcountry') || req.headers.get('x-country') || null;
    const cfCity = req.headers.get('cf-ipcity') || req.headers.get('x-city') || null;
    const clientIp = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Parse user agent
    const { browser, os, device_type } = parseUserAgent(userAgent);

    // Generate visitor and session IDs
    const visitor_id = generateVisitorId(clientIp, userAgent);
    const session_id = body.session_id || `${visitor_id}-${Date.now()}`;

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First verify the site exists
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id')
      .eq('tracking_id', site_id)
      .maybeSingle();

    if (siteError) {
      console.error('Error verifying site:', siteError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!site) {
      return new Response(JSON.stringify({ error: 'Invalid site_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert the event
    const { error: insertError } = await supabase
      .from('events')
      .insert({
        site_id: site.id,
        event_name,
        url,
        referrer,
        visitor_id,
        session_id,
        browser,
        os,
        device_type,
        country: cfCountry,
        city: cfCity,
        properties,
      });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to record event' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Event recorded: ${event_name} for site ${site_id}`);

    // Return success with minimal response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 200; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean up old entries periodically (prevent memory leak)
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);

// Input validation constants
const MAX_URL_LENGTH = 2000;
const MAX_EVENT_NAME_LENGTH = 100;
const MAX_PROPERTIES_SIZE = 10240; // 10KB

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

// Generate a cryptographic hash for visitor fingerprinting using SHA-256
async function generateVisitorId(ip: string, ua: string): Promise<string> {
  const str = `${ip}-${ua}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Use first 16 hex characters for a unique 64-bit identifier
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
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

  // Get client IP for rate limiting
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
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

    // Validate site_id format (should be a reasonable length)
    if (typeof site_id !== 'string' || site_id.length > 50) {
      return new Response(JSON.stringify({ error: 'Invalid site_id format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL length
    if (url && (typeof url !== 'string' || url.length > MAX_URL_LENGTH)) {
      return new Response(JSON.stringify({ error: 'URL too long (max 2000 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate event_name
    if (event_name && (typeof event_name !== 'string' || event_name.length > MAX_EVENT_NAME_LENGTH)) {
      return new Response(JSON.stringify({ error: 'Event name too long (max 100 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate referrer length
    if (referrer && (typeof referrer !== 'string' || referrer.length > MAX_URL_LENGTH)) {
      return new Response(JSON.stringify({ error: 'Referrer too long (max 2000 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate properties size
    if (properties) {
      const propsString = JSON.stringify(properties);
      if (propsString.length > MAX_PROPERTIES_SIZE) {
        return new Response(JSON.stringify({ error: 'Properties too large (max 10KB)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get headers for geo and user agent
    const userAgent = req.headers.get('user-agent') || '';
    const cfCountry = req.headers.get('cf-ipcountry') || req.headers.get('x-country') || null;
    const cfCity = req.headers.get('cf-ipcity') || req.headers.get('x-city') || null;
    
    // Get Accept-Language header and extract primary language
    const acceptLanguage = req.headers.get('accept-language') || '';
    const primaryLanguage = acceptLanguage.split(',')[0]?.split('-')[0]?.trim() || null;

    // Parse user agent
    const { browser, os, device_type } = parseUserAgent(userAgent);

    // Get request origin for validation
    const origin = req.headers.get('origin');

    // Generate visitor and session IDs (now async with crypto)
    const visitor_id = await generateVisitorId(clientIp, userAgent);
    const session_id = body.session_id || `${visitor_id}-${Date.now()}`;

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First verify the site exists and get domain for origin validation
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, domain')
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

    // Validate origin matches site domain (if domain is configured and origin is present)
    if (origin && site.domain) {
      try {
        const originHost = new URL(origin).hostname.toLowerCase();
        const siteDomain = site.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
        
        // Check if origin matches the configured domain (with or without www)
        const isValidOrigin = originHost === siteDomain || 
                              originHost === `www.${siteDomain}` ||
                              originHost.endsWith(`.${siteDomain}`);
        
        if (!isValidOrigin) {
          console.warn(`Origin mismatch: ${origin} vs ${site.domain} for site ${site_id}`);
          return new Response(JSON.stringify({ error: 'Invalid origin' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (e) {
        // If URL parsing fails, log but allow (could be server-side request)
        console.warn(`Could not parse origin: ${origin}`);
      }
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
        language: primaryLanguage,
        properties,
      });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to record event' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Note: Usage tracking is handled by the frontend useUsage hook
    // which counts events directly for simplicity and accuracy

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
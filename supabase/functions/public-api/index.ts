import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Input validation constants
const MAX_LIMIT = 1000;
const MAX_OFFSET = 100000;
const DEFAULT_LIMIT = 100;
const MAX_TOP_PAGES_LIMIT = 100;
const DEFAULT_TOP_PAGES_LIMIT = 10;
const EVENTS_SAFETY_LIMIT = 50000; // Server-side safety limit for top-pages aggregation

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required. Use x-api-key header.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Validate API key format
    if (!apiKey.startsWith('mk_')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Hash the provided key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Find the API key in database
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*, user_id')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .maybeSingle();

    if (keyError || !keyData) {
      console.error('API key validation failed:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check expiration
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Remove 'public-api' from path if present
    const apiPath = pathParts.filter(p => p !== 'public-api');
    
    // Parse the API route
    // Expected format: /v1/sites/:siteId/stats or /v1/sites
    if (apiPath[0] !== 'v1') {
      return new Response(
        JSON.stringify({ error: 'Invalid API version. Use /v1/' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const resource = apiPath[1];

    if (resource === 'sites') {
      const siteId = apiPath[2];
      const action = apiPath[3];

      // GET /v1/sites - List all sites for the user
      if (!siteId && req.method === 'GET') {
        const { data: sites, error } = await supabase
          .from('sites')
          .select('id, name, domain, tracking_id, timezone, created_at')
          .eq('user_id', keyData.user_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ data: sites }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify site ownership
      if (siteId) {
        const { data: site, error: siteError } = await supabase
          .from('sites')
          .select('id, user_id, name, domain')
          .eq('id', siteId)
          .eq('user_id', keyData.user_id)
          .maybeSingle();

        if (siteError || !site) {
          return new Response(
            JSON.stringify({ error: 'Site not found or access denied' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        // GET /v1/sites/:siteId/stats
        if (action === 'stats' && req.method === 'GET') {
          const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const endDate = url.searchParams.get('end_date') || new Date().toISOString();

          // Get pageviews and visitors
          const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, event_name, visitor_id, created_at')
            .eq('site_id', siteId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (eventsError) throw eventsError;

          const pageviews = events?.filter(e => e.event_name === 'pageview').length || 0;
          const uniqueVisitors = new Set(events?.map(e => e.visitor_id).filter(Boolean)).size;
          const totalEvents = events?.length || 0;

          return new Response(
            JSON.stringify({
              data: {
                site: { id: site.id, name: site.name, domain: site.domain },
                period: { start: startDate, end: endDate },
                stats: {
                  pageviews,
                  unique_visitors: uniqueVisitors,
                  total_events: totalEvents,
                },
              },
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // GET /v1/sites/:siteId/events
        if (action === 'events' && req.method === 'GET') {
          // Parse and validate limit
          let limit = parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMIT));
          if (isNaN(limit) || limit < 1) {
            limit = DEFAULT_LIMIT;
          } else if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
          }

          // Parse and validate offset
          let offset = parseInt(url.searchParams.get('offset') || '0');
          if (isNaN(offset) || offset < 0) {
            offset = 0;
          } else if (offset > MAX_OFFSET) {
            return new Response(
              JSON.stringify({ error: `Offset too large, maximum is ${MAX_OFFSET}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }

          const { data: events, error: eventsError, count } = await supabase
            .from('events')
            .select('id, event_name, url, referrer, device_type, browser, os, country, city, created_at', { count: 'exact' })
            .eq('site_id', siteId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (eventsError) throw eventsError;

          return new Response(
            JSON.stringify({
              data: events,
              pagination: {
                total: count,
                limit,
                offset,
                has_more: (offset + limit) < (count || 0),
              },
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // GET /v1/sites/:siteId/top-pages
        if (action === 'top-pages' && req.method === 'GET') {
          // Parse and validate limit
          let limit = parseInt(url.searchParams.get('limit') || String(DEFAULT_TOP_PAGES_LIMIT));
          if (isNaN(limit) || limit < 1) {
            limit = DEFAULT_TOP_PAGES_LIMIT;
          } else if (limit > MAX_TOP_PAGES_LIMIT) {
            limit = MAX_TOP_PAGES_LIMIT;
          }

          const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

          // Apply server-side safety limit to prevent memory exhaustion
          const { data: events, error } = await supabase
            .from('events')
            .select('url')
            .eq('site_id', siteId)
            .eq('event_name', 'pageview')
            .gte('created_at', startDate)
            .not('url', 'is', null)
            .limit(EVENTS_SAFETY_LIMIT);

          if (error) throw error;

          // Count page views
          const pageCounts: Record<string, number> = {};
          events?.forEach(e => {
            if (e.url) {
              pageCounts[e.url] = (pageCounts[e.url] || 0) + 1;
            }
          });

          const topPages = Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([url, views]) => ({ url, views }));

          return new Response(
            JSON.stringify({ 
              data: topPages,
              meta: {
                limit,
                events_analyzed: events?.length || 0,
                events_capped: (events?.length || 0) >= EVENTS_SAFETY_LIMIT,
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // GET /v1/sites/:siteId - Get site details
        if (!action && req.method === 'GET') {
          return new Response(
            JSON.stringify({ data: site }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
  } catch (error: any) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
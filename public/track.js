/**
 * Metric Analytics - Lightweight Tracking Script
 * Privacy-focused, cookie-less analytics with UTM and outbound tracking
 */
(function() {
  'use strict';

  // Configuration
  var script = document.currentScript;
  var siteId = script && script.getAttribute('data-site');
  var apiUrl = script && script.getAttribute('data-api') || 'https://lckjlefupqlblfcwhbom.supabase.co/functions/v1/track';
  
  if (!siteId) {
    console.warn('Metric: Missing data-site attribute');
    return;
  }

  // Respect Do Not Track
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
    return;
  }

  // Session management (in-memory, no cookies)
  var sessionId = null;
  var lastActivity = Date.now();
  var SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  function getSessionId() {
    var now = Date.now();
    if (!sessionId || (now - lastActivity) > SESSION_TIMEOUT) {
      sessionId = Math.random().toString(36).substring(2) + now.toString(36);
    }
    lastActivity = now;
    return sessionId;
  }

  // Parse UTM parameters from URL
  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(function(key) {
      var value = params.get(key);
      if (value) {
        utm[key] = value;
      }
    });
    
    return Object.keys(utm).length > 0 ? utm : null;
  }

  // Get referrer (clean it up)
  function getReferrer() {
    var ref = document.referrer;
    if (!ref) return null;
    try {
      var refUrl = new URL(ref);
      // Ignore same-origin referrers
      if (refUrl.hostname === window.location.hostname) return null;
      return ref;
    } catch (e) {
      return null;
    }
  }

  // Get current URL (without query params for privacy)
  function getCurrentUrl() {
    return window.location.pathname;
  }

  // Send event to API
  function track(eventName, properties) {
    var utm = getUtmParams();
    var mergedProperties = Object.assign({}, properties || {});
    
    // Include UTM params in properties if present
    if (utm) {
      mergedProperties.utm = utm;
    }

    var payload = {
      site_id: siteId,
      event_name: eventName || 'pageview',
      url: getCurrentUrl(),
      referrer: getReferrer(),
      session_id: getSessionId(),
      properties: Object.keys(mergedProperties).length > 0 ? mergedProperties : {}
    };

    // Use sendBeacon if available for reliability
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(apiUrl, blob);
    } else {
      // Fallback to fetch
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function() {});
    }
  }

  // Track pageview
  function trackPageview() {
    track('pageview');
  }

  // Track outbound links automatically
  function setupOutboundTracking() {
    document.addEventListener('click', function(e) {
      var target = e.target;
      
      // Find closest anchor element
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      if (!target || target.tagName !== 'A') return;
      
      var href = target.getAttribute('href');
      if (!href) return;
      
      try {
        var url = new URL(href, window.location.origin);
        
        // Check if it's an outbound link
        if (url.hostname !== window.location.hostname) {
          track('outbound', {
            href: href,
            text: target.innerText.substring(0, 100)
          });
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    }, true);
  }

  // Track 404 errors
  function track404() {
    // Check if page might be a 404
    if (document.title.toLowerCase().includes('404') || 
        document.title.toLowerCase().includes('not found')) {
      track('404', {
        url: window.location.href,
        referrer: document.referrer
      });
    }
  }

  // Handle SPA navigation
  var lastPath = window.location.pathname;
  
  function handleNavigation() {
    var currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackPageview();
    }
  }

  // Listen for history changes (SPA support)
  if (window.history && window.history.pushState) {
    var originalPushState = window.history.pushState;
    window.history.pushState = function() {
      originalPushState.apply(this, arguments);
      handleNavigation();
    };

    var originalReplaceState = window.history.replaceState;
    window.history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      handleNavigation();
    };

    window.addEventListener('popstate', handleNavigation);
  }

  // Initialize tracking
  function init() {
    trackPageview();
    setupOutboundTracking();
    
    // Delay 404 check to allow page to fully load
    setTimeout(track404, 1000);
  }

  // Track initial pageview
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Expose track function globally for custom events
  window.metric = {
    track: function(eventName, properties) {
      track(eventName, properties);
    },
    // Optional: identify users (stores in sessionStorage)
    identify: function(userId) {
      if (userId) {
        try {
          sessionStorage.setItem('metric_user_id', userId);
        } catch (e) {}
      }
    }
  };
})();

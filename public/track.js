/**
 * Metric Analytics - Lightweight Tracking Script
 * Privacy-focused, cookie-less analytics
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
    var payload = {
      site_id: siteId,
      event_name: eventName || 'pageview',
      url: getCurrentUrl(),
      referrer: getReferrer(),
      session_id: getSessionId(),
      properties: properties || {}
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

  // Track initial pageview
  if (document.readyState === 'complete') {
    trackPageview();
  } else {
    window.addEventListener('load', trackPageview);
  }

  // Expose track function globally for custom events
  window.metric = {
    track: function(eventName, properties) {
      track(eventName, properties);
    }
  };
})();

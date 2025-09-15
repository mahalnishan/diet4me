'use client';

import { useCallback, useEffect, useRef } from 'react';

interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
}

interface PageViewEvent {
  pagePath: string;
  pageTitle: string;
  referrer?: string;
}

interface UserInteractionEvent {
  interactionType: 'click' | 'scroll' | 'hover' | 'focus' | 'blur';
  elementType?: string;
  elementId?: string;
  elementClass?: string;
  elementText?: string;
  coordinates?: { x: number; y: number };
  properties?: Record<string, any>;
}

interface PerformanceEvent {
  metricType: 'page_load' | 'api_response' | 'render_time';
  metricName: string;
  value: number;
  unit?: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const sessionId = useRef<string>('');
  const userId = useRef<string>('');

  // Initialize session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get or create session ID
      sessionId.current = sessionStorage.getItem('analytics_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId.current);

      // Get user ID if available
      userId.current = localStorage.getItem('user_id') || '';

      // Track page view
      trackPageView({
        pagePath: window.location.pathname,
        pageTitle: document.title,
        referrer: document.referrer
      });
    }
  }, []);

  // Track custom event
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    if (typeof window === 'undefined') return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: event.eventType,
          eventName: event.eventName,
          sessionId: sessionId.current,
          userId: userId.current,
          properties: event.properties,
          pageUrl: window.location.href,
          referrer: document.referrer
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(async (event: PageViewEvent) => {
    await trackEvent({
      eventType: 'page_view',
      eventName: 'page_loaded',
      properties: {
        pagePath: event.pagePath,
        pageTitle: event.pageTitle,
        referrer: event.referrer
      }
    });
  }, [trackEvent]);

  // Track user interaction
  const trackInteraction = useCallback(async (event: UserInteractionEvent) => {
    await trackEvent({
      eventType: 'interaction',
      eventName: event.interactionType,
      properties: {
        elementType: event.elementType,
        elementId: event.elementId,
        elementClass: event.elementClass,
        elementText: event.elementText,
        coordinates: event.coordinates,
        ...event.properties
      }
    });
  }, [trackEvent]);

  // Track performance metric
  const trackPerformance = useCallback(async (event: PerformanceEvent) => {
    await trackEvent({
      eventType: 'performance',
      eventName: event.metricName,
      properties: {
        metricType: event.metricType,
        value: event.value,
        unit: event.unit || 'ms',
        ...event.properties
      }
    });
  }, [trackEvent]);

  // Track diet plan generation
  const trackGeneration = useCallback(async (properties: {
    planId: string;
    generationType: 'ai_generated' | 'mock' | 'cached';
    userInputs: Record<string, any>;
    generationTimeMs: number;
    success: boolean;
    errorMessage?: string;
    apiResponseTimeMs?: number;
  }) => {
    await trackEvent({
      eventType: 'generation',
      eventName: 'diet_plan_generated',
      properties
    });
  }, [trackEvent]);

  // Track feedback submission
  const trackFeedback = useCallback(async (properties: {
    planId: string;
    rating: number;
    difficulty: string;
    tasteRating: string;
  }) => {
    await trackEvent({
      eventType: 'feedback',
      eventName: 'plan_rated',
      properties
    });
  }, [trackEvent]);

  // Track feature usage
  const trackFeatureUsage = useCallback(async (featureName: string, actionType: string, properties?: Record<string, any>) => {
    await trackEvent({
      eventType: 'feature_usage',
      eventName: `${featureName}_${actionType}`,
      properties: {
        featureName,
        actionType,
        ...properties
      }
    });
  }, [trackEvent]);

  // Track error
  const trackError = useCallback(async (error: Error, properties?: Record<string, any>) => {
    await trackEvent({
      eventType: 'error',
      eventName: 'javascript_error',
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        ...properties
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackPerformance,
    trackGeneration,
    trackFeedback,
    trackFeatureUsage,
    trackError,
    sessionId: sessionId.current,
    userId: userId.current
  };
};

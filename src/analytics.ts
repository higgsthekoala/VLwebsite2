/**
 * Analytics and Conversion Tracking System
 * Handles Google Analytics 4, custom events, and conversion optimization
 */

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface ConversionEvent {
  event_name: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: any[];
}

interface UserProperties {
  user_type?: 'visitor' | 'lead' | 'client';
  preferred_category?: string;
  engagement_level?: 'low' | 'medium' | 'high';
  source?: string;
  [key: string]: any;
}

class SonarAnalytics {
  private gaId = 'G-XXXXXXXXX'; // Replace with actual GA4 Measurement ID
  private debugMode = false;
  private initialized = false;
  private sessionData: Map<string, any> = new Map();
  private heatmapEnabled = true;

  constructor(gaId?: string, debug = false) {
    if (gaId) this.gaId = gaId;
    this.debugMode = debug;
    this.initializeAnalytics();
  }

  /**
   * Initialize Google Analytics 4
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      // Load Google Analytics 4
      await this.loadGA4Script();

      // Initialize GA4
      this.configureGA4();

      // Set up custom event tracking
      this.setupEventTracking();

      // Initialize session tracking
      this.initializeSession();

      // Set up conversion tracking
      this.setupConversionTracking();

      // Initialize heatmap if enabled
      if (this.heatmapEnabled) {
        this.initializeHeatmap();
      }

      this.initialized = true;
      this.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Load Google Analytics 4 script
   */
  private async loadGA4Script(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if gtag is already loaded
      if (typeof window.gtag !== 'undefined') {
        resolve();
        return;
      }

      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GA4 script'));
      document.head.appendChild(script);

      // Initialize gtag function
      window.dataLayer = window.dataLayer || [];
      window.gtag = () => {
        window.dataLayer.push(arguments);
      };
    });
  }

  /**
   * Configure Google Analytics 4
   */
  private configureGA4(): void {
    window.gtag('js', new Date());
    window.gtag('config', this.gaId, {
      debug_mode: this.debugMode,
      send_page_view: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: true,
      cookie_expires: 365 * 24 * 60 * 60, // 1 year
      custom_map: {
        custom_parameter_1: 'project_type',
        custom_parameter_2: 'user_engagement'
      }
    });

    this.log('GA4 configured');
  }

  /**
   * Set up automatic event tracking
   */
  private setupEventTracking(): void {
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      this.trackFormSubmission(form);
    });

    // Track video interactions
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-cursor="video"], .project-play-btn, .video-thumbnail')) {
        this.trackVideoInteraction('play', target);
      }
    });

    // Track navigation clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        this.trackNavigation(link);
      }
    });

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();

    // Track downloads
    this.trackDownloads();

    this.log('Event tracking configured');
  }

  /**
   * Initialize session tracking
   */
  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    const timestamp = Date.now();

    this.sessionData.set('session_id', sessionId);
    this.sessionData.set('session_start', timestamp);
    this.sessionData.set('page_views', 0);
    this.sessionData.set('events', []);

    // Track session start
    this.trackEvent({
      action: 'session_start',
      category: 'engagement',
      custom_parameters: {
        session_id: sessionId,
        timestamp: timestamp
      }
    });
  }

  /**
   * Set up conversion tracking
   */
  private setupConversionTracking(): void {
    // Contact form conversion
    this.setupContactFormTracking();

    // Newsletter signup conversion
    this.setupNewsletterTracking();

    // Project inquiry conversion
    this.setupProjectInquiryTracking();

    // Page engagement conversion
    this.setupEngagementTracking();
  }

  /**
   * Track custom events
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) {
      this.log('Analytics not initialized, queuing event');
      return;
    }

    const eventData = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    };

    window.gtag('event', event.action, eventData);

    // Store in session data
    const events = this.sessionData.get('events') || [];
    events.push({
      ...event,
      timestamp: Date.now()
    });
    this.sessionData.set('events', events);

    this.log(`Event tracked: ${event.action}`, eventData);
  }

  /**
   * Track conversion events
   */
  trackConversion(conversion: ConversionEvent): void {
    if (!this.initialized) return;

    const conversionData: any = {
      currency: conversion.currency || 'AUD',
      value: conversion.value || 0
    };

    if (conversion.transaction_id) {
      conversionData.transaction_id = conversion.transaction_id;
    }

    if (conversion.items) {
      conversionData.items = conversion.items;
    }

    window.gtag('event', conversion.event_name, conversionData);

    this.log(`Conversion tracked: ${conversion.event_name}`, conversionData);
  }

  /**
   * Track page views
   */
  trackPageView(page_title?: string, page_location?: string): void {
    if (!this.initialized) return;

    const pageViews = this.sessionData.get('page_views') || 0;
    this.sessionData.set('page_views', pageViews + 1);

    window.gtag('event', 'page_view', {
      page_title: page_title || document.title,
      page_location: page_location || window.location.href,
      page_views_session: pageViews + 1
    });

    this.log('Page view tracked');
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.initialized) return;

    window.gtag('set', properties);
    this.log('User properties set', properties);
  }

  /**
   * Track form submissions
   */
  private trackFormSubmission(form: HTMLFormElement): void {
    const formId = form.id || form.className || 'unknown_form';
    const formData = new FormData(form);
    const formFields = Array.from(formData.keys());

    // Determine form type
    let formType = 'general';
    if (formId.includes('contact') || formId.includes('Contact')) {
      formType = 'contact';
    } else if (formId.includes('newsletter') || formId.includes('Newsletter')) {
      formType = 'newsletter';
    }

    this.trackEvent({
      action: 'form_submit',
      category: 'engagement',
      label: formType,
      custom_parameters: {
        form_id: formId,
        form_fields: formFields.length,
        form_type: formType
      }
    });

    // Track conversion based on form type
    if (formType === 'contact') {
      this.trackConversion({
        event_name: 'generate_lead',
        value: 100, // Estimated lead value
        currency: 'AUD'
      });
    } else if (formType === 'newsletter') {
      this.trackConversion({
        event_name: 'sign_up',
        value: 10, // Newsletter signup value
        currency: 'AUD'
      });
    }
  }

  /**
   * Track video interactions
   */
  private trackVideoInteraction(action: string, element: HTMLElement): void {
    const videoTitle = element.getAttribute('data-video-title') ||
                      element.closest('.project-card')?.querySelector('.project-title')?.textContent ||
                      'Unknown Video';

    this.trackEvent({
      action: `video_${action}`,
      category: 'engagement',
      label: videoTitle,
      custom_parameters: {
        video_title: videoTitle,
        element_class: element.className
      }
    });
  }

  /**
   * Track navigation
   */
  private trackNavigation(link: HTMLAnchorElement): void {
    const href = link.href;
    const text = link.textContent?.trim() || '';
    const isExternal = !href.includes(window.location.hostname);

    this.trackEvent({
      action: isExternal ? 'external_link' : 'internal_link',
      category: 'navigation',
      label: text,
      custom_parameters: {
        link_url: href,
        link_text: text,
        is_external: isExternal
      }
    });
  }

  /**
   * Track scroll depth
   */
  private trackScrollDepth(): void {
    const milestones = [25, 50, 75, 90];
    const triggered = new Set<number>();

    const checkScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / documentHeight) * 100;

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !triggered.has(milestone)) {
          triggered.add(milestone);

          this.trackEvent({
            action: 'scroll_depth',
            category: 'engagement',
            label: `${milestone}%`,
            value: milestone,
            custom_parameters: {
              scroll_depth: milestone,
              page_url: window.location.pathname
            }
          });
        }
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Track time on page
   */
  private trackTimeOnPage(): void {
    const startTime = Date.now();
    const milestones = [30, 60, 120, 300]; // seconds
    const triggered = new Set<number>();

    const checkTimeOnPage = () => {
      const timeOnPage = (Date.now() - startTime) / 1000;

      milestones.forEach(milestone => {
        if (timeOnPage >= milestone && !triggered.has(milestone)) {
          triggered.add(milestone);

          this.trackEvent({
            action: 'time_on_page',
            category: 'engagement',
            label: `${milestone}s`,
            value: milestone,
            custom_parameters: {
              time_on_page: Math.round(timeOnPage),
              page_url: window.location.pathname
            }
          });
        }
      });
    };

    setInterval(checkTimeOnPage, 5000); // Check every 5 seconds
  }

  /**
   * Track downloads
   */
  private trackDownloads(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;

      if (link && link.href) {
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.zip', '.mp3', '.wav', '.mp4'];
        const isDownload = downloadExtensions.some(ext => link.href.toLowerCase().includes(ext));

        if (isDownload || link.hasAttribute('download')) {
          this.trackEvent({
            action: 'file_download',
            category: 'engagement',
            label: link.href.split('/').pop() || 'unknown_file',
            custom_parameters: {
              file_url: link.href,
              file_name: link.href.split('/').pop()
            }
          });
        }
      }
    });
  }

  /**
   * Set up contact form tracking
   */
  private setupContactFormTracking(): void {
    const contactForms = document.querySelectorAll('#contactForm, .contact-form, .comment-form');

    contactForms.forEach(form => {
      form.addEventListener('submit', () => {
        this.trackConversion({
          event_name: 'generate_lead',
          value: 500, // High-value lead
          currency: 'AUD'
        });
      });
    });
  }

  /**
   * Set up newsletter tracking
   */
  private setupNewsletterTracking(): void {
    const newsletterForms = document.querySelectorAll('.newsletter-form');

    newsletterForms.forEach(form => {
      form.addEventListener('submit', () => {
        this.trackConversion({
          event_name: 'sign_up',
          value: 25,
          currency: 'AUD'
        });
      });
    });
  }

  /**
   * Set up project inquiry tracking
   */
  private setupProjectInquiryTracking(): void {
    const projectButtons = document.querySelectorAll('.project-card, .work-item, [data-cursor="video"]');

    projectButtons.forEach(element => {
      element.addEventListener('click', () => {
        const projectTitle = element.querySelector('.project-title, .work-title')?.textContent || 'Unknown Project';

        this.trackEvent({
          action: 'project_inquiry',
          category: 'engagement',
          label: projectTitle,
          value: 1,
          custom_parameters: {
            project_title: projectTitle,
            inquiry_type: 'project_view'
          }
        });
      });
    });
  }

  /**
   * Set up engagement tracking
   */
  private setupEngagementTracking(): void {
    // Track high engagement actions
    const engagementActions = [
      { selector: '.read-more-btn', action: 'read_more' },
      { selector: '.share-btn', action: 'content_share' },
      { selector: '.filter-btn', action: 'content_filter' },
      { selector: '.load-more-btn', action: 'load_more' }
    ];

    engagementActions.forEach(({ selector, action }) => {
      document.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).matches(selector)) {
          this.trackEvent({
            action: action,
            category: 'engagement',
            value: 1
          });
        }
      });
    });
  }

  /**
   * Initialize heatmap tracking
   */
  private initializeHeatmap(): void {
    // Simple click heatmap tracking
    const clickData = new Map<string, number>();

    document.addEventListener('click', (e) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      const key = `${x},${y}`;

      clickData.set(key, (clickData.get(key) || 0) + 1);

      // Send heatmap data periodically
      if (clickData.size % 10 === 0) {
        this.sendHeatmapData(clickData);
      }
    });
  }

  /**
   * Send heatmap data
   */
  private sendHeatmapData(clickData: Map<string, number>): void {
    const heatmapData = Array.from(clickData.entries()).map(([position, count]) => ({
      position,
      count,
      page: window.location.pathname
    }));

    this.trackEvent({
      action: 'heatmap_data',
      category: 'user_behavior',
      custom_parameters: {
        heatmap_clicks: heatmapData.slice(0, 50) // Limit data size
      }
    });
  }

  /**
   * Track A/B test
   */
  trackABTest(testName: string, variant: string): void {
    this.trackEvent({
      action: 'ab_test_view',
      category: 'experiments',
      label: testName,
      custom_parameters: {
        test_name: testName,
        variant: variant
      }
    });

    // Set user property for this test
    this.setUserProperties({
      [`ab_test_${testName}`]: variant
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.trackEvent({
          action: 'page_load_performance',
          category: 'performance',
          custom_parameters: {
            load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart),
            dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
            first_paint: Math.round(navigation.loadEventEnd - navigation.fetchStart)
          }
        });
      }
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Debug logging
   */
  private log(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[Analytics] ${message}`, data);
    }
  }

  /**
   * Get session data
   */
  getSessionData(): Record<string, any> {
    return Object.fromEntries(this.sessionData);
  }

  /**
   * Export analytics data
   */
  exportData(): any {
    return {
      session: this.getSessionData(),
      timestamp: Date.now(),
      page: window.location.href
    };
  }
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize analytics
const analytics = new SonarAnalytics();

// Export for use in other modules
export default analytics;
export { SonarAnalytics };
export type { AnalyticsEvent, ConversionEvent, UserProperties };

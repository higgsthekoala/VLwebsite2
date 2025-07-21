/**
 * Enhanced Main Script - Sonar Music Clone
 * Comprehensive system combining all advanced features and animations
 * Recreates functionality from original external scripts
 */

import type SonarMarquee from './marquee';
import cms from './cms';
import analytics from './analytics';
import i18n from './i18n';

class EnhancedSonarApp {
  private marquee: SonarMarquee | null = null;
  private cursor: HTMLElement | null = null;
  private cursorTrail: HTMLElement[] = [];
  private mouse: { x: number; y: number } = { x: 0, y: 0 };
  private particleSystem: any = null;
  private masterTimeline: any = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the enhanced application
   */
  private async init(): Promise<void> {
    try {
      // Wait for GSAP to load
      await this.waitForLibraries();

      // Initialize core systems
      await this.initializeCoreServices();

      // Setup GSAP configurations
      this.setupGSAP();

      // Initialize UI components
      this.initializeComponents();

      // Setup advanced interactions
      this.setupAdvancedInteractions();

      // Initialize animations
      this.initializeAnimations();

      // Setup event listeners
      this.setupEventListeners();

      // Load dynamic content
      await this.loadDynamicContent();

      // Track initialization
      analytics.trackEvent({
        action: 'app_initialized',
        category: 'system',
        label: 'enhanced_app'
      });

      console.log('🎵 Enhanced Sonar Music App - Fully Loaded');

    } catch (error) {
      console.error('Failed to initialize Enhanced Sonar App:', error);
    }
  }

  /**
   * Wait for required libraries to load
   */
  private waitForLibraries(): Promise<void> {
    return new Promise((resolve) => {
      const checkLibraries = () => {
        if (window.gsap && window.ScrollTrigger && window.THREE) {
          resolve();
        } else {
          setTimeout(checkLibraries, 100);
        }
      };
      checkLibraries();
    });
  }

  /**
   * Initialize core services
   */
  private async initializeCoreServices(): Promise<void> {
    // Initialize CMS
    await cms.preloadAll();

    // Initialize i18n
    await i18n.initialize();

    // Initialize analytics
    analytics.trackPageView();
  }

  /**
   * Setup GSAP configurations
   */
  private setupGSAP(): void {
    const { gsap, ScrollTrigger } = window;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Create master timeline
    this.masterTimeline = gsap.timeline({ paused: true });

    // Set initial states for animations
    this.setInitialStates();
  }

  /**
   * Set initial states for elements
   */
  private setInitialStates(): void {
    const { gsap } = window;

    // Hide elements that will be animated in
    gsap.set('.animate-in', { opacity: 0, y: 50 });
    gsap.set('.animate-fade', { opacity: 0 });
    gsap.set('.animate-scale', { opacity: 0, scale: 0.8 });
    gsap.set('.animate-slide-left', { opacity: 0, x: -50 });
    gsap.set('.animate-slide-right', { opacity: 0, x: 50 });
    gsap.set('.animate-text-reveal', { opacity: 0, y: 100 });
  }

  /**
   * Initialize UI components
   */
  private initializeComponents(): void {
    // Initialize custom cursor
    this.initializeCursor();

    // Initialize particle system
    this.initializeParticles();

    // Initialize scroll effects
    this.initializeScrollEffects();

    // Initialize page transitions
    this.initializePageTransitions();

    // Initialize audio visualizer
    this.initializeAudioVisualizer();
  }

  /**
   * Initialize enhanced cursor
   */
  private initializeCursor(): void {
    // Create cursor elements
    this.cursor = document.createElement('div');
    this.cursor.className = 'enhanced-cursor';
    this.cursor.innerHTML = `
      <div class="cursor-inner"></div>
      <div class="cursor-outer"></div>
    `;
    document.body.appendChild(this.cursor);

    // Create cursor trail
    for (let i = 0; i < 10; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail-dot';
      trail.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(200, 150, 106, ${0.8 - i * 0.08});
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transition: all 0.1s ease;
      `;
      document.body.appendChild(trail);
      this.cursorTrail.push(trail);
    }

    this.setupCursorInteractions();
  }

  /**
   * Setup cursor interactions
   */
  private setupCursorInteractions(): void {
    const trailHistory: { x: number; y: number }[] = [];

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Update cursor position
      if (this.cursor) {
        this.cursor.style.left = `${e.clientX}px`;
        this.cursor.style.top = `${e.clientY}px`;
      }

      // Update trail
      trailHistory.unshift({ x: e.clientX, y: e.clientY });
      if (trailHistory.length > 10) {
        trailHistory.pop();
      }

      this.cursorTrail.forEach((trail, index) => {
        if (trailHistory[index]) {
          trail.style.left = `${trailHistory[index].x}px`;
          trail.style.top = `${trailHistory[index].y}px`;
        }
      });
    });

    // Cursor hover effects
    document.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-cursor="hover"], a, button, .btn, .nav-link')) {
        this.cursor?.classList.add('cursor-hover');
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-cursor="hover"], a, button, .btn, .nav-link')) {
        this.cursor?.classList.remove('cursor-hover');
      }
    }, true);
  }

  /**
   * Initialize particle system
   */
  private initializeParticles(): void {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    if (!canvas || !window.THREE) return;

    const { THREE } = window;

    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Color (Sonar brand colors)
      colors[i3] = 0.784; // R
      colors[i3 + 1] = 0.588; // G
      colors[i3 + 2] = 0.416; // B
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.particleSystem = { scene, camera, renderer, particles };
  }

  /**
   * Initialize scroll effects
   */
  private initializeScrollEffects(): void {
    const { gsap } = window;

    // Parallax elements
    gsap.utils.toArray('.parallax').forEach((element: any) => {
      const speed = element.dataset.speed || 0.5;
      gsap.to(element, {
        yPercent: -50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Reveal animations
    gsap.utils.toArray('.animate-in').forEach((element: any) => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Text reveal animations
    gsap.utils.toArray('.animate-text-reveal').forEach((element: any) => {
      const chars = this.splitText(element);
      gsap.fromTo(chars,
        { opacity: 0, y: 100, rotationX: -90 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Scale animations
    gsap.utils.toArray('.animate-scale').forEach((element: any) => {
      gsap.to(element, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  /**
   * Split text into individual characters
   */
  private splitText(element: HTMLElement): HTMLElement[] {
    const text = element.textContent || '';
    const chars: HTMLElement[] = [];

    element.innerHTML = '';

    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      element.appendChild(span);
      chars.push(span);
    }

    return chars;
  }

  /**
   * Initialize page transitions
   */
  private initializePageTransitions(): void {
    // This is handled by the Navigation class
    // Additional page-specific transitions can be added here
  }

  /**
   * Initialize audio visualizer
   */
  private initializeAudioVisualizer(): void {
    try {
      // Create visualizer elements
      this.createAudioVisualizer();

    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }

  /**
   * Create audio visualizer
   */
  private createAudioVisualizer(): void {
    const visualizer = document.createElement('div');
    visualizer.className = 'audio-visualizer';
    visualizer.innerHTML = `
      <div class="visualizer-bars">
        ${Array.from({ length: 32 }, (_, i) =>
          `<div class="visualizer-bar" style="--delay: ${i * 0.05}s"></div>`
        ).join('')}
      </div>
    `;

    // Find a suitable container or append to body
    const container = document.querySelector('.hero-section') || document.body;
    container.appendChild(visualizer);

    // Animate bars
    const { gsap } = window;
    gsap.to('.visualizer-bar', {
      scaleY: () => Math.random() * 0.8 + 0.2,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: {
        each: 0.05,
        repeat: -1
      }
    });
  }

  /**
   * Setup advanced interactions
   */
  private setupAdvancedInteractions(): void {
    this.setupMagneticElements();
    this.setupHoverEffects();
    this.setupScrollTriggers();
    this.setupKeyboardShortcuts();
  }

  /**
   * Setup magnetic elements
   */
  private setupMagneticElements(): void {
    const { gsap } = window;

    document.querySelectorAll('[data-magnetic]').forEach((element) => {
      const el = element as HTMLElement;
      let magneticTL: any = null;

      el.addEventListener('mouseenter', () => {
        magneticTL = gsap.to(el, { duration: 0.3, scale: 1.1 });
      });

      el.addEventListener('mousemove', (e) => {
        if (!magneticTL) return;

        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.3
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }

  /**
   * Setup hover effects
   */
  private setupHoverEffects(): void {
    const { gsap } = window;

    // Project cards
    document.querySelectorAll('.project-card').forEach((card) => {
      const image = card.querySelector('.project-thumbnail');
      const content = card.querySelector('.project-content');

      if (image && content) {
        card.addEventListener('mouseenter', () => {
          gsap.to(image, { scale: 1.1, duration: 0.5 });
          gsap.to(content, { y: -10, duration: 0.3 });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(image, { scale: 1, duration: 0.5 });
          gsap.to(content, { y: 0, duration: 0.3 });
        });
      }
    });
  }

  /**
   * Setup scroll triggers
   */
  private setupScrollTriggers(): void {
    const { ScrollTrigger } = window;

    // Update header on scroll
    // @ts-expect-error - ScrollTrigger create method
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self: any) => {
        const progress = self.progress;
        this.updateScrollProgress(progress);
      }
    });
  }

  /**
   * Update scroll progress
   */
  private updateScrollProgress(progress: number): void {
    const progressBar = document.querySelector('.scroll-progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  /**
   * Open search functionality
   */
  private openSearch(): void {
    // Implementation for search modal
    console.log('Search opened');
  }

  /**
   * Close all modals
   */
  private closeModals(): void {
    document.querySelectorAll('.modal.active, .video-modal.active').forEach((modal) => {
      modal.classList.remove('active');
    });
  }

  /**
   * Initialize animations
   */
  private initializeAnimations(): void {
    this.createEntranceAnimations();
    this.createScrollAnimations();
    this.createInteractionAnimations();
  }

  /**
   * Create entrance animations
   */
  private createEntranceAnimations(): void {
    // Listen for intro complete
    document.addEventListener('sonar:intro-complete', () => {
      this.playEntranceAnimations();
    });
  }

  /**
   * Play entrance animations
   */
  private playEntranceAnimations(): void {
    const { gsap } = window;

    const tl = gsap.timeline();

    tl
      .from('.category-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      }, 0.5)
      .from('.project-card', {
        y: 80,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out'
      }, 1)
      .from('.featured-section', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, 1.5);
  }

  /**
   * Create scroll animations
   */
  private createScrollAnimations(): void {
    // Handled in initializeScrollEffects
  }

  /**
   * Create interaction animations
   */
  private createInteractionAnimations(): void {
    // Handled in setupAdvancedInteractions
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Window events
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('scroll', () => this.handleScroll());

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    // Update particle system
    if (this.particleSystem) {
      const { camera, renderer } = this.particleSystem;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Refresh ScrollTrigger
    // @ts-expect-error - ScrollTrigger refresh method
    window.ScrollTrigger?.refresh();
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    // Throttled scroll handling is done via ScrollTrigger
  }

  /**
   * Pause animations for performance
   */
  private pauseAnimations(): void {
    this.masterTimeline?.pause();
  }

  /**
   * Resume animations
   */
  private resumeAnimations(): void {
    this.masterTimeline?.resume();
  }

  /**
   * Load dynamic content
   */
  private async loadDynamicContent(): Promise<void> {
    try {
      // Load and display dynamic marquees
      await this.loadDynamicMarquees();

      // Load project data
      await this.loadProjectShowcase();

    } catch (error) {
      console.error('Failed to load dynamic content:', error);
    }
  }

  /**
   * Load dynamic marquees
   */
  private async loadDynamicMarquees(): Promise<void> {
    // Insert marquees between sections
    this.insertMarqueeAfterSection('.category-section', 'category-marquee');
    this.insertMarqueeAfterSection('.project-showcase', 'project-marquee');
    this.insertMarqueeAfterSection('.featured-section', 'skills-marquee');
  }

  /**
   * Insert marquee after section
   */
  private insertMarqueeAfterSection(sectionSelector: string, marqueeId: string): void {
    const section = document.querySelector(sectionSelector);
    const marquee = document.getElementById(marqueeId);

    if (section && marquee) {
      section.insertAdjacentElement('afterend', marquee);
    }
  }

  /**
   * Load project showcase
   */
  private async loadProjectShowcase(): Promise<void> {
    try {
      const projects = await cms.getProjects({ featured: true, limit: 6 });

      if (projects.length > 0 && this.marquee) {
        const projectMarquee = this.marquee.createProjectShowcase(projects);

        // Insert after featured section
        const featuredSection = document.querySelector('.featured-section');
        if (featuredSection) {
          featuredSection.insertAdjacentElement('afterend', projectMarquee);
        }
      }
    } catch (error) {
      console.error('Failed to load project showcase:', error);
    }
  }

  /**
   * Public API methods
   */
  public getTimeline(): any {
    return this.masterTimeline;
  }

  public getCMS() {
    return cms;
  }

  public getAnalytics() {
    return analytics;
  }

  public getI18n() {
    return i18n;
  }
}

// Global initialization
let enhancedApp: EnhancedSonarApp | undefined;

// Wait for DOM and initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    enhancedApp = new EnhancedSonarApp();
    // Expose to window for debugging
    (window as any).EnhancedSonarApp = enhancedApp;
  });
} else {
  enhancedApp = new EnhancedSonarApp();
  // Expose to window for debugging
  (window as any).EnhancedSonarApp = enhancedApp;
}

export default EnhancedSonarApp;

/**
 * Advanced Navigation System with Motion Graphics
 * Enhanced transparent menu with smooth page transitions
 */

class SonarNavigation {
  private header: HTMLElement | null = null;
  private mobileMenu: HTMLElement | null = null;
  private menuToggle: HTMLElement | null = null;
  private navLinks: NodeListOf<HTMLAnchorElement> | null = null;
  private isMenuOpen = false;
  private isTransitioning = false;
  private scrollPosition = 0;
  private lastScrollTop = 0;
  private ticking = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize the navigation system
   */
  private init(): void {
    this.setupElements();
    this.setupEventListeners();
    this.createTransitionOverlay();
    this.setupScrollBehavior();
    this.enhanceNavigation();
  }

  /**
   * Setup DOM elements
   */
  private setupElements(): void {
    this.header = document.querySelector('.header');
    this.mobileMenu = document.querySelector('.nav-mobile');
    this.menuToggle = document.querySelector('.mobile-menu-btn');
    this.navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Mobile menu toggle
    this.menuToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });

    // Navigation link clicks
    this.navLinks?.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleNavigation(e, link);
      });
    });

    // Scroll events
    window.addEventListener('scroll', () => {
      this.requestScrollUpdate();
    }, { passive: true });

    // Resize events
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // Mouse leave header
    this.header?.addEventListener('mouseleave', () => {
      this.hideHeader();
    });

    // Mouse enter header
    this.header?.addEventListener('mouseenter', () => {
      this.showHeader();
    });
  }

  /**
   * Create page transition overlay
   */
  private createTransitionOverlay(): void {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = `
      <div class="transition-layer transition-layer-1"></div>
      <div class="transition-layer transition-layer-2"></div>
      <div class="transition-layer transition-layer-3"></div>
      <div class="transition-content">
        <div class="transition-logo">
          <span class="transition-logo-text">SONAR</span>
          <div class="transition-sound-wave">
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
          </div>
        </div>
        <div class="transition-progress">
          <div class="transition-progress-bar"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  /**
   * Setup scroll behavior
   */
  private setupScrollBehavior(): void {
    this.scrollPosition = window.pageYOffset;
    this.lastScrollTop = this.scrollPosition;
  }

  /**
   * Enhance navigation with motion graphics
   */
  private enhanceNavigation(): void {
    const { gsap } = window;
    if (!gsap) return;

    // Add magnetic effect to nav links
    this.navLinks?.forEach(link => {
      this.addMagneticEffect(link);
    });

    // Add header reveal animation
    if (this.header) {
      gsap.set(this.header, { y: -100 });
      gsap.to(this.header, {
        y: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5
      });
    }

    // Enhanced menu button animation
    this.enhanceMenuButton();
  }

  /**
   * Add magnetic effect to elements
   */
  private addMagneticEffect(element: HTMLElement): void {
    const { gsap } = window;
    if (!gsap) return;

    let magneticTL: any = null;

    element.addEventListener('mouseenter', () => {
      magneticTL = gsap.to(element, {
        duration: 0.3,
        scale: 1.05,
        ease: 'power2.out'
      });

      // Add glow effect
      gsap.to(element, {
        textShadow: '0 0 15px rgba(200, 150, 106, 0.6)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    element.addEventListener('mousemove', (e) => {
      if (!magneticTL) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        scale: 1,
        textShadow: 'none',
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  }

  /**
   * Enhance menu button with advanced animation
   */
  private enhanceMenuButton(): void {
    const { gsap } = window;
    if (!gsap || !this.menuToggle) return;

    const lines = this.menuToggle.querySelectorAll('.menu-line');

    // Create timeline for menu button
    const menuTL = gsap.timeline({ paused: true });

    menuTL
      .to(lines[0], { rotation: 45, y: 6, duration: 0.3 }, 0)
      .to(lines[1], { opacity: 0, duration: 0.3 }, 0)
      .to(lines[2], { rotation: -45, y: -6, duration: 0.3 }, 0);

    // Store timeline for later use
    (this.menuToggle as any).animationTimeline = menuTL;
  }

  /**
   * Toggle mobile menu
   */
  private toggleMobileMenu(): void {
    if (this.isTransitioning) return;

    this.isMenuOpen = !this.isMenuOpen;

    const { gsap } = window;
    if (!gsap) return;

    // Animate menu button
    const menuTL = (this.menuToggle as any)?.animationTimeline;
    if (menuTL) {
      this.isMenuOpen ? menuTL.play() : menuTL.reverse();
    }

    // Add menu state classes
    document.body.classList.toggle('mobile-menu-open', this.isMenuOpen);
    this.mobileMenu?.classList.toggle('active', this.isMenuOpen);

    if (this.isMenuOpen) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  }

  /**
   * Open mobile menu with animation
   */
  private openMobileMenu(): void {
    const { gsap } = window;
    if (!gsap || !this.mobileMenu) return;

    const menuLinks = this.mobileMenu.querySelectorAll('.nav-mobile-link');
    const socialLinks = this.mobileMenu.querySelectorAll('.social-link');

    gsap.set(this.mobileMenu, { display: 'flex' });

    const tl = gsap.timeline();

    tl
      .to(this.mobileMenu, {
        clipPath: 'circle(150% at 100% 0%)',
        duration: 0.8,
        ease: 'power4.out'
      })
      .from(menuLinks, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      }, 0.3)
      .from(socialLinks, {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.out'
      }, 0.6);
  }

  /**
   * Close mobile menu with animation
   */
  private closeMobileMenu(): void {
    const { gsap } = window;
    if (!gsap || !this.mobileMenu) return;

    const menuLinks = this.mobileMenu.querySelectorAll('.nav-mobile-link');
    const socialLinks = this.mobileMenu.querySelectorAll('.social-link');

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(this.mobileMenu, { display: 'none' });
      }
    });

    tl
      .to([menuLinks, socialLinks], {
        y: -30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.02,
        ease: 'power2.in'
      })
      .to(this.mobileMenu, {
        clipPath: 'circle(0% at 100% 0%)',
        duration: 0.6,
        ease: 'power4.in'
      }, 0.2);
  }

  /**
   * Handle navigation with page transitions
   */
  private handleNavigation(e: MouseEvent, link: HTMLAnchorElement): void {
    const href = link.getAttribute('href');

    // Skip transition for anchor links and external links
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
      return;
    }

    // Skip if already on the same page
    if (href === window.location.pathname) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (this.isTransitioning) return;

    this.performPageTransition(href);
  }

  /**
   * Perform page transition with motion graphics
   */
  private performPageTransition(href: string): void {
    if (this.isTransitioning) return;

    this.isTransitioning = true;

    const { gsap } = window;
    if (!gsap) {
      window.location.href = href;
      return;
    }

    // Close mobile menu if open
    if (this.isMenuOpen) {
      this.toggleMobileMenu();
    }

    const overlay = document.querySelector('.page-transition-overlay') as HTMLElement;
    const logo = overlay?.querySelector('.transition-logo-text');
    const waveBars = overlay?.querySelectorAll('.wave-bar');
    const progressBar = overlay?.querySelector('.transition-progress-bar');

    if (!overlay) {
      window.location.href = href;
      return;
    }

    // Show overlay
    gsap.set(overlay, { display: 'flex' });

    const tl = gsap.timeline({
      onComplete: () => {
        window.location.href = href;
      }
    });

    tl
      // Slide in transition layers
      .to('.transition-layer-1', {
        x: '0%',
        duration: 0.6,
        ease: 'power4.out'
      })
      .to('.transition-layer-2', {
        x: '0%',
        duration: 0.6,
        ease: 'power4.out'
      }, 0.1)
      .to('.transition-layer-3', {
        x: '0%',
        duration: 0.6,
        ease: 'power4.out'
      }, 0.2)

      // Animate logo and content
      .from(logo, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
      }, 0.4)
      .from(waveBars, {
        scaleY: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      }, 0.6)
      .to(progressBar, {
        width: '100%',
        duration: 0.8,
        ease: 'power2.inOut'
      }, 0.8);
  }

  /**
   * Request scroll update with RAF
   */
  private requestScrollUpdate(): void {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateScrollBehavior();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  /**
   * Update scroll behavior
   */
  private updateScrollBehavior(): void {
    this.scrollPosition = window.pageYOffset;
    const scrollDelta = this.scrollPosition - this.lastScrollTop;

    // Auto-hide/show header based on scroll direction
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0 && this.scrollPosition > 100) {
        // Scrolling down
        this.hideHeader();
      } else {
        // Scrolling up
        this.showHeader();
      }
    }

    // Update header transparency
    this.updateHeaderTransparency();

    this.lastScrollTop = this.scrollPosition;
  }

  /**
   * Update header transparency based on scroll
   */
  private updateHeaderTransparency(): void {
    if (!this.header) return;

    const opacity = Math.min(this.scrollPosition / 100, 0.95);
    this.header.style.setProperty('--header-bg-opacity', opacity.toString());
  }

  /**
   * Hide header
   */
  private hideHeader(): void {
    const { gsap } = window;
    if (!gsap || !this.header) return;

    gsap.to(this.header, {
      y: -100,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * Show header
   */
  private showHeader(): void {
    const { gsap } = window;
    if (!gsap || !this.header) return;

    gsap.to(this.header, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * Handle resize events
   */
  private handleResize(): void {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboard(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.isMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  /**
   * Public method to trigger page transition
   */
  public transitionToPage(href: string): void {
    this.performPageTransition(href);
  }

  /**
   * Public method to update current page
   */
  public updateCurrentPage(pathname: string): void {
    this.navLinks?.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('w--current', href === pathname);
    });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SonarNavigation();
});

// Listen for intro complete event
document.addEventListener('sonar:intro-complete', () => {
  // Any additional setup after intro
});

export default SonarNavigation;

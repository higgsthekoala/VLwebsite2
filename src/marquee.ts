/**
 * Advanced Marquee and Animated Banner System
 * Recreates scrolling text effects and dynamic banners
 */

interface MarqueeOptions {
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  duplicateContent?: boolean;
  gap?: number;
}

class SonarMarquee {
  private marquees: Map<HTMLElement, any> = new Map();
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the marquee system
   */
  private init(): void {
    this.setupObservers();
    this.findAndInitializeMarquees();
    this.createDynamicMarquees();
  }

  /**
   * Setup observers for responsive behavior
   */
  private setupObservers(): void {
    // Resize observer for responsive updates
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const marquee = entry.target as HTMLElement;
        if (this.marquees.has(marquee)) {
          this.updateMarqueeAnimation(marquee);
        }
      });
    });

    // Intersection observer for performance optimization
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const marquee = entry.target as HTMLElement;
          const animation = this.marquees.get(marquee);

          if (animation) {
            if (entry.isIntersecting) {
              animation.play();
            } else {
              animation.pause();
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  /**
   * Find and initialize existing marquees
   */
  private findAndInitializeMarquees(): void {
    const marqueeElements = document.querySelectorAll('.marquee, [data-marquee]');

    marqueeElements.forEach((element) => {
      this.initializeMarquee(element as HTMLElement);
    });
  }

  /**
   * Create dynamic marquees for various sections
   */
  private createDynamicMarquees(): void {
    this.createCategoryMarquee();
    this.createProjectMarquee();
    this.createTestimonialMarquee();
    this.createSkillsMarquee();
  }

  /**
   * Initialize a single marquee element
   */
  private initializeMarquee(element: HTMLElement, options: MarqueeOptions = {}): void {
    const config = {
      speed: Number.parseFloat(element.dataset.speed || '50'),
      direction: (element.dataset.direction as 'left' | 'right') || 'left',
      pauseOnHover: element.dataset.pauseOnHover !== 'false',
      duplicateContent: element.dataset.duplicate !== 'false',
      gap: Number.parseFloat(element.dataset.gap || '2'),
      ...options
    };

    this.setupMarqueeStructure(element, config);
    this.createMarqueeAnimation(element, config);

    // Add to observers
    this.resizeObserver?.observe(element);
    this.intersectionObserver?.observe(element);

    // Setup hover events
    if (config.pauseOnHover) {
      this.setupHoverEvents(element);
    }
  }

  /**
   * Setup marquee HTML structure
   */
  private setupMarqueeStructure(element: HTMLElement, config: MarqueeOptions): void {
    element.classList.add('sonar-marquee');

    // Get or create content
    let content = element.querySelector('.marquee-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'marquee-content';
      content.innerHTML = element.innerHTML;
      element.innerHTML = '';
      element.appendChild(content);
    }

    // Create container and track
    const container = document.createElement('div');
    container.className = 'marquee-container';

    const track = document.createElement('div');
    track.className = 'marquee-track';

    // Move content to track
    track.appendChild(content);

    // Duplicate content if needed
    if (config.duplicateContent) {
      const duplicate = content.cloneNode(true) as HTMLElement;
      duplicate.className = 'marquee-content marquee-duplicate';
      track.appendChild(duplicate);
    }

    container.appendChild(track);
    element.appendChild(container);
  }

  /**
   * Create GSAP animation for marquee
   */
  private createMarqueeAnimation(element: HTMLElement, config: MarqueeOptions): void {
    const { gsap } = window;
    if (!gsap) return;

    const track = element.querySelector('.marquee-track') as HTMLElement;
    const content = element.querySelector('.marquee-content') as HTMLElement;

    if (!track || !content) return;

    const contentWidth = content.offsetWidth;
    const distance = contentWidth + (config.gap! * 16); // Convert rem to px

    const duration = distance / config.speed!;
    const direction = config.direction === 'right' ? 1 : -1;

    const animation = gsap.to(track, {
      x: direction * distance,
      duration: duration,
      ease: 'none',
      repeat: -1,
      onRepeat: () => {
        gsap.set(track, { x: 0 });
      }
    });

    this.marquees.set(element, animation);
  }

  /**
   * Update marquee animation on resize
   */
  private updateMarqueeAnimation(element: HTMLElement): void {
    const animation = this.marquees.get(element);
    if (animation) {
      animation.kill();

      // Get config from data attributes
      const config = {
        speed: Number.parseFloat(element.dataset.speed || '50'),
        direction: (element.dataset.direction as 'left' | 'right') || 'left',
        gap: Number.parseFloat(element.dataset.gap || '2')
      };

      this.createMarqueeAnimation(element, config);
    }
  }

  /**
   * Setup hover pause/resume events
   */
  private setupHoverEvents(element: HTMLElement): void {
    const animation = this.marquees.get(element);
    if (!animation) return;

    element.addEventListener('mouseenter', () => {
      animation.pause();
    });

    element.addEventListener('mouseleave', () => {
      animation.resume();
    });
  }

  /**
   * Create category skills marquee
   */
  private createCategoryMarquee(): void {
    const categories = [
      'FILM SCORING', 'SOUND DESIGN', 'AUDIO POST-PRODUCTION',
      'MUSIC COMPOSITION', 'SONIC BRANDING', 'ORCHESTRATION',
      'MIXING & MASTERING', 'FOLEY RECORDING', 'DIALOGUE EDITING'
    ];

    this.createTextMarquee('category-marquee', categories, {
      speed: 40,
      direction: 'left'
    });
  }

  /**
   * Create project types marquee
   */
  private createProjectMarquee(): void {
    const projects = [
      'FEATURE FILMS', 'DOCUMENTARIES', 'TELEVISION SERIES',
      'COMMERCIALS', 'VIDEO GAMES', 'PODCASTS',
      'SHORT FILMS', 'TRAILERS', 'CORPORATE VIDEOS'
    ];

    this.createTextMarquee('project-marquee', projects, {
      speed: 35,
      direction: 'right'
    });
  }

  /**
   * Create testimonial marquee
   */
  private createTestimonialMarquee(): void {
    const testimonials = [
      '"EXCEPTIONAL SOUND DESIGN"', '"PREMIUM QUALITY MUSIC"',
      '"WORLD-CLASS COMPOSERS"', '"INNOVATIVE AUDIO SOLUTIONS"',
      '"OUTSTANDING CREATIVE VISION"', '"PROFESSIONAL EXCELLENCE"'
    ];

    this.createTextMarquee('testimonial-marquee', testimonials, {
      speed: 30,
      direction: 'left'
    });
  }

  /**
   * Create skills marquee
   */
  private createSkillsMarquee(): void {
    const skills = [
      'PRO TOOLS', 'LOGIC PRO', 'CUBASE', 'REAPER', 'ABLETON LIVE',
      'KONTAKT', 'OMNISPHERE', 'SUPERIOR DRUMMER', 'SPITFIRE AUDIO',
      'NATIVE INSTRUMENTS', 'WAVES', 'FABFILTER', 'SOUNDTOYS'
    ];

    this.createTextMarquee('skills-marquee', skills, {
      speed: 45,
      direction: 'right'
    });
  }

  /**
   * Create a text-based marquee
   */
  private createTextMarquee(
    id: string,
    items: string[],
    options: MarqueeOptions = {}
  ): HTMLElement {
    // Check if marquee already exists
    let marquee = document.getElementById(id);
    if (marquee) return marquee;

    marquee = document.createElement('div');
    marquee.id = id;
    marquee.className = 'sonar-marquee text-marquee';
    marquee.dataset.speed = options.speed?.toString() || '50';
    marquee.dataset.direction = options.direction || 'left';
    marquee.dataset.pauseOnHover = 'true';

    const content = document.createElement('div');
    content.className = 'marquee-content';

    // Create marquee items
    items.forEach((item, index) => {
      const span = document.createElement('span');
      span.className = 'marquee-item';
      span.textContent = item;
      content.appendChild(span);

      if (index < items.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'marquee-separator';
        separator.textContent = '•';
        content.appendChild(separator);
      }
    });

    marquee.appendChild(content);

    // Initialize the marquee
    this.initializeMarquee(marquee, options);

    return marquee;
  }

  /**
   * Create animated banner with custom content
   */
  public createAnimatedBanner(
    container: HTMLElement,
    content: string,
    options: MarqueeOptions = {}
  ): void {
    const banner = document.createElement('div');
    banner.className = 'animated-banner';
    banner.innerHTML = content;

    container.appendChild(banner);
    this.initializeMarquee(banner, options);
  }

  /**
   * Add marquee to existing element
   */
  public addMarquee(element: HTMLElement, options: MarqueeOptions = {}): void {
    this.initializeMarquee(element, options);
  }

  /**
   * Remove marquee animation
   */
  public removeMarquee(element: HTMLElement): void {
    const animation = this.marquees.get(element);
    if (animation) {
      animation.kill();
      this.marquees.delete(element);
    }

    this.resizeObserver?.unobserve(element);
    this.intersectionObserver?.unobserve(element);
  }

  /**
   * Pause all marquees
   */
  public pauseAll(): void {
    this.marquees.forEach((animation) => {
      animation.pause();
    });
  }

  /**
   * Resume all marquees
   */
  public resumeAll(): void {
    this.marquees.forEach((animation) => {
      animation.resume();
    });
  }

  /**
   * Create dynamic project showcase marquee
   */
  public createProjectShowcase(projects: any[]): HTMLElement {
    const marquee = document.createElement('div');
    marquee.className = 'sonar-marquee project-showcase-marquee';
    marquee.dataset.speed = '25';
    marquee.dataset.direction = 'left';

    const content = document.createElement('div');
    content.className = 'marquee-content';

    projects.forEach((project) => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-marquee-item';
      projectItem.innerHTML = `
        <div class="project-marquee-image">
          <img src="${project.thumbnail}" alt="${project.title}">
        </div>
        <div class="project-marquee-info">
          <h4>${project.title}</h4>
          <span>${project.category}</span>
        </div>
      `;
      content.appendChild(projectItem);
    });

    marquee.appendChild(content);
    this.initializeMarquee(marquee);

    return marquee;
  }

  /**
   * Destroy all marquees and observers
   */
  public destroy(): void {
    this.marquees.forEach((animation) => {
      animation.kill();
    });
    this.marquees.clear();

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
  }
}

// Auto-initialize when DOM is ready
let sonarMarqueeInstance: SonarMarquee | undefined;

document.addEventListener('DOMContentLoaded', () => {
  sonarMarqueeInstance = new SonarMarquee();
  // Expose global instance
  (window as any).SonarMarquee = sonarMarqueeInstance;
});

export default SonarMarquee;

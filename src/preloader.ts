/**
 * Advanced Preloader and Introduction Animation System
 * Recreates and enhances the original Sonar Music intro experience
 */

class SonarPreloader {
  private container: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private timeline: any = null;
  private loadingComplete = false;
  private assetsLoaded = 0;
  private totalAssets = 0;

  constructor() {
    this.init();
  }

  /**
   * Initialize the preloader
   */
  private init(): void {
    this.createPreloaderHTML();
    this.setupEventListeners();
    this.startIntroSequence();
  }

  /**
   * Create the preloader HTML structure
   */
  private createPreloaderHTML(): void {
    const preloaderHTML = `
      <div class="sonar-preloader" id="sonarPreloader">
        <div class="preloader-background">
          <div class="preloader-particles"></div>
          <div class="preloader-grid"></div>
        </div>

        <div class="preloader-content">
          <div class="preloader-logo-container">
            <div class="preloader-logo">
              <span class="logo-letter" data-letter="S">S</span>
              <span class="logo-letter" data-letter="O">O</span>
              <span class="logo-letter" data-letter="N">N</span>
              <span class="logo-letter" data-letter="A">A</span>
              <span class="logo-letter" data-letter="R">R</span>
            </div>
            <div class="preloader-tagline">
              <span class="tagline-word">PREMIUM</span>
              <span class="tagline-word">SOUND</span>
              <span class="tagline-word">DESIGN</span>
            </div>
          </div>

          <div class="preloader-progress">
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <div class="progress-text">
                <span class="progress-percentage">0%</span>
                <span class="progress-label">LOADING</span>
              </div>
            </div>
          </div>

          <div class="preloader-audio-visualizer">
            <div class="audio-bar" style="--delay: 0s"></div>
            <div class="audio-bar" style="--delay: 0.1s"></div>
            <div class="audio-bar" style="--delay: 0.2s"></div>
            <div class="audio-bar" style="--delay: 0.3s"></div>
            <div class="audio-bar" style="--delay: 0.4s"></div>
            <div class="audio-bar" style="--delay: 0.5s"></div>
            <div class="audio-bar" style="--delay: 0.6s"></div>
          </div>
        </div>

        <div class="preloader-transition">
          <div class="transition-overlay"></div>
          <div class="transition-sound-wave">
            <svg viewBox="0 0 1200 200" class="sound-wave-svg">
              <path class="sound-wave-path" d="M0,100 Q150,50 300,100 T600,100 T900,100 T1200,100"
                    stroke="#c8966a" stroke-width="2" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
    this.container = document.getElementById('sonarPreloader');
    this.progressBar = document.querySelector('.progress-fill');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Track image loading
    this.trackAssetLoading();

    // Handle window load
    window.addEventListener('load', () => {
      this.onWindowLoad();
    });

    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.loadingComplete) {
        this.completeIntro();
      }
    });
  }

  /**
   * Track loading of assets
   */
  private trackAssetLoading(): void {
    const images = document.querySelectorAll('img');
    const videos = document.querySelectorAll('video');

    this.totalAssets = images.length + videos.length;

    if (this.totalAssets === 0) {
      this.totalAssets = 1; // Prevent division by zero
    }

    // Track images
    images.forEach(img => {
      if (img.complete) {
        this.onAssetLoaded();
      } else {
        img.addEventListener('load', () => this.onAssetLoaded());
        img.addEventListener('error', () => this.onAssetLoaded());
      }
    });

    // Track videos
    videos.forEach(video => {
      if (video.readyState >= 3) {
        this.onAssetLoaded();
      } else {
        video.addEventListener('canplaythrough', () => this.onAssetLoaded());
        video.addEventListener('error', () => this.onAssetLoaded());
      }
    });

    // Fallback timeout
    setTimeout(() => {
      if (!this.loadingComplete) {
        this.assetsLoaded = this.totalAssets;
        this.updateProgress();
      }
    }, 8000);
  }

  /**
   * Handle individual asset load
   */
  private onAssetLoaded(): void {
    this.assetsLoaded++;
    this.updateProgress();
  }

  /**
   * Update progress bar
   */
  private updateProgress(): void {
    const progress = Math.min((this.assetsLoaded / this.totalAssets) * 100, 100);

    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }

    const progressText = document.querySelector('.progress-percentage');
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }

    if (progress >= 100 && !this.loadingComplete) {
      this.loadingComplete = true;
      setTimeout(() => this.completeIntro(), 1000);
    }
  }

  /**
   * Handle window load
   */
  private onWindowLoad(): void {
    if (!this.loadingComplete) {
      this.loadingComplete = true;
      setTimeout(() => this.completeIntro(), 500);
    }
  }

  /**
   * Start the intro sequence
   */
  private startIntroSequence(): void {
    const { gsap } = window;
    if (!gsap) return;

    this.timeline = gsap.timeline();

    // Animate background particles
    this.animateParticles();

    // Animate logo letters
    this.timeline
      .set('.logo-letter', {
        opacity: 0,
        y: 100,
        rotationX: -90,
        transformOrigin: '50% 50% -50px'
      })
      .set('.tagline-word', {
        opacity: 0,
        y: 30,
        scale: 0.8
      })
      .set('.progress-container', {
        opacity: 0,
        y: 50
      })
      .set('.audio-bar', {
        scaleY: 0
      })

      // Logo animation
      .to('.logo-letter', {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }, 0.5)

      // Tagline animation
      .to('.tagline-word', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power3.out'
      }, 1.2)

      // Progress bar animation
      .to('.progress-container', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out'
      }, 1.8)

      // Audio visualizer
      .to('.audio-bar', {
        scaleY: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        repeat: -1,
        yoyo: true
      }, 2);

    // Continuous logo glow effect
    gsap.to('.preloader-logo', {
      textShadow: '0 0 20px rgba(200, 150, 106, 0.8), 0 0 40px rgba(200, 150, 106, 0.4)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  /**
   * Animate background particles
   */
  private animateParticles(): void {
    const { gsap } = window;
    if (!gsap) return;

    const particlesContainer = document.querySelector('.preloader-particles');
    if (!particlesContainer) return;

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(200, 150, 106, 0.6);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      particlesContainer.appendChild(particle);

      // Animate particle
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
      });
    }

    // Animate grid
    const grid = document.querySelector('.preloader-grid');
    if (grid) {
      gsap.to(grid, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      });
    }
  }

  /**
   * Complete the intro and transition to main site
   */
  private completeIntro(): void {
    const { gsap } = window;
    if (!gsap || !this.container) return;

    const exitTimeline = gsap.timeline({
      onComplete: () => {
        this.container?.remove();
        this.revealMainSite();
      }
    });

    // Update progress to 100%
    this.updateProgress();

    // Exit animation
    exitTimeline
      .to('.progress-label', {
        text: 'COMPLETE',
        duration: 0.3
      })
      .to('.audio-bar', {
        scaleY: 2,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.out'
      }, 0.5)
      .to('.preloader-content', {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: 'power3.in'
      }, 1)
      .to('.sound-wave-path', {
        strokeDasharray: '20 10',
        strokeDashoffset: -100,
        duration: 1,
        ease: 'power2.inOut'
      }, 1.2)
      .to('.transition-overlay', {
        scaleY: 1,
        duration: 1.2,
        ease: 'power4.inOut',
        transformOrigin: 'bottom'
      }, 1.5)
      .to('.sonar-preloader', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, 2.2);
  }

  /**
   * Reveal the main site with animation
   */
  private revealMainSite(): void {
    const { gsap } = window;
    if (!gsap) return;

    // Remove preloader styles from body
    document.body.classList.remove('preloader-active');

    // Animate main site elements
    const mainTimeline = gsap.timeline();

    mainTimeline
      .set('body', { overflow: 'hidden' })
      .set('.header', { y: -100, opacity: 0 })
      .set('.hero-content > *', { y: 100, opacity: 0 })
      .set('.scroll-indicator', { y: 50, opacity: 0 })

      // Header reveal
      .to('.header', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      })

      // Hero content stagger
      .to('.hero-content > *', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      }, 0.3)

      // Scroll indicator
      .to('.scroll-indicator', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, 1.5)

      // Enable scrolling
      .set('body', { overflow: 'auto' }, 2);

    // Trigger any additional initialization
    document.dispatchEvent(new CustomEvent('sonar:intro-complete'));
  }

  /**
   * Public method to force complete intro
   */
  public forceComplete(): void {
    if (!this.loadingComplete) {
      this.loadingComplete = true;
      this.completeIntro();
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add preloader active class to body
  document.body.classList.add('preloader-active');

  // Initialize preloader
  new SonarPreloader();
});

// Export for use in other modules
export default SonarPreloader;

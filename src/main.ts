/**
 * SONAR MUSIC - WEBFLOW COMPATIBLE JAVASCRIPT
 * All animations and interactions for the Sonar Music website
 */

// Type declarations for global libraries
declare global {
  interface Window {
    gsap: typeof import('gsap');
    ScrollTrigger: typeof import('gsap/ScrollTrigger');
    THREE: typeof import('three');
    Vimeo: {
      Player: new (iframe: string | HTMLElement, options?: Record<string, unknown>) => {
        play(): Promise<void>;
        pause(): Promise<void>;
        destroy(): Promise<void>;
        on(event: string, callback: () => void): void;
      };
    };
  }
}

interface MousePosition {
  x: number;
  y: number;
}

// interface ParticleTrail {
//   x: number;
//   y: number;
//   opacity: number;
//   scale: number;
//   life: number;
//   element: HTMLElement;
// }

interface VideoPlayerState {
  isPlaying: boolean;
  currentVideo: string | null;
  modal: HTMLElement | null;
}

class SonarMusicApp {
  private mouse: MousePosition = { x: 0, y: 0 };
  private videoState: VideoPlayerState = {
    isPlaying: false,
    currentVideo: null,
    modal: null
  };
  private magneticElements: HTMLElement[] = [];
  // private particleScene: any = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Wait for DOM and libraries to load
    await this.waitForLibraries();

    // Initialize all components
    this.initGSAP();
    this.initSmoothScroll();
    this.initCursor();
    this.initParticles();
    this.initAnimations();
    this.initVideoPlayers();
    this.initMobileMenu();
    this.initScrollProgress();
    this.initMagneticElements();
    this.initPageTransitions();
    this.initNewsletterForm();
    this.initContactPage();
    this.trackMouse();

    // Start animation sequences
    this.startPageLoadAnimations();

    console.log('🎵 Sonar Music - All systems loaded');
  }

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

  // ===== GSAP INITIALIZATION =====
  private initGSAP(): void {
    const { gsap, ScrollTrigger } = window;

    gsap.registerPlugin(ScrollTrigger);

    // Set default ease
    gsap.defaults({
      duration: 0.8,
      ease: "power2.out"
    });

    // Refresh ScrollTrigger on window resize
    window.addEventListener('resize', () => {
      // @ts-expect-error - ScrollTrigger refresh method
      ScrollTrigger.refresh();
    });
  }

  // ===== SMOOTH SCROLLING =====
  private initSmoothScroll(): void {
    // Simple smooth scroll implementation for better browser compatibility
    let isScrolling = false;

    const smoothScrollTo = (target: number, duration = 1000) => {
      if (isScrolling) return;
      isScrolling = true;

      const startPosition = window.pageYOffset;
      const distance = target - startPosition;
      let startTime: number | null = null;

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function
        const ease = progress * (2 - progress);
        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          isScrolling = false;
        }
      };

      requestAnimationFrame(animation);
    };

    // Handle anchor link clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href')!);
        if (target) {
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
          smoothScrollTo(targetPosition);
        }
      });
    });
  }

  // ===== CUSTOM CURSOR =====
  private initCursor(): void {
    const cursor = document.getElementById('cursor');

    if (!cursor || window.innerWidth <= 768) return;

    let cursorX = 0;
    let cursorY = 0;
    let targetX = 0;
    let targetY = 0;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Add trail particle
      this.addCursorTrail(e.clientX, e.clientY);
    };

    // Cursor animation loop
    const updateCursor = () => {
      const dx = targetX - cursorX;
      const dy = targetY - cursorY;

      cursorX += dx * 0.1;
      cursorY += dy * 0.1;

      if (cursor) {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }

      requestAnimationFrame(updateCursor);
    };

    // Cursor state handlers
    const handleMouseEnter = (element: Element) => {
      const cursorType = element.getAttribute('data-cursor');

      if (cursor) {
        cursor.classList.add(`cursor-${cursorType || 'hover'}`);

        switch (cursorType) {
          case 'hover':
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.backgroundColor = '#e3e2db';
            cursor.style.mixBlendMode = 'normal';
            break;
          case 'video':
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.backgroundColor = '#e3e2db';
            cursor.style.filter = 'blur(3px)';
            cursor.style.mixBlendMode = 'screen';
            break;
          default:
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            break;
        }
      }
    };

    const handleMouseLeave = () => {
      if (cursor) {
        cursor.className = 'cursor';
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = '#b28450';
        cursor.style.filter = 'none';
        cursor.style.mixBlendMode = 'difference';
      }
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);

    // Add cursor effects to interactive elements
    document.querySelectorAll('[data-cursor]').forEach(element => {
      element.addEventListener('mouseenter', () => handleMouseEnter(element));
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    // Start cursor animation
    updateCursor();
  }

  private addCursorTrail(x: number, y: number): void {
    if (Math.random() > 0.3) return; // Reduce frequency

    const trail = document.createElement('div');
    trail.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: #b28450;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      opacity: 0.8;
    `;

    document.body.appendChild(trail);

    // Animate trail particle
    const { gsap } = window;
    gsap.to(trail, {
      opacity: 0,
      scale: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => trail.remove()
    });
  }

  // ===== THREE.JS PARTICLES =====
  private initParticles(): void {
    const container = document.getElementById('particles-container');
    if (!container || !window.THREE) return;

    const { THREE } = window;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Particle system
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Positions
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Colors (Sonar Music palette)
      const colorVariant = Math.random();
      if (colorVariant < 0.3) {
        colors[i3] = 0.698; // Accent brown
        colors[i3 + 1] = 0.518;
        colors[i3 + 2] = 0.314;
      } else if (colorVariant < 0.6) {
        colors[i3] = 0.706; // Light grey
        colors[i3 + 1] = 0.722;
        colors[i3 + 2] = 0.710;
      } else {
        colors[i3] = 0.890; // Foreground white
        colors[i3 + 1] = 0.890;
        colors[i3 + 2] = 0.863;
      }

      // Sizes
      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particles, material);
    scene.add(particleSystem);

    // Camera position
    camera.position.z = 8;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate particle system
      particleSystem.rotation.y += 0.001;
      particleSystem.rotation.x += 0.0005;

      // Mouse interaction
      const mouseInfluence = 0.0001;
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Float animation
        positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;

        // Mouse influence
        const mouseX = (this.mouse.x / window.innerWidth) * 2 - 1;
        const mouseY = -(this.mouse.y / window.innerHeight) * 2 + 1;

        positions[i3] += mouseX * mouseInfluence;
        positions[i3 + 1] += mouseY * mouseInfluence;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Store scene reference for potential cleanup
    // this.particleScene = { scene, camera, renderer, particleSystem };
  }

  // ===== ANIMATIONS =====
  private initAnimations(): void {
    // Text reveal animations
    this.initTextRevealAnimations();

    // Scroll-triggered animations
    this.initScrollAnimations();

    // Hover animations
    this.initHoverAnimations();

    // Parallax effects
    this.initParallaxEffects();
  }

  private initTextRevealAnimations(): void {
    const { gsap } = window;

    // Split text into characters for animation
    const splitText = (element: HTMLElement) => {
      const text = element.textContent || '';
      const chars: HTMLSpanElement[] = [];

      element.innerHTML = '';

      Array.from(text).forEach((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(100px) rotateX(-90deg)';
        span.style.transformOrigin = '0% 50% -50px';
        element.appendChild(span);
        chars.push(span);
      });

      return chars;
    };

    // Animate text reveals
    document.querySelectorAll('.animate-text-reveal').forEach((element) => {
      const chars = splitText(element as HTMLElement);

      gsap.to(chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        stagger: 0.03,
        ease: "power4.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  private initScrollAnimations(): void {
    const { gsap } = window;

    // Fade in animations
    document.querySelectorAll('.animate-text').forEach((element) => {
      gsap.fromTo(element,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Project cards stagger animation
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 0) {
      gsap.fromTo(projectCards,
        {
          opacity: 0,
          y: 100,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".projects-grid",
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Category cards animation
    const categoryCards = document.querySelectorAll('.category-card');
    if (categoryCards.length > 0) {
      gsap.fromTo(categoryCards,
        {
          opacity: 0,
          y: 80,
          rotation: 5
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".categories-grid",
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }

  private initHoverAnimations(): void {
    const { gsap } = window;

    // Project card hover effects
    document.querySelectorAll('.project-card').forEach((card) => {
      const thumbnail = card.querySelector('.project-thumbnail');
      const overlay = card.querySelector('.project-overlay');
      const playBtn = card.querySelector('.project-play-btn');
      const info = card.querySelector('.project-info');
      const glitch = card.querySelector('.glitch-overlay');

      if (!thumbnail || !overlay || !playBtn || !info) return;

      const hoverTl = gsap.timeline({ paused: true });

      hoverTl
        .to(thumbnail, { scale: 1.1, duration: 0.8, ease: "power2.out" })
        .to(overlay, { opacity: 0.9, duration: 0.4 }, 0)
        .to(playBtn, {
          opacity: 1,
          scale: 1.2,
          rotation: 180,
          duration: 0.6,
          ease: "back.out(1.7)"
        }, 0.2)
        .to(info, { y: -10, duration: 0.4, ease: "power2.out" }, 0.3);

      if (glitch) {
        hoverTl.to(glitch, {
          opacity: 1,
          x: "100%",
          duration: 1,
          ease: "power3.out"
        }, 0.1);
      }

      card.addEventListener('mouseenter', () => hoverTl.play());
      card.addEventListener('mouseleave', () => hoverTl.reverse());
    });

    // Category card hover effects
    document.querySelectorAll('.category-card').forEach((card) => {
      const bg = card.querySelector('.category-bg');
      const arrow = card.querySelector('.category-arrow');
      const info = card.querySelector('.category-info');

      if (!bg || !arrow || !info) return;

      const hoverTl = gsap.timeline({ paused: true });

      hoverTl
        .to(bg, { scale: 1.1, duration: 0.6, ease: "power2.out" })
        .to(arrow, {
          x: 4,
          y: -4,
          scale: 1.2,
          rotation: 45,
          duration: 0.4
        }, 0)
        .to(info, { y: -4, duration: 0.4 }, 0.2);

      card.addEventListener('mouseenter', () => hoverTl.play());
      card.addEventListener('mouseleave', () => hoverTl.reverse());
    });
  }

  private initParallaxEffects(): void {
    const { gsap } = window;

    // Hero background parallax
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });
    }

    // Project thumbnail parallax
    document.querySelectorAll('.project-thumbnail').forEach((thumbnail) => {
      gsap.to(thumbnail, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: thumbnail.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    });
  }

  // ===== VIDEO PLAYERS =====
  private initVideoPlayers(): void {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.querySelector('.video-close-btn');
    const overlay = document.querySelector('.video-modal-overlay');
    const playerContainer = document.querySelector('.video-player-container');

    if (!modal || !closeBtn || !overlay || !playerContainer) return;

    this.videoState.modal = modal;

    // Video card click handlers
    document.querySelectorAll('.project-card[data-cursor="video"]').forEach((card) => {
      const playBtn = card.querySelector('.project-play-btn');
      const vimeoContainer = card.querySelector('.project-video');
      const vimeoId = vimeoContainer?.getAttribute('data-vimeo-id');

      if (!playBtn || !vimeoId) return;

      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openVideoModal(vimeoId);
      });
    });

    // Close modal handlers
    const closeModal = () => {
      this.closeVideoModal();
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.videoState.isPlaying) {
        closeModal();
      }
    });
  }

  private openVideoModal(vimeoId: string): void {
    const modal = this.videoState.modal;
    const playerContainer = document.querySelector('.video-player-container');

    if (!modal || !playerContainer) return;

    // Create Vimeo iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    iframe.setAttribute('allowfullscreen', '');

    playerContainer.innerHTML = '';
    playerContainer.appendChild(iframe);

    // Show modal with animation
    const { gsap } = window;
    modal.style.display = 'flex';

    gsap.fromTo(modal,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    gsap.fromTo(playerContainer,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
    );

    this.videoState.isPlaying = true;
    this.videoState.currentVideo = vimeoId;
  }

  private closeVideoModal(): void {
    const modal = this.videoState.modal;
    const playerContainer = document.querySelector('.video-player-container');

    if (!modal || !playerContainer) return;

    const { gsap } = window;

    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        modal.style.display = 'none';
        playerContainer.innerHTML = '';
      }
    });

    this.videoState.isPlaying = false;
    this.videoState.currentVideo = null;
  }

  // ===== MOBILE MENU =====
  private initMobileMenu(): void {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.nav-mobile');
    const menuLines = document.querySelectorAll('.menu-line');

    if (!menuBtn || !mobileNav) return;

    let isOpen = false;

    menuBtn.addEventListener('click', () => {
      isOpen = !isOpen;

      const { gsap } = window;

      if (isOpen) {
        // Open menu
        gsap.to(mobileNav, {
          maxHeight: '400px',
          duration: 0.3,
          ease: "power2.out"
        });

        // Animate menu lines to X
        gsap.to(menuLines[0], { rotation: 45, y: 5, duration: 0.2 });
        gsap.to(menuLines[1], { opacity: 0, duration: 0.2 });
        gsap.to(menuLines[2], { rotation: -45, y: -5, duration: 0.2 });

        // Animate menu items
        const menuItems = mobileNav.querySelectorAll('.nav-mobile-link, .social-link');
        gsap.fromTo(menuItems,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, delay: 0.1 }
        );
      } else {
        // Close menu
        gsap.to(mobileNav, {
          maxHeight: '0px',
          duration: 0.3,
          ease: "power2.out"
        });

        // Reset menu lines
        gsap.to(menuLines, { rotation: 0, y: 0, opacity: 1, duration: 0.2 });
      }
    });

    // Close menu when clicking on links
    document.querySelectorAll('.nav-mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) {
          menuBtn.dispatchEvent(new Event('click'));
        }
      });
    });
  }

  // ===== SCROLL PROGRESS =====
  private initScrollProgress(): void {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.pageYOffset / scrollHeight) * 100;

      progressBar.style.setProperty('--progress', `${Math.min(scrollProgress, 100)}%`);
    };

    // CSS for progress bar
    progressBar.style.setProperty('--progress', '0%');
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress::after {
        width: var(--progress);
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }

  // ===== MAGNETIC ELEMENTS =====
  private initMagneticElements(): void {
    this.magneticElements = Array.from(document.querySelectorAll('[data-magnetic="true"]'));

    if (this.magneticElements.length === 0) return;

    const { gsap } = window;

    this.magneticElements.forEach(element => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.2;
        const deltaY = (e.clientY - centerY) * 0.2;

        gsap.to(element, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)"
        });
      };

      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  // ===== PAGE TRANSITIONS =====
  private initPageTransitions(): void {
    const transitionOverlay = document.getElementById('page-transition');
    if (!transitionOverlay) return;

    // Simple page transition for navigation
    document.querySelectorAll('a[href^="/"], a[href^="#"]').forEach(link => {
      if (link.getAttribute('href')?.startsWith('#')) return; // Skip anchor links

      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');

        if (href && href !== window.location.pathname) {
          this.performPageTransition(href);
        }
      });
    });
  }

  private performPageTransition(href: string): void {
    const transitionOverlay = document.getElementById('page-transition');
    const wipeElement = document.querySelector('.transition-wipe');

    if (!transitionOverlay || !wipeElement) return;

    const { gsap } = window;

    // Show transition
    transitionOverlay.style.visibility = 'visible';
    transitionOverlay.style.opacity = '1';

    // Create wipe effect
    gsap.fromTo(wipeElement,
      { x: '-100%' },
      {
        x: '0%',
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          // Navigate to new page
          window.location.href = href;
        }
      }
    );
  }

  // ===== NEWSLETTER FORM =====
  private initNewsletterForm(): void {
    const form = document.querySelector('.newsletter-form');
    const input = document.querySelector('.newsletter-input') as HTMLInputElement;
    const button = document.querySelector('.newsletter-button');
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');

    if (!form || !input || !button || !successMessage || !errorMessage) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = input.value.trim();

      if (!email || !this.validateEmail(email)) {
        this.showMessage(errorMessage, 'Please enter a valid email address.');
        return;
      }

      // Simulate form submission
      button.textContent = 'Sending...';
      button.setAttribute('disabled', 'true');

      setTimeout(() => {
        this.showMessage(successMessage, 'Thank you! Your submission has been received!');
        input.value = '';
        button.textContent = '→';
        button.removeAttribute('disabled');
      }, 1000);
    });
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showMessage(element: Element, message: string): void {
    element.textContent = message;
    element.classList.add('show');

    setTimeout(() => {
      element.classList.remove('show');
    }, 3000);
  }

  // ===== PAGE LOAD ANIMATIONS =====
  private startPageLoadAnimations(): void {
    const { gsap } = window;

    // Header animation
    gsap.fromTo('.header',
      { y: -100 },
      { y: 0, duration: 0.6, ease: "power3.out" }
    );

    // Hero content animation
    const heroElements = [
      '.hero-subtitle',
      '.hero-title .title-line',
      '.hero-description',
      '.hero-cta'
    ];

    heroElements.forEach((selector, index) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        gsap.fromTo(elements,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: selector.includes('title-line') ? 0.2 : 0,
            delay: 0.5 + index * 0.1,
            ease: "power3.out"
          }
        );
      }
    });

    // Scroll indicator animation
    gsap.fromTo('.scroll-indicator',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1.5, ease: "power3.out" }
    );

    // Floating elements animation
    gsap.fromTo('.float-element',
      { opacity: 0, scale: 0 },
      {
        opacity: 0.1,
        scale: 1,
        duration: 1,
        stagger: 0.2,
        delay: 2,
        ease: "back.out(1.7)"
      }
    );
  }

  // ===== CONTACT PAGE =====
  private initContactPage(): void {
    this.initContactForm();
    this.initFAQ();
  }

  private initContactForm(): void {
    const form = document.getElementById('contactForm') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit') as HTMLButtonElement;
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      // Simulate form submission
      setTimeout(() => {
        submitBtn.innerHTML = '✓ Message Sent!';
        submitBtn.style.background = '#28a745';

        // Reset form after delay
        setTimeout(() => {
          form.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 2000);
      }, 1500);
    });
  }

  private initFAQ(): void {
    const faqItems = document.querySelectorAll('.faq-item');

    for (const item of faqItems) {
      const question = item.querySelector('.faq-question') as HTMLButtonElement;
      if (!question) continue;

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other FAQ items
        for (const otherItem of faqItems) {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        }

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  }

  // ===== MOUSE TRACKING =====
  private trackMouse(): void {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }
}

// ===== INITIALIZATION =====
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SonarMusicApp();
  });
} else {
  new SonarMusicApp();
}

// Add CSS for additional animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  .show {
    display: block !important;
    opacity: 1 !important;
  }

  .newsletter-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cursor-hover {
    transform: translate(-50%, -50%) scale(1.5) !important;
    background-color: #e3e2db !important;
    mix-blend-mode: normal !important;
  }

  .cursor-video {
    transform: translate(-50%, -50%) scale(2) !important;
    background-color: #e3e2db !important;
    filter: blur(3px) !important;
    mix-blend-mode: screen !important;
  }
`;
document.head.appendChild(additionalStyles);

export default SonarMusicApp;

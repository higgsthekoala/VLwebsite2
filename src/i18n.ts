/**
 * Internationalization (i18n) System
 * Handles multi-language support, content translation, and localized URLs
 */

interface Translation {
  [key: string]: string | Translation;
}

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  dateFormat: string;
  currency: string;
  enabled: boolean;
}

interface LocalizedContent {
  title: string;
  description: string;
  content?: string;
  meta?: {
    keywords: string[];
    og_title: string;
    og_description: string;
  };
}

class SonarI18n {
  private currentLanguage = 'en';
  private defaultLanguage = 'en';
  private translations: Map<string, Translation> = new Map();
  private languageConfigs: Map<string, LanguageConfig> = new Map();
  // private fallbackChain: string[] = ['en']; // Reserved for future use
  private isRTL = false;
  private initialized = false;

  constructor() {
    this.initializeLanguages();
    this.detectLanguage();
    this.loadTranslations();
  }

  /**
   * Initialize supported languages
   */
  private initializeLanguages(): void {
    const languages: LanguageConfig[] = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        flag: '🇺🇸',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        enabled: true
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        direction: 'ltr',
        flag: '🇪🇸',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR',
        enabled: true
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        direction: 'ltr',
        flag: '🇫🇷',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR',
        enabled: true
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        direction: 'ltr',
        flag: '🇩🇪',
        dateFormat: 'DD.MM.YYYY',
        currency: 'EUR',
        enabled: true
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        direction: 'ltr',
        flag: '🇯🇵',
        dateFormat: 'YYYY/MM/DD',
        currency: 'JPY',
        enabled: true
      },
      {
        code: 'zh',
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        direction: 'ltr',
        flag: '🇨🇳',
        dateFormat: 'YYYY/MM/DD',
        currency: 'CNY',
        enabled: true
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        flag: '🇸🇦',
        dateFormat: 'DD/MM/YYYY',
        currency: 'SAR',
        enabled: false // Can be enabled when RTL support is added
      }
    ];

    languages.forEach(lang => {
      this.languageConfigs.set(lang.code, lang);
    });
  }

  /**
   * Detect user's preferred language
   */
  private detectLanguage(): void {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && this.isLanguageSupported(urlLang)) {
      this.currentLanguage = urlLang;
      return;
    }

    // Check URL path
    const pathLang = this.extractLanguageFromPath();
    if (pathLang && this.isLanguageSupported(pathLang)) {
      this.currentLanguage = pathLang;
      return;
    }

    // Check localStorage
    const storedLang = localStorage.getItem('sonar_language');
    if (storedLang && this.isLanguageSupported(storedLang)) {
      this.currentLanguage = storedLang;
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.isLanguageSupported(browserLang)) {
      this.currentLanguage = browserLang;
      return;
    }

    // Check navigator.languages
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0];
      if (this.isLanguageSupported(langCode)) {
        this.currentLanguage = langCode;
        return;
      }
    }

    // Default to English
    this.currentLanguage = this.defaultLanguage;
  }

  /**
   * Extract language from URL path
   */
  private extractLanguageFromPath(): string | null {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const potentialLang = pathSegments[0];
      if (potentialLang.length === 2 && this.isLanguageSupported(potentialLang)) {
        return potentialLang;
      }
    }
    return null;
  }

  /**
   * Load translations for current language
   */
  private async loadTranslations(): Promise<void> {
    try {
      // Load main translations
      await this.loadLanguageTranslations(this.currentLanguage);

      // Load fallback translations if current language is not default
      if (this.currentLanguage !== this.defaultLanguage) {
        await this.loadLanguageTranslations(this.defaultLanguage);
      }

      this.updatePageDirection();
      this.initialized = true;

      // Trigger language change event
      this.dispatchLanguageChangeEvent();
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to default language
      if (this.currentLanguage !== this.defaultLanguage) {
        this.currentLanguage = this.defaultLanguage;
        await this.loadTranslations();
      }
    }
  }

  /**
   * Load translations for a specific language
   */
  private async loadLanguageTranslations(language: string): Promise<void> {
    try {
      const response = await fetch(`/src/data/i18n/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${language} translations`);
      }

      const translations = await response.json();
      this.translations.set(language, translations);
    } catch (error) {
      console.warn(`Could not load translations for ${language}:`, error);

      // Use inline translations as fallback
      this.translations.set(language, this.getInlineTranslations(language));
    }
  }

  /**
   * Get inline translations (fallback when files are not available)
   */
  private getInlineTranslations(language: string): Translation {
    const translations: Record<string, Translation> = {
      en: {
        nav: {
          home: 'Home',
          work: 'Work',
          studio: 'Studio',
          team: 'Team',
          blog: 'Blog',
          contact: 'Contact'
        },
        hero: {
          title: 'Crafting Exceptional Sound Experiences',
          subtitle: 'Premium Sound Design',
          description: 'We create immersive audio experiences for film, television, and new media.',
          cta: 'Explore Our Work'
        },
        common: {
          loading: 'Loading...',
          read_more: 'Read More',
          learn_more: 'Learn More',
          contact_us: 'Contact Us',
          get_started: 'Get Started',
          view_project: 'View Project',
          play_video: 'Play Video',
          close: 'Close',
          next: 'Next',
          previous: 'Previous',
          search: 'Search',
          filter: 'Filter',
          sort: 'Sort',
          all: 'All'
        },
        footer: {
          description: 'Crafting exceptional sound experiences for film, television, and new media.',
          navigation: 'Navigation',
          services: 'Services',
          connect: 'Connect',
          copyright: '© 2024 Sonar Music. All rights reserved.',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service'
        }
      },
      es: {
        nav: {
          home: 'Inicio',
          work: 'Trabajo',
          studio: 'Estudio',
          team: 'Equipo',
          blog: 'Blog',
          contact: 'Contacto'
        },
        hero: {
          title: 'Creando Experiencias Sonoras Excepcionales',
          subtitle: 'Diseño de Sonido Premium',
          description: 'Creamos experiencias de audio inmersivas para cine, televisión y nuevos medios.',
          cta: 'Explora Nuestro Trabajo'
        },
        common: {
          loading: 'Cargando...',
          read_more: 'Leer Más',
          learn_more: 'Aprende Más',
          contact_us: 'Contáctanos',
          get_started: 'Comenzar',
          view_project: 'Ver Proyecto',
          play_video: 'Reproducir Video',
          close: 'Cerrar',
          next: 'Siguiente',
          previous: 'Anterior',
          search: 'Buscar',
          filter: 'Filtrar',
          sort: 'Ordenar',
          all: 'Todos'
        },
        footer: {
          description: 'Creando experiencias sonoras excepcionales para cine, televisión y nuevos medios.',
          navigation: 'Navegación',
          services: 'Servicios',
          connect: 'Conectar',
          copyright: '© 2024 Sonar Music. Todos los derechos reservados.',
          privacy: 'Política de Privacidad',
          terms: 'Términos de Servicio'
        }
      },
      fr: {
        nav: {
          home: 'Accueil',
          work: 'Travail',
          studio: 'Studio',
          team: 'Équipe',
          blog: 'Blog',
          contact: 'Contact'
        },
        hero: {
          title: 'Créer des Expériences Sonores Exceptionnelles',
          subtitle: 'Design Sonore Premium',
          description: 'Nous créons des expériences audio immersives pour le cinéma, la télévision et les nouveaux médias.',
          cta: 'Explorez Notre Travail'
        },
        common: {
          loading: 'Chargement...',
          read_more: 'Lire Plus',
          learn_more: 'En Savoir Plus',
          contact_us: 'Contactez-nous',
          get_started: 'Commencer',
          view_project: 'Voir le Projet',
          play_video: 'Lire la Vidéo',
          close: 'Fermer',
          next: 'Suivant',
          previous: 'Précédent',
          search: 'Rechercher',
          filter: 'Filtrer',
          sort: 'Trier',
          all: 'Tous'
        },
        footer: {
          description: 'Créer des expériences sonores exceptionnelles pour le cinéma, la télévision et les nouveaux médias.',
          navigation: 'Navigation',
          services: 'Services',
          connect: 'Se Connecter',
          copyright: '© 2024 Sonar Music. Tous droits réservés.',
          privacy: 'Politique de Confidentialité',
          terms: 'Conditions de Service'
        }
      }
    };

    return translations[language] || translations.en;
  }

  /**
   * Get translated text
   */
  t(key: string, interpolations?: Record<string, string>): string {
    let translation = this.getTranslation(key, this.currentLanguage);

    // Fallback to default language
    if (!translation && this.currentLanguage !== this.defaultLanguage) {
      translation = this.getTranslation(key, this.defaultLanguage);
    }

    // Final fallback to key itself
    if (!translation) {
      translation = key;
    }

    // Apply interpolations
    if (interpolations && typeof translation === 'string') {
      Object.keys(interpolations).forEach(placeholder => {
        translation = (translation as string).replace(
          new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'),
          interpolations[placeholder]
        );
      });
    }

    return translation as string;
  }

  /**
   * Get translation for a specific key
   */
  private getTranslation(key: string, language: string): string | null {
    const translations = this.translations.get(language);
    if (!translations) return null;

    const keys = key.split('.');
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * Change language
   */
  async changeLanguage(language: string): Promise<void> {
    if (!this.isLanguageSupported(language) || language === this.currentLanguage) {
      return;
    }

    const previousLanguage = this.currentLanguage;
    this.currentLanguage = language;

    try {
      await this.loadLanguageTranslations(language);

      // Update URL
      this.updateURL();

      // Update page direction
      this.updatePageDirection();

      // Store preference
      localStorage.setItem('sonar_language', language);

      // Update page content
      this.updatePageContent();

      // Dispatch language change event
      this.dispatchLanguageChangeEvent();

    } catch (error) {
      console.error('Failed to change language:', error);
      this.currentLanguage = previousLanguage;
    }
  }

  /**
   * Update URL to include language
   */
  private updateURL(): void {
    const currentPath = window.location.pathname;
    const currentLangInPath = this.extractLanguageFromPath();

    let newPath = currentPath;

    if (currentLangInPath) {
      // Replace existing language in path
      newPath = currentPath.replace(`/${currentLangInPath}`, `/${this.currentLanguage}`);
    } else if (this.currentLanguage !== this.defaultLanguage) {
      // Add language to path
      newPath = `/${this.currentLanguage}${currentPath}`;
    }

    if (newPath !== currentPath) {
      window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
    }
  }

  /**
   * Update page direction for RTL languages
   */
  private updatePageDirection(): void {
    const config = this.languageConfigs.get(this.currentLanguage);
    if (config) {
      this.isRTL = config.direction === 'rtl';
      document.documentElement.dir = config.direction;
      document.documentElement.lang = this.currentLanguage;

      // Add/remove RTL class
      document.body.classList.toggle('rtl', this.isRTL);
      document.body.classList.toggle('ltr', !this.isRTL);
    }
  }

  /**
   * Update page content with translations
   */
  private updatePageContent(): void {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translation = this.t(key);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          (element as HTMLInputElement).placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      if (key) {
        const translation = this.t(key);
        element.innerHTML = translation;
      }
    });

    // Update document title
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
      document.title = this.t(titleKey);
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionKey = metaDescription?.getAttribute('data-i18n');
    if (descriptionKey && metaDescription) {
      metaDescription.setAttribute('content', this.t(descriptionKey));
    }
  }

  /**
   * Dispatch language change event
   */
  private dispatchLanguageChangeEvent(): void {
    const event = new CustomEvent('languageChanged', {
      detail: {
        language: this.currentLanguage,
        config: this.languageConfigs.get(this.currentLanguage),
        isRTL: this.isRTL
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(language: string): boolean {
    const config = this.languageConfigs.get(language);
    return config ? config.enabled : false;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get current language config
   */
  getCurrentLanguageConfig(): LanguageConfig | undefined {
    return this.languageConfigs.get(this.currentLanguage);
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Array.from(this.languageConfigs.values()).filter(lang => lang.enabled);
  }

  /**
   * Format date according to current language
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const config = this.getCurrentLanguageConfig();

    if (!config) return dateObj.toLocaleDateString();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return dateObj.toLocaleDateString(this.currentLanguage, options);
  }

  /**
   * Format currency according to current language
   */
  formatCurrency(amount: number): string {
    const config = this.getCurrentLanguageConfig();
    if (!config) return amount.toString();

    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency: config.currency
    }).format(amount);
  }

  /**
   * Format number according to current language
   */
  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(number);
  }

  /**
   * Get relative time string
   */
  getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const timeUnits = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 }
    ];

    for (const { unit, seconds } of timeUnits) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' })
          .format(-interval, unit as Intl.RelativeTimeFormatUnit);
      }
    }

    return this.t('common.just_now') || 'just now';
  }

  /**
   * Create language switcher HTML
   */
  createLanguageSwitcher(): string {
    const languages = this.getSupportedLanguages();
    const currentConfig = this.getCurrentLanguageConfig();

    let html = '<div class="language-switcher">';
    html += `<button class="language-switcher-current" data-cursor="hover">`;
    html += `<span class="flag">${currentConfig?.flag || '🌍'}</span>`;
    html += `<span class="name">${currentConfig?.nativeName || 'Language'}</span>`;
    html += `<span class="arrow">▼</span>`;
    html += `</button>`;
    html += `<div class="language-switcher-dropdown">`;

    languages.forEach(lang => {
      const isActive = lang.code === this.currentLanguage;
      html += `<button class="language-option ${isActive ? 'active' : ''}" `;
      html += `data-language="${lang.code}" data-cursor="hover">`;
      html += `<span class="flag">${lang.flag}</span>`;
      html += `<span class="name">${lang.nativeName}</span>`;
      if (isActive) html += `<span class="check">✓</span>`;
      html += `</button>`;
    });

    html += `</div></div>`;
    return html;
  }

  /**
   * Initialize language switcher functionality
   */
  initializeLanguageSwitcher(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Toggle dropdown
      if (target.closest('.language-switcher-current')) {
        const switcher = target.closest('.language-switcher');
        switcher?.classList.toggle('open');
        return;
      }

      // Language selection
      const languageOption = target.closest('.language-option') as HTMLElement;
      if (languageOption) {
        const language = languageOption.getAttribute('data-language');
        if (language) {
          this.changeLanguage(language);
          // Close dropdown
          document.querySelector('.language-switcher')?.classList.remove('open');
        }
        return;
      }

      // Close dropdown when clicking outside
      if (!target.closest('.language-switcher')) {
        document.querySelector('.language-switcher')?.classList.remove('open');
      }
    });
  }

  /**
   * Get localized URL
   */
  getLocalizedURL(path: string, language?: string): string {
    const lang = language || this.currentLanguage;
    if (lang === this.defaultLanguage) {
      return path;
    }
    return `/${lang}${path}`;
  }

  /**
   * Initialize i18n system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.loadTranslations();
    this.updatePageContent();
    this.initializeLanguageSwitcher();

    console.log(`[i18n] Initialized with language: ${this.currentLanguage}`);
  }
}

// Create global i18n instance
const i18n = new SonarI18n();

// Export for use in other modules
export default i18n;
export { SonarI18n };
export type { Translation, LanguageConfig, LocalizedContent };

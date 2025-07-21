/**
 * Content Management System (CMS) Utility
 * Handles dynamic loading and management of projects, team members, and blog posts
 */

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  duration: string;
  client: string;
  featured: boolean;
  thumbnail: string;
  video_url: string;
  description: string;
  tags: string[];
  services: string[];
  team: string[];
  awards: string[];
  brief: string;
  approach: string;
  technical_notes: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  level: string;
  bio: string;
  long_bio: string;
  image: string;
  email: string;
  phone: string;
  location: string;
  joined_date: string;
  specialties: string[];
  awards: Array<{
    year: string;
    title: string;
    project: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  notable_projects: string[];
  skills: Record<string, number>;
  social_media: Record<string, string>;
  languages: string[];
  available_for_projects: boolean;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  featured_image: string;
  featured_image_alt: string;
  tags: string[];
  read_time: number;
  published_date: string;
  updated_date: string;
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
  comments_count: number;
  seo: {
    meta_title: string;
    meta_description: string;
    og_image: string;
    keywords: string[];
  };
  related_posts: string[];
}

class SonarCMS {
  // Data storage - removed as they're not used in current implementation
  private cache: Map<string, any> = new Map();

  constructor() {
    this.initializeCache();
  }

  /**
   * Initialize cache with empty data
   */
  private initializeCache(): void {
    this.cache.set('projects', null);
    this.cache.set('team', null);
    this.cache.set('blog', null);
  }

  /**
   * Load projects data
   */
  async loadProjects(): Promise<any> {
    if (this.cache.get('projects')) {
      return this.cache.get('projects');
    }

    try {
      const response = await fetch('/src/data/projects.json');
      if (!response.ok) throw new Error('Failed to load projects data');

      const data = await response.json();
      this.cache.set('projects', data);
      return data;
    } catch (error) {
      console.error('Error loading projects:', error);
      return { projects: [], categories: [], services: [], filters: {} };
    }
  }

  /**
   * Load team data
   */
  async loadTeam(): Promise<any> {
    if (this.cache.get('team')) {
      return this.cache.get('team');
    }

    try {
      const response = await fetch('/src/data/team.json');
      if (!response.ok) throw new Error('Failed to load team data');

      const data = await response.json();
      this.cache.set('team', data);
      return data;
    } catch (error) {
      console.error('Error loading team:', error);
      return { team_members: [], departments: [], levels: [], specialties: [] };
    }
  }

  /**
   * Load blog data
   */
  async loadBlog(): Promise<any> {
    if (this.cache.get('blog')) {
      return this.cache.get('blog');
    }

    try {
      const response = await fetch('/src/data/blog.json');
      if (!response.ok) throw new Error('Failed to load blog data');

      const data = await response.json();
      this.cache.set('blog', data);
      return data;
    } catch (error) {
      console.error('Error loading blog:', error);
      return { blog_posts: [], categories: [], tags: [], authors: [], meta: {} };
    }
  }

  /**
   * Get all projects with optional filtering
   */
  async getProjects(filters: {
    category?: string;
    year?: string;
    featured?: boolean;
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Project[]> {
    const data = await this.loadProjects();
    let projects = data.projects || [];

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      projects = projects.filter((p: Project) => p.category === filters.category);
    }

    if (filters.year) {
      projects = projects.filter((p: Project) => p.year === filters.year);
    }

    if (filters.featured !== undefined) {
      projects = projects.filter((p: Project) => p.featured === filters.featured);
    }

    if (filters.published !== undefined) {
      projects = projects.filter((p: Project) => p.published === filters.published);
    }

    // Sort by creation date (newest first)
    projects.sort((a: Project, b: Project) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply pagination
    if (filters.offset) {
      projects = projects.slice(filters.offset);
    }

    if (filters.limit) {
      projects = projects.slice(0, filters.limit);
    }

    return projects;
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    const data = await this.loadProjects();
    const project = data.projects?.find((p: Project) => p.id === id);
    return project || null;
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects(limit = 3): Promise<Project[]> {
    return this.getProjects({ featured: true, published: true, limit });
  }

  /**
   * Get all team members with optional filtering
   */
  async getTeamMembers(filters: {
    department?: string;
    level?: string;
    featured?: boolean;
    published?: boolean;
    available?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<TeamMember[]> {
    const data = await this.loadTeam();
    let members = data.team_members || [];

    // Apply filters
    if (filters.department) {
      members = members.filter((m: TeamMember) => m.department === filters.department);
    }

    if (filters.level) {
      members = members.filter((m: TeamMember) => m.level === filters.level);
    }

    if (filters.featured !== undefined) {
      members = members.filter((m: TeamMember) => m.featured === filters.featured);
    }

    if (filters.published !== undefined) {
      members = members.filter((m: TeamMember) => m.published === filters.published);
    }

    if (filters.available !== undefined) {
      members = members.filter((m: TeamMember) => m.available_for_projects === filters.available);
    }

    // Sort by join date (newest first)
    members.sort((a: TeamMember, b: TeamMember) =>
      new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime()
    );

    // Apply pagination
    if (filters.offset) {
      members = members.slice(filters.offset);
    }

    if (filters.limit) {
      members = members.slice(0, filters.limit);
    }

    return members;
  }

  /**
   * Get a single team member by ID
   */
  async getTeamMember(id: string): Promise<TeamMember | null> {
    const data = await this.loadTeam();
    const member = data.team_members?.find((m: TeamMember) => m.id === id);
    return member || null;
  }

  /**
   * Get featured team members
   */
  async getFeaturedTeamMembers(limit = 3): Promise<TeamMember[]> {
    return this.getTeamMembers({ featured: true, published: true, limit });
  }

  /**
   * Get all blog posts with optional filtering
   */
  async getBlogPosts(filters: {
    category?: string;
    author?: string;
    tag?: string;
    featured?: boolean;
    published?: boolean;
    search?: string;
    sort?: 'newest' | 'oldest' | 'popular' | 'title';
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const data = await this.loadBlog();
    let posts = data.blog_posts || [];

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      posts = posts.filter((p: BlogPost) => p.category === filters.category);
    }

    if (filters.author) {
      posts = posts.filter((p: BlogPost) => p.author.id === filters.author);
    }

    if (filters.tag) {
      posts = posts.filter((p: BlogPost) => p.tags.includes(filters.tag!));
    }

    if (filters.featured !== undefined) {
      posts = posts.filter((p: BlogPost) => p.featured === filters.featured);
    }

    if (filters.published !== undefined) {
      posts = posts.filter((p: BlogPost) => p.published === filters.published);
    }

    // Search functionality
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      posts = posts.filter((p: BlogPost) =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.excerpt.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    switch (filters.sort) {
      case 'oldest':
        posts.sort((a: BlogPost, b: BlogPost) =>
          new Date(a.published_date).getTime() - new Date(b.published_date).getTime()
        );
        break;
      case 'popular':
        posts.sort((a: BlogPost, b: BlogPost) => (b.views + b.likes) - (a.views + a.likes));
        break;
      case 'title':
        posts.sort((a: BlogPost, b: BlogPost) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        posts.sort((a: BlogPost, b: BlogPost) =>
          new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
        );
        break;
    }

    // Apply pagination
    if (filters.offset) {
      posts = posts.slice(filters.offset);
    }

    if (filters.limit) {
      posts = posts.slice(0, filters.limit);
    }

    return posts;
  }

  /**
   * Get a single blog post by ID or slug
   */
  async getBlogPost(identifier: string): Promise<BlogPost | null> {
    const data = await this.loadBlog();
    const post = data.blog_posts?.find((p: BlogPost) =>
      p.id === identifier || p.slug === identifier
    );
    return post || null;
  }

  /**
   * Get featured blog post
   */
  async getFeaturedBlogPost(): Promise<BlogPost | null> {
    const posts = await this.getBlogPosts({ featured: true, published: true, limit: 1 });
    return posts[0] || null;
  }

  /**
   * Get related blog posts
   */
  async getRelatedBlogPosts(postId: string, limit = 3): Promise<BlogPost[]> {
    const currentPost = await this.getBlogPost(postId);
    if (!currentPost) return [];

    const allPosts = await this.getBlogPosts({ published: true });

    // Filter out current post and find related posts based on category and tags
    const relatedPosts = allPosts
      .filter(p => p.id !== postId)
      .map(post => ({
        post,
        score: this.calculateRelatedScore(currentPost, post)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);

    return relatedPosts;
  }

  /**
   * Calculate relatedness score between two blog posts
   */
  private calculateRelatedScore(post1: BlogPost, post2: BlogPost): number {
    let score = 0;

    // Same category gets higher score
    if (post1.category === post2.category) {
      score += 3;
    }

    // Shared tags
    const sharedTags = post1.tags.filter(tag => post2.tags.includes(tag));
    score += sharedTags.length * 2;

    // Same author
    if (post1.author.id === post2.author.id) {
      score += 1;
    }

    return score;
  }

  /**
   * Get project categories
   */
  async getProjectCategories(): Promise<any[]> {
    const data = await this.loadProjects();
    return data.categories || [];
  }

  /**
   * Get team departments
   */
  async getTeamDepartments(): Promise<any[]> {
    const data = await this.loadTeam();
    return data.departments || [];
  }

  /**
   * Get blog categories
   */
  async getBlogCategories(): Promise<any[]> {
    const data = await this.loadBlog();
    return data.categories || [];
  }

  /**
   * Get all blog tags
   */
  async getBlogTags(): Promise<string[]> {
    const data = await this.loadBlog();
    return data.tags || [];
  }

  /**
   * Get blog authors
   */
  async getBlogAuthors(): Promise<any[]> {
    const data = await this.loadBlog();
    return data.authors || [];
  }

  /**
   * Search across all content types
   */
  async search(query: string, types: ('projects' | 'team' | 'blog')[] = ['projects', 'team', 'blog']): Promise<{
    projects: Project[];
    team: TeamMember[];
    blog: BlogPost[];
  }> {
    const results = {
      projects: [] as Project[],
      team: [] as TeamMember[],
      blog: [] as BlogPost[]
    };

    const searchTerm = query.toLowerCase();

    if (types.includes('projects')) {
      const projects = await this.getProjects({ published: true });
      results.projects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (types.includes('team')) {
      const team = await this.getTeamMembers({ published: true });
      results.team = team.filter(m =>
        m.name.toLowerCase().includes(searchTerm) ||
        m.role.toLowerCase().includes(searchTerm) ||
        m.bio.toLowerCase().includes(searchTerm) ||
        m.specialties.some(s => s.toLowerCase().includes(searchTerm))
      );
    }

    if (types.includes('blog')) {
      results.blog = await this.getBlogPosts({
        search: searchTerm,
        published: true
      });
    }

    return results;
  }

  /**
   * Get content statistics
   */
  async getStats(): Promise<{
    projects: { total: number; featured: number; categories: number };
    team: { total: number; featured: number; departments: number };
    blog: { total: number; featured: number; categories: number; total_views: number };
  }> {
    const [projectsData, teamData, blogData] = await Promise.all([
      this.loadProjects(),
      this.loadTeam(),
      this.loadBlog()
    ]);

    return {
      projects: {
        total: projectsData.projects?.length || 0,
        featured: projectsData.projects?.filter((p: Project) => p.featured).length || 0,
        categories: projectsData.categories?.length || 0
      },
      team: {
        total: teamData.team_members?.length || 0,
        featured: teamData.team_members?.filter((m: TeamMember) => m.featured).length || 0,
        departments: teamData.departments?.length || 0
      },
      blog: {
        total: blogData.blog_posts?.length || 0,
        featured: blogData.blog_posts?.filter((p: BlogPost) => p.featured).length || 0,
        categories: blogData.categories?.length || 0,
        total_views: blogData.meta?.total_views || 0
      }
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.initializeCache();
  }

  /**
   * Preload all data
   */
  async preloadAll(): Promise<void> {
    try {
      await Promise.all([
        this.loadProjects(),
        this.loadTeam(),
        this.loadBlog()
      ]);
    } catch (error) {
      console.error('Error preloading CMS data:', error);
    }
  }
}

// Create global CMS instance
const cms = new SonarCMS();

// Export for use in other modules
export default cms;
export { SonarCMS };
export type { Project, TeamMember, BlogPost };

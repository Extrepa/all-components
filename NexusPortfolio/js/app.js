/**
 * Main Application Controller for Nexus Portfolio
 * Handles navigation, routing, and project display
 */
class NexusApp {
  constructor() {
    this.loader = new NexusProjectLoader();
    this.currentViewer = null;
    this.currentCategory = 'all';
    
    this.init();
  }
  
  async init() {
    // Load project data
    await this.loader.load();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup routing
    this.setupRouting();
    
    // Initial render
    this.renderGallery();
  }
  
  setupEventListeners() {
    // Category navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.filterByCategory(category);
      });
    });
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
      this.showGallery();
    });
    
    // Search input
    document.getElementById('search').addEventListener('input', (e) => {
      this.searchProjects(e.target.value);
    });
  }
  
  setupRouting() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
    
    // Handle initial route
    this.handleRoute();
  }
  
  handleRoute() {
    const hash = window.location.hash.substring(1);
    
    if (hash) {
      const project = this.loader.getProject(hash);
      if (project) {
        this.showProject(project);
      } else {
        this.showGallery();
      }
    } else {
      this.showGallery();
    }
  }
  
  renderGallery() {
    const projects = this.getFilteredProjects();
    const grid = document.getElementById('project-grid');
    const title = document.getElementById('gallery-title');
    const count = document.getElementById('gallery-count');
    
    // Update title and count
    const categoryNames = {
      all: 'All Projects',
      fractal: 'Fractal Visualizations',
      simulation: 'Simulations',
      visual: 'Visual Effects',
      animation: 'Animations'
    };
    
    title.textContent = categoryNames[this.currentCategory] || 'All Projects';
    count.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    
    // Clear grid
    grid.innerHTML = '';
    
    // Render project cards
    projects.forEach(project => {
      const card = this.createProjectCard(project);
      grid.appendChild(card);
    });
  }
  
  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.addEventListener('click', () => {
      window.location.hash = project.id;
    });
    
    const badgeClass = `badge-${project.type}`;
    const badgeText = project.tech.toUpperCase();
    
    card.innerHTML = `
      <div class="project-card-header">
        <h3 class="project-card-title">${this.escapeHtml(project.title)}</h3>
        <span class="project-badge ${badgeClass}">${badgeText}</span>
      </div>
      <p class="project-card-description">
        ${this.escapeHtml(project.description)}
      </p>
      <div class="project-card-footer">
        <span>${project.type}</span>
      </div>
    `;
    
    return card;
  }
  
  getFilteredProjects() {
    return this.loader.getProjectsByCategory(this.currentCategory);
  }
  
  filterByCategory(category) {
    this.currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      }
    });
    
    // Clear search
    document.getElementById('search').value = '';
    
    // Render gallery
    this.renderGallery();
  }
  
  searchProjects(query) {
    if (!query.trim()) {
      this.renderGallery();
      return;
    }
    
    const results = this.loader.searchProjects(query);
    const grid = document.getElementById('project-grid');
    const title = document.getElementById('gallery-title');
    const count = document.getElementById('gallery-count');
    
    title.textContent = 'Search Results';
    count.textContent = `${results.length} project${results.length !== 1 ? 's' : ''}`;
    
    grid.innerHTML = '';
    results.forEach(project => {
      const card = this.createProjectCard(project);
      grid.appendChild(card);
    });
  }
  
  showGallery() {
    window.location.hash = '';
    
    document.getElementById('gallery').classList.remove('hidden');
    document.getElementById('project-viewer').classList.add('hidden');
    
    if (this.currentViewer) {
      this.currentViewer.destroy();
      this.currentViewer = null;
    }
  }
  
  async showProject(project) {
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Hide gallery, show viewer
    document.getElementById('gallery').classList.add('hidden');
    document.getElementById('project-viewer').classList.remove('hidden');
    
    // Clean up previous viewer
    if (this.currentViewer) {
      this.currentViewer.destroy();
      this.currentViewer = null;
    }
    
    // Update project info
    document.getElementById('viewer-title').textContent = project.title;
    document.getElementById('info-description').textContent = project.description;
    document.getElementById('info-type').textContent = project.type.toUpperCase();
    document.getElementById('info-tech').textContent = project.tech;
    
    // Clear container
    const container = document.getElementById('project-container');
    container.innerHTML = '';
    
    // Load project
    this.currentViewer = new NexusProjectViewer(container, project);
    await this.currentViewer.load();
    
    // Hide loading
    document.getElementById('loading').classList.add('hidden');
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NexusApp();
  });
} else {
  new NexusApp();
}

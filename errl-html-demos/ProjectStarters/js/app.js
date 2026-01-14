/**
 * Main Application Controller
 * Handles navigation, routing, and project display
 */
class App {
  constructor() {
    this.loader = new ProjectLoader();
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
      glsl: 'GLSL Shaders',
      overheadProjector: 'Overhead Projector Series',
      oilWater: 'Oil & Water Series'
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
      window.location.hash = project.outputId;
    });
    
    const badgeClass = project.mode === 'glsl' ? 'badge-glsl' : 'badge-p5';
    const badgeText = project.mode.toUpperCase();
    
    const timeSeconds = (project.totalTime / 1000).toFixed(1);
    
    card.innerHTML = `
      <div class="project-card-header">
        <h3 class="project-card-title">${this.escapeHtml(project.prompt)}</h3>
        <span class="project-badge ${badgeClass}">${badgeText}</span>
      </div>
      <p class="project-card-description">
        ${this.escapeHtml(project.prompt)}
      </p>
      <div class="project-card-footer">
        <span>${project.model}</span>
        <span>${timeSeconds}s</span>
      </div>
    `;
    
    return card;
  }
  
  getFilteredProjects() {
    if (this.currentCategory === 'all') {
      return this.loader.getAllProjects();
    }
    
    return this.loader.getProjectsByCategory(this.currentCategory).map(item => {
      return this.loader.getProject(item.outputId);
    }).filter(p => p);
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
    
    // Clean up P5 instance
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    
    // Update project info
    document.getElementById('viewer-title').textContent = project.prompt;
    document.getElementById('info-prompt').textContent = project.prompt;
    document.getElementById('info-mode').textContent = project.mode.toUpperCase();
    document.getElementById('info-model').textContent = project.model;
    document.getElementById('info-time').textContent = `${(project.totalTime / 1000).toFixed(1)}s`;
    
    // Clear container
    const container = document.getElementById('project-container');
    container.innerHTML = '';
    
    // Load project based on mode
    if (project.mode === 'glsl') {
      await this.loadGLSLProject(project, container);
    } else if (project.mode === 'p5') {
      await this.loadP5Project(project, container);
    }
    
    // Hide loading
    document.getElementById('loading').classList.add('hidden');
  }
  
  loadGLSLProject(project, container) {
    return new Promise((resolve) => {
      // Wait for Three.js to be available
      if (typeof THREE === 'undefined') {
        setTimeout(() => this.loadGLSLProject(project, container).then(resolve), 100);
        return;
      }
      
      try {
        this.currentViewer = new GLSLViewer(container, project.srcCode);
        resolve();
      } catch (error) {
        console.error('Error loading GLSL project:', error);
        container.innerHTML = `<div style="padding: 2rem; color: #ff6b6b;">Error loading shader: ${error.message}</div>`;
        resolve();
      }
    });
  }
  
  loadP5Project(project, container) {
    return new Promise((resolve) => {
      // Clean up previous instance
      if (this.p5Instance) {
        try {
          this.p5Instance.remove();
        } catch (e) {
          console.warn('Error removing previous p5 instance:', e);
        }
        this.p5Instance = null;
      }
      
      try {
        // Find the standalone HTML file for this project
        // Project slug is based on outputId
        const slug = project.slug || `project-${project.outputId.substring(0, 8)}`;
        
        // Determine category to find the right path
        let categoryPath = 'p5';
        if (this.loader.categories.overheadProjector.find(p => p.outputId === project.outputId)) {
          // It's in overhead projector category
        } else if (this.loader.categories.oilWater.find(p => p.outputId === project.outputId)) {
          // It's in oil water category
        }
        
        // Use iframe to load the standalone HTML file
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.background = '#0a0a0a';
        
        // Build path to standalone HTML file
        // We need to find which file corresponds to this project
        // For now, let's use inline approach that works better
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Write inline HTML with the code
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { margin: 0; padding: 0; background: #0a0a0a; overflow: hidden; }
            </style>
          </head>
          <body>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
            <script>
              ${project.srcCode}
            </script>
          </body>
          </html>
        `);
        iframeDoc.close();
        
        container.innerHTML = '';
        container.appendChild(iframe);
        
        // Store reference for cleanup
        this.p5Instance = { remove: () => { container.innerHTML = ''; } };
        
        // Resize iframe when content loads
        iframe.onload = () => {
          try {
            const canvas = iframeDoc.querySelector('canvas');
            if (canvas) {
              iframe.style.height = Math.max(canvas.height, 600) + 'px';
            }
          } catch (e) {
            // Cross-origin issues, use default height
          }
          resolve();
        };
        
        // Resolve immediately if onload doesn't fire quickly
        setTimeout(resolve, 100);
        
      } catch (error) {
        console.error('Error loading P5.js project:', error);
        container.innerHTML = `<div style="padding: 2rem; color: #ff6b6b;">Error loading sketch: ${error.message}<br><small>Check console for details</small></div>`;
        resolve();
      }
    });
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
    new App();
  });
} else {
  new App();
}

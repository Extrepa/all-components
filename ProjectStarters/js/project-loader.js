/**
 * Project Loader
 * Loads and manages project data from projects.json
 */
class ProjectLoader {
  constructor() {
    this.projects = [];
    this.projectsByOutputId = {};
    this.categories = {
      glsl: [],
      overheadProjector: [],
      oilWater: []
    };
  }
  
  async load() {
    try {
      const response = await fetch('data/projects.json');
      const data = await response.json();
      
      this.projects = data.projects || [];
      this.categories = data.categories || {};
      
      // Index projects by outputId for quick lookup
      this.projects.forEach(project => {
        this.projectsByOutputId[project.outputId] = project;
      });
      
      return data;
    } catch (error) {
      console.error('Error loading projects:', error);
      return null;
    }
  }
  
  getProject(outputId) {
    return this.projectsByOutputId[outputId];
  }
  
  getProjectsByMode(mode) {
    return this.projects.filter(p => p.mode === mode);
  }
  
  getProjectsByCategory(category) {
    return this.categories[category] || [];
  }
  
  getAllProjects() {
    return this.projects;
  }
  
  searchProjects(query) {
    const lowerQuery = query.toLowerCase();
    return this.projects.filter(project => 
      project.prompt.toLowerCase().includes(lowerQuery) ||
      project.slug.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.ProjectLoader = ProjectLoader;
}

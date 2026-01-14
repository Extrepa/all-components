/**
 * Project Loader for VJ Portfolio
 * Loads and manages project data from projects.json
 */
class VJProjectLoader {
  constructor() {
    this.projects = [];
    this.projectsById = {};
    this.categories = {
      all: [],
      mixer: []
    };
  }
  
  async load() {
    try {
      const response = await fetch('data/projects.json');
      const data = await response.json();
      
      this.projects = data.projects || [];
      this.categories = data.categories || {};
      
      // Index projects by id for quick lookup
      this.projects.forEach(project => {
        this.projectsById[project.id] = project;
      });
      
      return data;
    } catch (error) {
      console.error('Error loading projects:', error);
      return null;
    }
  }
  
  getProject(id) {
    return this.projectsById[id];
  }
  
  getProjectsByCategory(category) {
    if (category === 'all') {
      return this.projects;
    }
    const categoryIds = this.categories[category] || [];
    return categoryIds.map(id => this.projectsById[id]).filter(p => p);
  }
  
  getAllProjects() {
    return this.projects;
  }
  
  searchProjects(query) {
    const lowerQuery = query.toLowerCase();
    return this.projects.filter(project => 
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.id.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.VJProjectLoader = VJProjectLoader;
}

/**
 * Project Viewer for Nexus Portfolio
 * Handles loading and displaying different project types
 */
class NexusProjectViewer {
  constructor(container, project) {
    this.container = container;
    this.project = project;
    this.iframe = null;
  }
  
  async load() {
    this.container.innerHTML = '';
    
    // Create iframe to load the project
    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100vh';
    this.iframe.style.border = 'none';
    this.iframe.style.background = '#000';
    this.iframe.src = `projects/${this.project.file}`;
    
    this.container.appendChild(this.iframe);
    
    // Handle iframe load
    this.iframe.onload = () => {
      try {
        // Try to resize iframe based on content (may fail due to CORS)
        const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        const body = iframeDoc.body;
        if (body) {
          const height = Math.max(body.scrollHeight, body.offsetHeight, 600);
          this.iframe.style.height = height + 'px';
        }
      } catch (e) {
        // Cross-origin restrictions, use default height
        this.iframe.style.height = '100vh';
      }
    };
  }
  
  destroy() {
    if (this.iframe) {
      this.iframe.src = '';
      this.iframe.remove();
      this.iframe = null;
    }
    this.container.innerHTML = '';
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.NexusProjectViewer = NexusProjectViewer;
}

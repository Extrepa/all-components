// Projects / Profiles system
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Projects = {
    loadProjectsFromStorage() {
      try {
        const json = localStorage.getItem(App.PROJECTS_STORAGE_KEY);
        return Utils.safeParseJSON(json, []);
      } catch (e) {
        return [];
      }
    },

    saveProjectsToStorage(projects) {
      try {
        localStorage.setItem(App.PROJECTS_STORAGE_KEY, JSON.stringify(projects));
      } catch (e) {
        console.error("Failed to save projects:", e);
      }
    },

    upsertProject(name, snapshot, id) {
      const projects = this.loadProjectsFromStorage();
      const project = {
        id: id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        createdAt: id ? projects.find((p) => p.id === id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        snapshot
      };
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        projects[idx] = project;
      } else {
        projects.push(project);
      }
      this.saveProjectsToStorage(projects);
      this.renderProjectsList();
      return project.id;
    },

    deleteProject(id) {
      const projects = this.loadProjectsFromStorage();
      const filtered = projects.filter((p) => p.id !== id);
      this.saveProjectsToStorage(filtered);
      this.renderProjectsList();
    },

    renderProjectsList() {
      if (!App.dom.projectsListEl) return;
      const projects = this.loadProjectsFromStorage();
      App.dom.projectsListEl.innerHTML = "";
      if (projects.length === 0) {
        App.dom.projectsListEl.innerHTML = "<p class='text-slate-500 p-2 text-[10px]'>No projects saved yet.</p>";
        return;
      }
      projects.forEach((project) => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-1.5 border-b border-slate-800/80";
        const left = document.createElement("div");
        left.className = "flex-1";
        left.innerHTML = `<div class='text-slate-100 text-[10px]'>${project.name}</div><div class='text-slate-500 text-[9px]'>${Utils.formatShortDate(project.updatedAt)}</div>`;
        const right = document.createElement("div");
        right.className = "flex items-center gap-1";
        const loadBtn = document.createElement("button");
        loadBtn.className = "px-1.5 py-0.5 rounded border border-cyan-500/70 text-cyan-200 text-[9px] hover:bg-cyan-500/15";
        loadBtn.textContent = "Load";
        loadBtn.onclick = () => {
          if (window.ErrlFX && window.ErrlFX.Session) {
            window.ErrlFX.Session.loadSessionSnapshot(project.snapshot);
          }
          App.state.currentProjectId = project.id;
        };
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "px-1.5 py-0.5 rounded border border-rose-500/70 text-rose-200 text-[9px] hover:bg-rose-500/15";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
          if (confirm(`Delete project "${project.name}"?`)) {
            this.deleteProject(project.id);
            Utils.playBeep(240, 0.08, "square");
          }
        };
        right.appendChild(loadBtn);
        right.appendChild(deleteBtn);
        item.appendChild(left);
        item.appendChild(right);
        App.dom.projectsListEl.appendChild(item);
      });
    },

    loadProject(id) {
      const projects = this.loadProjectsFromStorage();
      const project = projects.find((p) => p.id === id);
      if (project && window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.loadSessionSnapshot(project.snapshot);
        App.state.currentProjectId = id;
      }
    },

    overwriteProject(id) {
      if (!id) return;
      if (window.ErrlFX && window.ErrlFX.Session) {
        const snapshot = window.ErrlFX.Session.collectSessionSnapshot();
        const projects = this.loadProjectsFromStorage();
        const project = projects.find((p) => p.id === id);
        if (project) {
          this.upsertProject(project.name, snapshot, id);
        }
      }
    }
  };

  window.ErrlFX.Projects = Projects;
})(window);

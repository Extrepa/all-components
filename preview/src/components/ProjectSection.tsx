import React from 'react';
import { ComponentCard } from './ComponentCard';
import './ProjectSection.css';

interface Component {
  name: string;
  path: string;
  type: 'tsx' | 'ts' | 'js' | 'jsx';
  renderable?: boolean;
  previewable?: boolean;
}

interface Project {
  path: string;
  components: Component[];
}

interface ProjectSectionProps {
  projectName: string;
  project: Project;
  onComponentSelect: (componentId: string) => void;
}

export function ProjectSection({ projectName, project, onComponentSelect }: ProjectSectionProps) {
  return (
    <div className="project-section">
      <div className="project-header">
        <h2 className="project-title">{projectName}</h2>
        <span className="component-count">{project.components.length} components</span>
      </div>
      <div className="components-grid">
        {project.components.map((component) => (
          <ComponentCard
            key={`${projectName}-${component.name}`}
            component={component}
            projectName={projectName}
            projectPath={project.path}
            onSelect={() => onComponentSelect(`${projectName}:${component.name}`)}
          />
        ))}
      </div>
    </div>
  );
}

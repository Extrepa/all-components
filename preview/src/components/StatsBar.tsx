import React from 'react';
import './StatsBar.css';

interface StatsBarProps {
  stats: {
    totalComponents: number;
    totalProjects: number;
    totalFiles: number;
    disabledComponents?: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <div className="stat-value">{stats.totalComponents}</div>
        <div className="stat-label">Total Components</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalProjects}</div>
        <div className="stat-label">Projects</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalFiles}</div>
        <div className="stat-label">Files</div>
      </div>
      {typeof stats.disabledComponents === 'number' && stats.disabledComponents > 0 && (
        <div className="stat-item">
          <div className="stat-value">{stats.disabledComponents}</div>
          <div className="stat-label">Preview Disabled</div>
        </div>
      )}
    </div>
  );
}

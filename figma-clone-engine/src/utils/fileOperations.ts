import { DesignState } from '../types';
import { migrateDesignState } from './migration';
import { generateId } from './helpers';
import { SceneNode } from '../types';
import { exportJSON } from '@/shared/utils/export';

export const handleSave = (state: DesignState) => {
  exportJSON(state, state.projectName || 'design', { pretty: true });
};

export const handleSaveAs = (state: DesignState) => {
  const fileName = prompt('Enter file name:', state.projectName || 'design');
  if (fileName) {
    exportJSON({ ...state, projectName: fileName }, fileName, { pretty: true });
  }
};

export const handleLoad = (
  e: React.ChangeEvent<HTMLInputElement>,
  pushToHistory: (state: DesignState) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const loadedState = JSON.parse(event.target?.result as string) as DesignState;
      const migratedState = {
        ...loadedState,
        nodes: migrateDesignState(loadedState),
        projectName: loadedState.projectName || 'Untitled'
      };
      pushToHistory(migratedState);
    } catch (error) {
      console.error('Failed to load file:', error);
      alert('Failed to load design file');
    }
  };
  reader.readAsText(file);
};

export const handleExport = (state: DesignState) => {
  const selectedNodes = state.selection.length > 0 
    ? state.selection.map(id => state.nodes[id]).filter(Boolean)
    : Object.values(state.nodes);
  
  const exportData = {
    nodes: selectedNodes,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  exportJSON(exportData, `export-${Date.now()}`, { pretty: true });
};

export const handleImport = (
  state: DesignState,
  pushToHistory: (state: DesignState) => void
) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target?.result as string);
        if (importData.nodes && Array.isArray(importData.nodes)) {
          const newNodes: Record<string, SceneNode> = {};
          const newRootIds: string[] = [];
          
          importData.nodes.forEach((node: SceneNode) => {
            const newId = generateId();
            newNodes[newId] = { ...node, id: newId, parent: null };
            newRootIds.push(newId);
          });
          
          const newState = {
            ...state,
            nodes: { ...state.nodes, ...newNodes },
            rootIds: [...state.rootIds, ...newRootIds],
            selection: newRootIds
          };
          pushToHistory(newState);
        }
      } catch (error) {
        console.error('Failed to import:', error);
        alert('Failed to import file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};


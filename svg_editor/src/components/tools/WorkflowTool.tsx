import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { usePathExtraction } from '../../hooks/usePathExtraction';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import ToolHeader from '../ToolHeader';

const WorkflowTool: React.FC = () => {
    const { state, updateState, clearSelection, setSelectedPaths } = useAppContext();
    const { saveState } = useHistory();
    const { extractPaths, extractGroups } = usePathExtraction();
    const { renderSVG } = useSVGRenderer();

    if (!state.paths.length) {
        return (
            <div className="tool-panel-content">
                <ToolHeader
                    name="Workflow Manager"
                    whenToUse="Use this to organize and manage your SVG paths and groups."
                    howItWorks="1) Click paths in preview to select them → 2) Name selected paths → 3) Create groups → 4) Reorder layers → 5) Select group to edit all paths in it"
                    description="Manage path selection, naming, grouping, and layer ordering."
                />
                <div className="tool-status-section">
                    <p style={{ textAlign: 'center', margin: 0 }}>No paths found. Load an SVG file first.</p>
                </div>
            </div>
        );
    }

    const selectedCount = state.selectedPaths.size;
    const selectedPaths = selectedCount > 0 
        ? Array.from(state.selectedPaths).map(id => state.paths.find(p => p.id === id)).filter(p => p) 
        : [];

    const handleClearSelection = () => {
        clearSelection();
    };

    const handleSelectAll = () => {
        const allIds = new Set(state.paths.map(p => p.id));
        setSelectedPaths(allIds);
    };

    const handleInvertSelection = () => {
        const allIds = new Set(state.paths.map(p => p.id));
        const newSelection = new Set<string>();
        allIds.forEach(id => {
            if (!state.selectedPaths.has(id)) {
                newSelection.add(id);
            }
        });
        setSelectedPaths(newSelection);
    };

    const handleSelectSimilar = () => {
        if (selectedPaths.length === 0) return;
        const firstPath = selectedPaths[0];
        if (!firstPath) return;
        
        const similarPaths = state.paths.filter(path => {
            return path.fill === firstPath.fill && path.stroke === firstPath.stroke;
        });
        
        const similarIds = new Set(similarPaths.map(p => p.id));
        setSelectedPaths(similarIds);
    };

    const handleDuplicate = () => {
        if (state.selectedPaths.size === 0 || !state.svgElement) return;
        
        saveState();
        
        const newPaths: string[] = [];
        
        state.selectedPaths.forEach(pathId => {
            const path = state.paths.find(p => p.id === pathId);
            if (!path) return;
            
            const cloned = path.element.cloneNode(true) as SVGPathElement;
            const newId = `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            cloned.setAttribute('id', newId);
            
            // Offset position slightly
            const transform = path.transform || '';
            const offset = 20;
            const newTransform = transform 
                ? `${transform} translate(${offset}, ${offset})`
                : `translate(${offset}, ${offset})`;
            cloned.setAttribute('transform', newTransform);
            
            state.svgElement!.appendChild(cloned);
            newPaths.push(newId);
        });
        
        setSelectedPaths(new Set(newPaths));
        extractPaths();
        renderSVG();
    };

    const handleDelete = () => {
        if (state.selectedPaths.size === 0 || !state.svgElement) return;
        
        if (!confirm(`Delete ${state.selectedPaths.size} selected path(s)?`)) {
            return;
        }
        
        saveState();
        
        state.selectedPaths.forEach(pathId => {
            const path = state.paths.find(p => p.id === pathId);
            if (path) {
                path.element.remove();
            }
        });
        
        clearSelection();
        extractPaths();
        extractGroups();
        renderSVG();
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Workflow Manager"
                whenToUse="Use this to organize and manage your SVG paths and groups."
                howItWorks="1) Click paths in preview to select them → 2) Name selected paths → 3) Create groups → 4) Reorder layers → 5) Select group to edit all paths in it"
                description="Manage path selection, naming, grouping, and layer ordering."
            />

            <div className={`tool-status-section ${selectedCount > 0 ? 'ready' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                        <strong style={{ fontSize: '1rem' }}>Selected:</strong>
                        <span style={{ fontSize: '1.25rem', color: selectedCount > 0 ? 'var(--primary-color)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            {selectedCount}
                        </span> path(s) of {state.paths.length}
                    </div>
                    {selectedCount > 0 && (
                        <button className="btn btn-small" onClick={handleClearSelection}>
                            Clear
                        </button>
                    )}
                </div>
                {selectedCount === 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Click paths in the preview to select them
                    </p>
                )}
            </div>

            <div className="tool-parameters">
                {selectedCount > 0 && (
                    <>
                        <label className="form-label">Selection Actions</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <button className="btn btn-small" onClick={handleSelectAll}>
                                Select All
                            </button>
                            <button className="btn btn-small" onClick={handleInvertSelection}>
                                Invert
                            </button>
                            <button className="btn btn-small" onClick={handleSelectSimilar}>
                                Select Similar
                            </button>
                        </div>

                        <label className="form-label">Selected Paths ({selectedCount})</label>
                        <div className="selected-paths-list" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '0.5rem', marginBottom: '1rem' }}>
                            {selectedPaths.filter((p): p is NonNullable<typeof p> => p !== undefined).map(path => (
                                <div key={path.id} className="selected-path-item" style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                                    <strong>{path.id}</strong>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Fill: {path.fill || 'none'} | Stroke: {path.stroke || 'none'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <label className="form-label">All Paths ({state.paths.length})</label>
                <div className="path-list" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '0.5rem' }}>
                    {state.paths.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                            No paths found. Load an SVG file first.
                        </p>
                    ) : (
                        state.paths.map((path) => (
                            <div
                                key={path.id}
                                className={`path-item ${state.selectedPaths.has(path.id) ? 'selected' : ''}`}
                                onClick={() => {
                                    const newSet = new Set(state.selectedPaths);
                                    if (newSet.has(path.id)) {
                                        newSet.delete(path.id);
                                    } else {
                                        newSet.add(path.id);
                                    }
                                    updateState({ selectedPaths: newSet });
                                }}
                                style={{ 
                                    padding: '0.5rem', 
                                    background: state.selectedPaths.has(path.id) ? 'rgba(74, 144, 226, 0.1)' : 'var(--bg-secondary)', 
                                    borderRadius: '4px', 
                                    marginBottom: '0.25rem', 
                                    cursor: 'pointer',
                                    border: state.selectedPaths.has(path.id) ? '1px solid var(--primary-color)' : '1px solid transparent'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{path.id}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    {path.d.substring(0, 60)}{path.d.length > 60 ? '...' : ''}
                                </div>
                                <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                                    <span>Fill: {path.fill || 'none'}</span>
                                    <span>Stroke: {path.stroke || 'none'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedCount > 0 && (
                <div className="tool-actions">
                    <button className="btn btn-primary" onClick={handleDuplicate} style={{ width: '100%', marginBottom: '0.5rem' }}>
                        Duplicate ({selectedCount})
                    </button>
                    <button 
                        className="btn" 
                        style={{ background: 'var(--danger-color)', width: '100%' }}
                        onClick={handleDelete}
                    >
                        Delete ({selectedCount})
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkflowTool;


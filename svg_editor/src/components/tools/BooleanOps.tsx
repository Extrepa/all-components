import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import { usePathExtraction } from '../../hooks/usePathExtraction';
import ToolHeader from '../ToolHeader';

const BooleanOps: React.FC = () => {
    const { state, updateState } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const { extractPaths } = usePathExtraction();

    const selectedCount = state.selectedPaths.size;
    const selectedPaths = selectedCount > 0 
        ? Array.from(state.selectedPaths).map(id => state.paths.find(p => p.id === id)).filter(p => p) 
        : [];

    const handleBooleanOp = (operation: 'union' | 'subtract' | 'intersect') => {
        if (selectedCount < 2) {
            alert(`Select at least 2 paths for ${operation} operation`);
            return;
        }

        // Check if Paper.js is available
        if (typeof (window as any).paper === 'undefined') {
            alert('Paper.js library not loaded. Boolean operations require Paper.js.');
            return;
        }

        saveState();
        const selectedPathElements = selectedPaths.filter(p => p);
        
        if (selectedPathElements.length < 2) return;
        
        try {
            const basePath = selectedPathElements[0];
            if (!basePath) return;
            
            const paper = (window as any).paper;
            
            // Get bounding box
            let maxWidth = 2000, maxHeight = 2000;
            try {
                const bbox = basePath.element.getBBox();
                maxWidth = Math.max(maxWidth, Math.ceil(bbox.width * 2));
                maxHeight = Math.max(maxHeight, Math.ceil(bbox.height * 2));
            } catch (e) {}
            
            // Create Paper.js project
            const canvas = document.createElement('canvas');
            canvas.width = maxWidth;
            canvas.height = maxHeight;
            paper.setup(canvas);
            
            // Convert paths to Paper.js
            try {
                let resultPath: any = new paper.Path(basePath.d);
                
                selectedPathElements.slice(1).forEach(path => {
                    if (!path) return;
                    const path2 = new paper.Path(path.d);
                    if (operation === 'union') {
                        resultPath = resultPath.unite(path2);
                    } else if (operation === 'subtract') {
                        resultPath = resultPath.subtract(path2);
                    } else if (operation === 'intersect') {
                        resultPath = resultPath.intersect(path2);
                    }
                });
                
                // Convert result back to SVG path
                const pathData = resultPath.pathData;
                basePath.element.setAttribute('d', pathData);
                basePath.d = pathData;
                
                // Remove other paths
                selectedPathElements.slice(1).forEach(path => {
                    if (path) path.element.remove();
                });
                
                paper.project.clear();
                extractPaths();
                renderSVG();
            } catch (e) {
                paper.project.clear();
                alert(`Error performing ${operation}: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        } catch (e) {
            alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Boolean Operations"
                whenToUse="For complex shape creation. Subtract for cookie-cutter effects, Intersect for masks, Union for combining (also available in Path Merger)."
                howItWorks="Combine paths using geometric operations. Union combines shapes, Subtract cuts holes, Intersect keeps only overlapping areas. Uses Paper.js for production-quality operations."
                warnings="Requires Paper.js library. First selected path is the base. Second+ paths are the operands."
            />

            <div className={`tool-status-section ${selectedCount >= 2 ? 'ready' : selectedCount > 0 ? 'warning' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                        <strong style={{ fontSize: '1rem' }}>Operating on:</strong>
                        <span style={{ fontSize: '1.25rem', color: selectedCount >= 2 ? 'var(--primary-color)' : 'var(--warning-color)', marginLeft: '0.5rem' }}>
                            {selectedCount}
                        </span> path(s)
                    </div>
                    <button className="btn btn-small" onClick={() => updateState({ currentPanel: 'workflow' })}>
                        {selectedCount > 0 ? 'Change Selection' : 'Go to Selection'}
                    </button>
                </div>
                {selectedCount < 2 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginTop: '0.5rem', fontWeight: 600 }}>
                        {selectedCount === 0 ? 'Select at least 2 paths for boolean operations' : 'Select at least 1 more path'}
                    </p>
                ) : (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        First selected path is the base. Second+ paths are the operands.
                    </p>
                )}
            </div>

            <div className="tool-parameters">
                <label className="form-label">Operations</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => handleBooleanOp('union')} 
                        disabled={selectedCount < 2} 
                        style={{ width: '100%' }}
                    >
                        ➕ Union (Combine)
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => handleBooleanOp('subtract')} 
                        disabled={selectedCount < 2} 
                        style={{ width: '100%' }}
                    >
                        ➖ Subtract (Cut hole)
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => handleBooleanOp('intersect')} 
                        disabled={selectedCount < 2} 
                        style={{ width: '100%' }}
                    >
                        ✂️ Intersect (Keep overlap)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BooleanOps;


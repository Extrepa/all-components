import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import { usePathExtraction } from '../../hooks/usePathExtraction';
import ToolHeader from '../ToolHeader';

const AlignmentTools: React.FC = () => {
    const { state, updateState } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const { extractPaths } = usePathExtraction();

    const selectedCount = state.selectedPaths.size;
    const selectedPaths = selectedCount > 0 
        ? Array.from(state.selectedPaths).map(id => state.paths.find(p => p.id === id)).filter(p => p) 
        : [];

    const applyAlignmentTransform = (path: NonNullable<typeof selectedPaths[0]>, tx: number, ty: number) => {
        const existingTransform = path.element.getAttribute('transform') || '';
        const transformMatch = existingTransform.match(/translate\(([^)]+)\)/);
        
        let newTx = tx;
        let newTy = ty;
        
        if (transformMatch) {
            const [, coords] = transformMatch;
            const [x, y] = coords.split(/[\s,]+/).map(Number);
            newTx += x || 0;
            newTy += y || 0;
        }
        
        const otherTransforms = existingTransform.replace(/translate\([^)]+\)/g, '').trim();
        const newTransform = `translate(${newTx},${newTy})${otherTransforms ? ' ' + otherTransforms : ''}`.trim();
        
        path.element.setAttribute('transform', newTransform);
    };

    const alignPaths = (alignment: string, reference: 'canvas' | 'selection') => {
        if (selectedCount === 0) {
            alert('Please select at least one path');
            return;
        }
        
        saveState();
        const selectedPathElements = selectedPaths.filter(p => p && p.element);
        
        if (selectedPathElements.length === 0) return;
        
        const bboxes = selectedPathElements.map(path => {
            if (!path) return null;
            try {
                return path.element.getBBox();
            } catch (e) {
                return null;
            }
        }).filter((b): b is SVGRect => b !== null);
        
        if (bboxes.length === 0) {
            alert('Could not determine path positions');
            return;
        }
        
        if (reference === 'canvas') {
            const viewBox = state.svgElement?.getAttribute('viewBox');
            let svgWidth = 100, svgHeight = 100;
            if (viewBox) {
                const [, , w, h] = viewBox.split(' ').map(Number);
                svgWidth = w;
                svgHeight = h;
            } else if (state.svgElement) {
                svgWidth = parseFloat(state.svgElement.getAttribute('width') || '100');
                svgHeight = parseFloat(state.svgElement.getAttribute('height') || '100');
            }
            
            selectedPathElements.forEach((path, idx) => {
                if (!bboxes[idx] || !path) return;
                const bbox = bboxes[idx];
                let tx = 0, ty = 0;
                
                switch (alignment) {
                    case 'left':
                        tx = -bbox.x;
                        break;
                    case 'center':
                        tx = (svgWidth / 2) - (bbox.x + bbox.width / 2);
                        break;
                    case 'right':
                        tx = svgWidth - (bbox.x + bbox.width);
                        break;
                    case 'top':
                        ty = -bbox.y;
                        break;
                    case 'middle':
                        ty = (svgHeight / 2) - (bbox.y + bbox.height / 2);
                        break;
                    case 'bottom':
                        ty = svgHeight - (bbox.y + bbox.height);
                        break;
                }
                
                applyAlignmentTransform(path, tx, ty);
            });
        } else {
            if (selectedPathElements.length < 2) {
                alert('Select at least 2 paths to align relative to each other');
                return;
            }
            
            const minX = Math.min(...bboxes.map(b => b.x));
            const maxX = Math.max(...bboxes.map(b => b.x + b.width));
            const minY = Math.min(...bboxes.map(b => b.y));
            const maxY = Math.max(...bboxes.map(b => b.y + b.height));
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            
            selectedPathElements.forEach((path, idx) => {
                if (!bboxes[idx] || !path) return;
                const bbox = bboxes[idx];
                let tx = 0, ty = 0;
                
                switch (alignment) {
                    case 'left':
                        tx = minX - bbox.x;
                        break;
                    case 'center':
                        tx = centerX - (bbox.x + bbox.width / 2);
                        break;
                    case 'right':
                        tx = maxX - (bbox.x + bbox.width);
                        break;
                    case 'top':
                        ty = minY - bbox.y;
                        break;
                    case 'middle':
                        ty = centerY - (bbox.y + bbox.height / 2);
                        break;
                    case 'bottom':
                        ty = maxY - (bbox.y + bbox.height);
                        break;
                }
                
                applyAlignmentTransform(path, tx, ty);
            });
        }
        
        extractPaths();
        renderSVG();
    };

    const distributePaths = (direction: 'horizontal' | 'vertical') => {
        if (selectedCount < 3) {
            alert('Please select at least 3 paths to distribute');
            return;
        }
        
        saveState();
        const selectedPathElements = selectedPaths.filter(p => p && p.element);
        
        const pathsWithBBoxes = selectedPathElements.map(path => {
            if (!path) return null;
            try {
                const bbox = path.element.getBBox();
                return { 
                    path, 
                    bbox, 
                    center: direction === 'horizontal' ? bbox.x + bbox.width / 2 : bbox.y + bbox.height / 2 
                };
            } catch (e) {
                return null;
            }
        }).filter((p): p is { path: NonNullable<typeof selectedPaths[0]>, bbox: SVGRect, center: number } => p !== null).sort((a, b) => a.center - b.center);
        
        if (pathsWithBBoxes.length < 3) {
            alert('Could not determine path positions');
            return;
        }
        
        const first = pathsWithBBoxes[0].center;
        const last = pathsWithBBoxes[pathsWithBBoxes.length - 1].center;
        const spacing = (last - first) / (pathsWithBBoxes.length - 1);
        
        pathsWithBBoxes.forEach((item, idx) => {
            if (!item.path) return;
            const targetCenter = first + (spacing * idx);
            const currentCenter = item.center;
            const offset = targetCenter - currentCenter;
            
            if (direction === 'horizontal') {
                applyAlignmentTransform(item.path, offset, 0);
            } else {
                applyAlignmentTransform(item.path, 0, offset);
            }
        });
        
        extractPaths();
        renderSVG();
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Alignment Tools"
                whenToUse="After selecting multiple paths, use these tools to align them perfectly before bridging or merging."
                howItWorks="Align and distribute selected paths relative to each other or to the canvas. Essential for creating clean, organized designs."
                description="Position and space paths precisely using alignment and distribution tools."
            />

            <div className={`tool-status-section ${selectedCount >= 2 ? 'ready' : selectedCount > 0 ? 'warning' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                        <strong style={{ fontSize: '1rem' }}>Aligning:</strong>
                        <span style={{ fontSize: '1.25rem', color: selectedCount >= 2 ? 'var(--primary-color)' : 'var(--warning-color)', marginLeft: '0.5rem' }}>
                            {selectedCount}
                        </span> path(s)
                    </div>
                    <button className="btn btn-small" onClick={() => updateState({ currentPanel: 'workflow' })}>
                        {selectedCount > 0 ? 'Change Selection' : 'Go to Selection'}
                    </button>
                </div>
                {selectedCount < 2 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginTop: '0.5rem', fontWeight: 600 }}>
                        {selectedCount === 0 ? 'Select at least 2 paths to align' : 'Select at least 1 more path to align'}
                    </p>
                )}
            </div>

            <div className="tool-parameters">
                <label className="form-label">Align to Canvas</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button className="btn btn-small" onClick={() => alignPaths('left', 'canvas')} disabled={selectedCount === 0}>
                        Left
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('center', 'canvas')} disabled={selectedCount === 0}>
                        Center
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('right', 'canvas')} disabled={selectedCount === 0}>
                        Right
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('top', 'canvas')} disabled={selectedCount === 0}>
                        Top
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('middle', 'canvas')} disabled={selectedCount === 0}>
                        Middle
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('bottom', 'canvas')} disabled={selectedCount === 0}>
                        Bottom
                    </button>
                </div>

                <label className="form-label">Align to Selection (2+ paths)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button className="btn btn-small" onClick={() => alignPaths('left', 'selection')} disabled={selectedCount < 2}>
                        Left
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('center', 'selection')} disabled={selectedCount < 2}>
                        Center
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('right', 'selection')} disabled={selectedCount < 2}>
                        Right
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('top', 'selection')} disabled={selectedCount < 2}>
                        Top
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('middle', 'selection')} disabled={selectedCount < 2}>
                        Middle
                    </button>
                    <button className="btn btn-small" onClick={() => alignPaths('bottom', 'selection')} disabled={selectedCount < 2}>
                        Bottom
                    </button>
                </div>

                <label className="form-label">Distribute (3+ paths)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <button className="btn btn-small" onClick={() => distributePaths('horizontal')} disabled={selectedCount < 3}>
                        Horizontal
                    </button>
                    <button className="btn btn-small" onClick={() => distributePaths('vertical')} disabled={selectedCount < 3}>
                        Vertical
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlignmentTools;


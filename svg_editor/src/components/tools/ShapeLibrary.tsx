import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import { usePathExtraction } from '../../hooks/usePathExtraction';
import ToolHeader from '../ToolHeader';

const ShapeLibrary: React.FC = () => {
    const { state } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const { extractPaths } = usePathExtraction();

    const createShape = (type: string, params?: any) => {
        if (!state.svgElement) {
            alert('Please load an SVG first');
            return;
        }

        saveState();
        const svgNS = 'http://www.w3.org/2000/svg';
        let pathData = '';

        switch (type) {
            case 'star':
                const points = params.points || 5;
                const outerRadius = params.outerRadius || 50;
                const innerRadius = outerRadius * 0.5;
                const centerX = 100;
                const centerY = 100;
                pathData = `M ${centerX} ${centerY - outerRadius}`;
                for (let i = 1; i <= points * 2; i++) {
                    const angle = (i * Math.PI) / points - Math.PI / 2;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    pathData += ` L ${x} ${y}`;
                }
                pathData += ' Z';
                break;
            case 'polygon':
                const sides = params.sides || 6;
                const radius = params.radius || 50;
                const cx = 100;
                const cy = 100;
                pathData = `M ${cx + radius} ${cy}`;
                for (let i = 1; i <= sides; i++) {
                    const angle = (i * 2 * Math.PI) / sides;
                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);
                    pathData += ` L ${x} ${y}`;
                }
                pathData += ' Z';
                break;
            case 'circle':
                pathData = `M 100,50 A 50,50 0 1,1 100,150 A 50,50 0 1,1 100,50 Z`;
                break;
            default:
                return;
        }

        const newPath = document.createElementNS(svgNS, 'path');
        newPath.setAttribute('d', pathData);
        newPath.setAttribute('fill', '#000000');
        newPath.id = `${type}-${Date.now()}`;
        
        state.svgElement.appendChild(newPath);
        extractPaths();
        renderSVG();
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Shape Library"
                whenToUse="At the start of your design or when you need standard shapes."
                howItWorks="Quickly add pre-made shapes (stars, polygons, arrows, speech bubbles) to your SVG."
                description="Insert common shapes and patterns into your SVG."
            />

            {!state.svgElement && (
                <div className="tool-status-section">
                    <p style={{ fontSize: '0.875rem', color: 'var(--warning-color)', margin: 0, fontWeight: 600 }}>
                        Load an SVG file first to add shapes
                    </p>
                </div>
            )}

            <div className="tool-parameters">
                <label className="form-label">Stars</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button className="btn btn-small" onClick={() => createShape('star', { points: 5 })} disabled={!state.svgElement}>
                        5-Point Star
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('star', { points: 6 })} disabled={!state.svgElement}>
                        6-Point Star
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('star', { points: 8 })} disabled={!state.svgElement}>
                        8-Point Star
                    </button>
                </div>

                <label className="form-label">Polygons</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button className="btn btn-small" onClick={() => createShape('polygon', { sides: 3 })} disabled={!state.svgElement}>
                        Triangle
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('polygon', { sides: 4 })} disabled={!state.svgElement}>
                        Square
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('polygon', { sides: 5 })} disabled={!state.svgElement}>
                        Pentagon
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('polygon', { sides: 6 })} disabled={!state.svgElement}>
                        Hexagon
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('polygon', { sides: 8 })} disabled={!state.svgElement}>
                        Octagon
                    </button>
                    <button className="btn btn-small" onClick={() => createShape('polygon', { sides: 12 })} disabled={!state.svgElement}>
                        Dodecagon
                    </button>
                </div>

                <label className="form-label">Basic Shapes</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <button className="btn btn-small" onClick={() => createShape('circle')} disabled={!state.svgElement}>
                        Circle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShapeLibrary;


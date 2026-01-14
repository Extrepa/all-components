import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import { usePathExtraction } from '../../hooks/usePathExtraction';
import ToolHeader from '../ToolHeader';

const CleanupTools: React.FC = () => {
    const { state } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const { extractPaths } = usePathExtraction();
    const [roundPrecision, setRoundPrecision] = useState(2);

    const handleRemoveInvisible = () => {
        saveState();
        let removed = 0;
        
        state.paths.forEach(path => {
            const opacity = parseFloat(path.opacity) || 1;
            const hasFill = path.fill && path.fill !== 'none' && path.fill !== 'transparent';
            const hasStroke = path.stroke && path.stroke !== 'none' && path.stroke !== 'transparent' && parseFloat(path.strokeWidth) > 0;
            
            if (opacity === 0 || (!hasFill && !hasStroke)) {
                path.element.remove();
                removed++;
            }
        });
        
        extractPaths();
        renderSVG();
        alert(`Removed ${removed} invisible object(s)!`);
    };

    const handleRemoveStrayPoints = () => {
        saveState();
        let removed = 0;
        
        state.paths.forEach(path => {
            const pointCount = (path.d.match(/[ML]/g) || []).length;
            if (pointCount <= 1) {
                path.element.remove();
                removed++;
            }
        });
        
        extractPaths();
        renderSVG();
        alert(`Removed ${removed} stray point(s)!`);
    };

    const handleRoundCoordinates = () => {
        saveState();
        state.paths.forEach(path => {
            const d = path.d.replace(/(\d+\.\d+)/g, (match) => {
                return parseFloat(match).toFixed(roundPrecision);
            });
            path.element.setAttribute('d', d);
            path.d = d;
        });
        
        extractPaths();
        renderSVG();
        alert('Rounded all coordinates!');
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Cleanup Tools"
                whenToUse="Before exporting, or when paths aren't behaving correctly. Use these to clean up messy SVGs."
                howItWorks="One-click scripts to fix common SVG errors and improve precision. Essential for clean code and cutting machines."
                description="Remove invisible objects, stray points, and round coordinates for cleaner SVG files."
            />

            <div className="tool-parameters">
                <label className="form-label">Cleanup Actions</label>
                
                <button className="btn btn-primary" onClick={handleRemoveInvisible} style={{ width: '100%', marginBottom: '0.5rem' }}>
                    Remove Invisible Objects
                </button>
                
                <button className="btn btn-primary" onClick={handleRemoveStrayPoints} style={{ width: '100%', marginBottom: '1rem' }}>
                    Remove Stray Points
                </button>
                
                <label className="form-label">Round Coordinates</label>
                <input
                    type="range"
                    className="form-input"
                    min="0"
                    max="5"
                    value={roundPrecision}
                    onChange={(e) => setRoundPrecision(parseInt(e.target.value))}
                />
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {roundPrecision} decimals
                </div>
            </div>

            <div className="tool-actions">
                <button className="btn btn-primary" onClick={handleRoundCoordinates} style={{ width: '100%' }}>
                    Round All Coordinates
                </button>
            </div>
        </div>
    );
};

export default CleanupTools;


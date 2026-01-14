import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import ToolHeader from '../ToolHeader';

const ColorReplacer: React.FC = () => {
    const { state, updateState } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [newColor, setNewColor] = useState<string>('#000000');
    const [colors, setColors] = useState<string[]>([]);

    useEffect(() => {
        // Extract all colors from paths
        const colorSet = new Set<string>();
        state.paths.forEach(path => {
            if (path.fill && path.fill !== 'none') colorSet.add(path.fill);
            if (path.stroke && path.stroke !== 'none') colorSet.add(path.stroke);
        });
        setColors(Array.from(colorSet));
    }, [state.paths]);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setNewColor(color);
    };

    const handleReplaceAll = () => {
        if (!selectedColor || !newColor) return;
        
        saveState();
        state.paths.forEach(path => {
            if (path.fill === selectedColor) {
                path.element.setAttribute('fill', newColor);
                path.fill = newColor;
            }
            if (path.stroke === selectedColor) {
                path.element.setAttribute('stroke', newColor);
                path.stroke = newColor;
            }
        });
        renderSVG();
        setSelectedColor('');
    };

    const handleReplaceInSelection = () => {
        if (!selectedColor || !newColor || state.selectedPaths.size === 0) return;
        
        saveState();
        state.selectedPaths.forEach(pathId => {
            const path = state.paths.find(p => p.id === pathId);
            if (!path) return;
            
            if (path.fill === selectedColor) {
                path.element.setAttribute('fill', newColor);
                path.fill = newColor;
            }
            if (path.stroke === selectedColor) {
                path.element.setAttribute('stroke', newColor);
                path.stroke = newColor;
            }
        });
        renderSVG();
    };

    const handleSelectPathsByColor = () => {
        if (!selectedColor) return;
        
        const newSet = new Set<string>();
        state.paths.forEach(path => {
            if (path.fill === selectedColor || path.stroke === selectedColor) {
                newSet.add(path.id);
            }
        });
        updateState({ selectedPaths: newSet });
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Color Replacer"
                whenToUse="Use this to standardize colors or create color variants. Works with selected paths or entire SVG."
                howItWorks="Pick colors from your SVG or use the color palette. Click a swatch to select a color to replace."
                description="Find and replace colors across your SVG. Select colors from the palette or pick from paths."
            />

            <div className="tool-status-section" style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Found {colors.length} unique color{colors.length !== 1 ? 's' : ''}</strong>
            </div>

            <div className="tool-parameters">
                <label className="form-label">Color Palette - Click to Select</label>
                <div className="color-palette" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                            style={{
                                backgroundColor: color,
                                width: '60px',
                                height: '60px',
                                borderRadius: '4px',
                                border: selectedColor === color ? '3px solid var(--primary-color)' : '1px solid var(--border-color)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}
                            onClick={() => handleColorSelect(color)}
                            title={color}
                        >
                            <div className="color-swatch-label" style={{ fontSize: '0.7rem', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                {color.length > 7 ? color.substring(0, 7) + '...' : color}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedColor && (
                <div className="tool-parameters" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(74, 144, 226, 0.1)', borderRadius: 'var(--border-radius)', border: '2px solid var(--primary-color)' }}>
                    <label className="form-label">Replacing: {selectedColor}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <input
                            type="color"
                            className="form-input"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            style={{ width: '60px', height: '40px' }}
                        />
                        <input
                            type="text"
                            className="form-input"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            placeholder="#000000"
                            style={{ flex: 1 }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={handleReplaceAll}>
                            Replace All
                        </button>
                        <button
                            className={`btn ${state.selectedPaths.size > 0 ? 'btn-secondary' : ''}`}
                            onClick={handleReplaceInSelection}
                            disabled={state.selectedPaths.size === 0}
                        >
                            Replace in Selection ({state.selectedPaths.size})
                        </button>
                        <button className="btn" onClick={handleSelectPathsByColor}>
                            Select All with This Color
                        </button>
                    </div>
                </div>
            )}

            {!selectedColor && (
                <div className="tool-status-section" style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                        Click a color swatch above to select a color to replace.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ColorReplacer;


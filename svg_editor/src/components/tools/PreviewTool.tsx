import { useAppContext } from '../../context/AppContext';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import ToolHeader from '../ToolHeader';

const PreviewTool: React.FC = () => {
    const { state, updateState } = useAppContext();
    const { fitToScreen } = useSVGRenderer();

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Canvas Settings"
                whenToUse="Adjust canvas background and zoom settings for better visibility."
                howItWorks="Change background mode (grid, color, checkerboard) and adjust zoom level."
                description="Configure canvas appearance and viewing options."
            />

            {state.svgElement && (
                <div className="tool-status-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span><strong>Paths:</strong> {state.paths.length}</span>
                        <span><strong>Groups:</strong> {state.groups.length}</span>
                        <span><strong>Selected:</strong> {state.selectedPaths.size}</span>
                    </div>
                </div>
            )}

            <div className="tool-parameters">
                <label className="form-label">Background Mode</label>
                <select
                    className="form-input"
                    value={state.backgroundMode}
                    onChange={(e) => {
                        const value = e.target.value.toLowerCase() as typeof state.backgroundMode;
                        updateState({ backgroundMode: value });
                    }}
                >
                    <option value="none">None (Transparent)</option>
                    <option value="color">Solid Color</option>
                    <option value="grid">Grid</option>
                    <option value="checkerboard">Checkerboard</option>
                </select>
                {state.backgroundMode === 'color' && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <label className="form-label">Background Color</label>
                        <input
                            type="color"
                            className="form-input"
                            value={state.previewBgColor}
                            onChange={(e) => updateState({ previewBgColor: e.target.value })}
                        />
                    </div>
                )}

                <label className="form-label" style={{ marginTop: '1rem' }}>Zoom: {Math.round(state.currentZoom * 100)}%</label>
                <input
                    type="range"
                    className="form-input"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={state.currentZoom}
                    onChange={(e) => updateState({ currentZoom: parseFloat(e.target.value) })}
                />
            </div>

            <div className="tool-actions">
                <button className="btn btn-secondary" onClick={fitToScreen} disabled={!state.svgElement} style={{ width: '100%' }}>
                    Fit to Screen
                </button>
            </div>
        </div>
    );
};

export default PreviewTool;


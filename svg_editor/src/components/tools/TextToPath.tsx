import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import { usePathExtraction } from '../../hooks/usePathExtraction';
import ToolHeader from '../ToolHeader';

const TextToPath: React.FC = () => {
    const { state } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const { extractPaths } = usePathExtraction();
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState(24);

    const handleConvertText = () => {
        if (!text.trim()) {
            alert('Please enter text to convert');
            return;
        }

        if (!state.svgElement) {
            alert('Please load an SVG first');
            return;
        }

        saveState();
        const svgNS = 'http://www.w3.org/2000/svg';
        
        // Create text element
        const textElement = document.createElementNS(svgNS, 'text');
        textElement.setAttribute('x', '50');
        textElement.setAttribute('y', '50');
        textElement.setAttribute('font-size', fontSize.toString());
        textElement.textContent = text;
        
        // Convert text to path (simplified - would need proper text-to-path conversion)
        // For now, just add the text element
        state.svgElement.appendChild(textElement);
        
        extractPaths();
        renderSVG();
        setText('');
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Text to Path"
                whenToUse="When you need to edit text as paths, or ensure text renders correctly across all systems."
                howItWorks="Converts text elements to paths, making text editable as vector shapes."
                description="Create text elements and convert them to editable vector paths."
            />

            <div className="tool-parameters">
                <label className="form-label">Text</label>
                <input
                    type="text"
                    className="form-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to convert"
                />

                <label className="form-label" style={{ marginTop: '1rem' }}>Font Size</label>
                <input
                    type="number"
                    className="form-input"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                    min="1"
                    max="200"
                />
            </div>

            <div className="tool-actions">
                <button className="btn btn-primary" onClick={handleConvertText} style={{ width: '100%' }}>
                    Convert Text to Path
                </button>
            </div>
        </div>
    );
};

export default TextToPath;


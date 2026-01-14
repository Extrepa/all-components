import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useHistory } from '../../hooks/useHistory';
import { useSVGRenderer } from '../../hooks/useSVGRenderer';
import ToolHeader from '../ToolHeader';

const TokenInjector: React.FC = () => {
    const { state } = useAppContext();
    const { saveState } = useHistory();
    const { renderSVG } = useSVGRenderer();
    const [token, setToken] = useState('');
    const [replacement, setReplacement] = useState('');

    const handleInject = () => {
        if (!token || !replacement) {
            alert('Please enter both token and replacement');
            return;
        }

        saveState();
        let replaced = 0;
        
        state.paths.forEach(path => {
            if (path.d.includes(token)) {
                const newD = path.d.replace(new RegExp(token, 'g'), replacement);
                path.element.setAttribute('d', newD);
                path.d = newD;
                replaced++;
            }
        });
        
        renderSVG();
        alert(`Replaced token in ${replaced} path(s)!`);
    };

    return (
        <div className="tool-panel-content">
            <ToolHeader
                name="Token Injector"
                whenToUse="When working with template SVGs that contain placeholder values."
                howItWorks="Replace tokens/placeholders in path data with actual values. Useful for parameterized SVGs."
                description="Batch replace tokens in path data for template-based workflows."
            />

            <div className="tool-parameters">
                <label className="form-label">Token to Replace</label>
                <input
                    type="text"
                    className="form-input"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g., {WIDTH} or {HEIGHT}"
                />

                <label className="form-label" style={{ marginTop: '1rem' }}>Replacement Value</label>
                <input
                    type="text"
                    className="form-input"
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    placeholder="e.g., 100"
                />
            </div>

            <div className="tool-actions">
                <button className="btn btn-primary" onClick={handleInject} style={{ width: '100%' }}>
                    Inject Token
                </button>
            </div>
        </div>
    );
};

export default TokenInjector;


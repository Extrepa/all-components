import { useState } from 'react';
import InfoButton from './InfoButton';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ToolHeaderProps {
    name: string;
    whenToUse?: string;
    howItWorks?: string;
    warnings?: string;
    description?: string;
}

const ToolHeader: React.FC<ToolHeaderProps> = ({ 
    name, 
    whenToUse, 
    howItWorks, 
    warnings,
    description 
}) => {
    const [showDescription, setShowDescription] = useState(false);

    return (
        <div className="tool-header">
            <div className="tool-header-main">
                <h3 className="tool-name">{name}</h3>
                <div className="tool-header-actions">
                    {whenToUse && (
                        <InfoButton 
                            type="help" 
                            content={whenToUse}
                            label="When to use"
                        />
                    )}
                    {howItWorks && (
                        <InfoButton 
                            type="info" 
                            content={howItWorks}
                            label="How it works"
                        />
                    )}
                    {warnings && (
                        <InfoButton 
                            type="warning" 
                            content={warnings}
                            label="Warnings"
                        />
                    )}
                </div>
            </div>
            {description && (
                <div className="tool-description-toggle">
                    <button 
                        className="tool-description-btn"
                        onClick={() => setShowDescription(!showDescription)}
                    >
                        {showDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>Description</span>
                    </button>
                    {showDescription && (
                        <div className="tool-description-content">
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ToolHeader;


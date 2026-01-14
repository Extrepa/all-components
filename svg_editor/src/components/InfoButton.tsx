import { Info, AlertCircle, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

interface InfoButtonProps {
    type?: 'info' | 'warning' | 'help';
    content: string;
    label?: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ 
    type = 'info', 
    content,
    label 
}) => {
    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <AlertCircle size={14} />;
            case 'help':
                return <HelpCircle size={14} />;
            default:
                return <Info size={14} />;
        }
    };

    return (
        <Tooltip content={content} showOnHover={true} showOnClick={true}>
            <button 
                className={`info-button info-button-${type}`}
                aria-label={label || 'More information'}
                title={label || 'More information'}
            >
                {getIcon()}
            </button>
        </Tooltip>
    );
};

export default InfoButton;


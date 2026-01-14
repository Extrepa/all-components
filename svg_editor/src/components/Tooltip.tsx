import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    showOnHover?: boolean;
    showOnClick?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children, 
    position = 'top',
    showOnHover = true,
    showOnClick = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [clicked, setClicked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (clicked && !isVisible) {
            // Close on outside click
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node) &&
                    tooltipRef.current &&
                    !tooltipRef.current.contains(event.target as Node)
                ) {
                    setIsVisible(false);
                    setClicked(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [clicked, isVisible]);

    const handleMouseEnter = () => {
        if (showOnHover) {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (showOnHover && !clicked) {
            setIsVisible(false);
        }
    };

    const handleClick = () => {
        if (showOnClick) {
            setClicked(!clicked);
            setIsVisible(!isVisible);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="tooltip-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {children}
            {isVisible && (
                <div 
                    ref={tooltipRef}
                    className={`tooltip tooltip-${position}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {showOnClick && clicked && (
                        <button 
                            className="tooltip-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVisible(false);
                                setClicked(false);
                            }}
                        >
                            <X size={12} />
                        </button>
                    )}
                    <div className="tooltip-content">{content}</div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;


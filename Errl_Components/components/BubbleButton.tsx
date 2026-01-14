import { useErrlInteractions } from '../store/useErrlInteractions';
import { useScrollStore } from '../store/useScrollStore';
import { BubbleNav } from '../content/errl-config';

interface BubbleButtonProps {
  bubble: BubbleNav;
  children?: React.ReactNode;
}

export function BubbleButton({ bubble, children }: BubbleButtonProps) {
  const { setHoveredBubble, triggerPop } = useErrlInteractions();
  const scrollToSection = useScrollStore((state) => state.scrollToSection);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Emit pop event
    triggerPop(bubble.id, centerX, centerY);

    // Handle navigation based on action type
    if (bubble.action === 'scroll') {
      // Extract section ID from target (e.g., "#origin" -> "origin")
      const sectionId = bubble.target.replace('#', '');
      scrollToSection(sectionId);
    } else if (bubble.action === 'link') {
      window.open(bubble.target, '_blank');
    } else if (bubble.action === 'modal') {
      // TODO: Handle modal opening
      console.log('Modal target:', bubble.target);
    }

    e.preventDefault();
  };

  return (
    <button
      data-bubble-id={bubble.id}
      onMouseEnter={() => setHoveredBubble(bubble.id)}
      onMouseLeave={() => setHoveredBubble(null)}
      onClick={handleClick}
      style={{
        padding: '0.75rem 1.5rem',
        background: 'rgba(0, 255, 255, 0.1)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '999px',
        color: '#00ffff',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        mixBlendMode: 'difference',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children || bubble.label}
    </button>
  );
}


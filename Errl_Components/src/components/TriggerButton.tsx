import { useHypnoStore } from '../store/useHypnoStore';

export function TriggerButton() {
  const setHovered = useHypnoStore((state) => state.setHovered);

  return (
    <button
      className="trigger-button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Don't Touch
    </button>
  );
}

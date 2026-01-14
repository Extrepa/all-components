/**
 * Navigation bubble configuration
 */
export type BubbleNav = {
  /** Unique identifier for the bubble */
  id: string;
  /** Display label */
  label: string;
  /** Action type when clicked */
  action: 'scroll' | 'modal' | 'link';
  /** Target destination (section ID with #, URL, or modal ID) */
  target: string; // e.g., "#about" or "https://twitter.com"
};

/**
 * Scroll section configuration
 */
export type ScrollSection = {
  /** Unique identifier matching navigation target */
  id: string;
  /** Text layout style */
  layout: 'center' | 'split-left' | 'split-right';
  /** Section title */
  title: string;
  /** Section body text */
  text: string;
  /** Light intensity (0.0 to 1.0) - controls projector shader brightness for this section */
  lightIntensity: number;
};

export const ERRL_CONFIG = {
  meta: {
    title: "Errl | The Fluid Entity",
    primaryColor: "#00ffff", // Cyan
    secondaryColor: "#ff00ff", // Magenta
  },
  hero: {
    headline: "I AM ERRL.",
    subhead: "Born on the overhead projector. Living in the browser.",
    cta: "Pop Me",
  },
  navigationBubbles: [
    { id: 'nav-1', label: 'Origin', action: 'scroll', target: '#origin' },
    { id: 'nav-2', label: 'Fluidity', action: 'scroll', target: '#fluidity' },
    { id: 'nav-3', label: 'Contact', action: 'modal', target: 'contact-form' },
  ] as BubbleNav[],
  sections: [
    {
      id: 'origin',
      layout: 'center',
      title: "The Flat Surface",
      text: "I began as a smear of oil and light. The heat of the bulb gave me life.",
      lightIntensity: 0.8,
    },
    {
      id: 'fluidity',
      layout: 'split-left',
      title: "Stretchy Existence",
      text: "I am not code. I am a simulation of viscosity running at 60fps.",
      lightIntensity: 0.6,
    },
    {
      id: 'manifestation',
      layout: 'split-right',
      title: "Digital Manifestation",
      text: "Every scroll reveals more of my essence. I am the light, the oil, the projection.",
      lightIntensity: 0.9,
    },
    {
      id: 'eternity',
      layout: 'center',
      title: "Infinite Loop",
      text: "I exist in the space between frames. Between thoughts. Between reality and simulation.",
      lightIntensity: 0.7,
    },
  ] as ScrollSection[],
};


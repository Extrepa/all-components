import { Preset } from './types';

export const ASSET_PRESETS: Preset[] = [
  {
    id: 'slime-base',
    name: 'Green Slime',
    type: 'monster',
    basePrompt: 'A cute green slime monster, round gelatinous body, simple face, 2d game sprite, maple story style, white or transparent background',
    imageUrl: '/images/presets/slime-base.png'
  },
  {
    id: 'mushroom-base',
    name: 'Orange Mushroom',
    type: 'monster',
    basePrompt: 'An orange mushroom monster with spots, cute face, bouncing, 2d game sprite, maple story style, white or transparent background',
    imageUrl: '/images/presets/mushroom-base.png'
  },
  {
    id: 'pig-base',
    name: 'Red Ribbon Pig',
    type: 'monster',
    basePrompt: 'A pink pig with a red ribbon, angry expression, 2d game sprite, side scrolling, maple story style, white or transparent background',
    imageUrl: '/images/presets/pig-base.png'
  },
  {
    id: 'stump-base',
    name: 'Tree Stump',
    type: 'monster',
    basePrompt: 'An animated tree stump with a face, wooden texture, spooky, 2d game sprite, side scrolling, maple story style, white or transparent background',
    imageUrl: '/images/presets/stump-base.png'
  },
  {
    id: 'potion-red',
    name: 'Health Potion',
    type: 'item',
    basePrompt: 'A red glass potion bottle, glowing liquid, pixel art style, high quality 2d icon, maple story style, white or transparent background',
    imageUrl: '/images/presets/potion-red.png'
  },
  {
    id: 'platform-brick',
    name: 'Brick Platform',
    type: 'platform',
    basePrompt: 'A seamless brick platform block, mossy, floating island aesthetic, 2d game tile, maple story style, white or transparent background',
    imageUrl: '/images/presets/platform-brick.png'
  }
];

export const STYLE_MODIFIERS = {
  // Henesys (Green/Nature) → Errl: UV Pink/Magenta with dripping paint
  maple: 'Apply Errl aesthetic to the entire asset: UV pink and magenta gradients throughout, dripping paint effects on all surfaces, soft rounded shapes, liquid neon glow on all elements, holographic sheen, maple leaf motifs in neon, psychedelic softness, gel candy texture, festival goo energy. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Ellinia (Forest Green/Magical) → Errl: Acid Blue/Electric Cyan
  chibi: 'Apply Errl aesthetic to the entire asset: acid blue and electric cyan gradients throughout, cute chibi style neon glow, soft rounded curves, iridescent sheens, liquid highlights, pastels dipped in neon, friendly blob shapes, cosmic syrup texture. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Sleepywood (Dark Brown/Mysterious) → Errl: Lime Glow Yellow/Opalescent
  magic: 'Apply Errl aesthetic to the entire asset: lime glow yellow and opalescent purple gradients throughout, bright white glow, magical spell effects in neon, soft rounded shapes, holographic soap bubble skin, galaxy-sunset gradients, drippy cosmic effects. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Perion (Desert Orange/Brown) → Errl: Opalescent Purple/Acid Blue
  fire: 'Apply Errl aesthetic to the entire asset: opalescent purple and acid blue gradients throughout, burning neon effects, soft rounded flames, liquid chrome structures, rainbow oil-slick surfaces, gel candy texture, festival lantern glow. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // El Nath (Ice Blue/White) → Errl: UV Pink/Opalescent Orange
  ice: 'Apply Errl aesthetic to the entire asset: UV pink and opalescent orange gradients throughout, frozen neon effects, soft rounded ice shapes, iridescent sheens, liquid highlights, pastel fog, cosmic swirls, melted gummy bear texture. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Kerning City (Dark Urban) → Errl: Lime Glow Yellow/Emerald
  shadow: 'Apply Errl aesthetic to the entire asset: lime glow yellow and emerald with internal light throughout, neon shadows, soft rounded shapes, stealth effects in bright neon, liquid chrome structures, holographic surfaces, festival glow. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Leafre (Dragon Red/Orange) → Errl: Acid Blue/Electric Cyan
  warrior: 'Apply Errl aesthetic to the entire asset: acid blue and electric cyan gradients throughout, heavy neon armor effects, soft rounded shapes, liquid highlights, opalescent purples, gel candy texture, cosmic syrup, friendly blob aesthetic. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Mu Lung (Martial Arts Brown/Earth) → Errl: Bright Cyan/Teal
  archer: 'Apply Errl aesthetic to the entire asset: bright cyan and teal gradients throughout, bow with neon trails, soft rounded shapes, iridescent sheens, pastels dipped in neon, liquid highlights, holographic soap bubble skin, festival goo energy. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Nautilus (Pirate Brown/Wood) → Errl: Cyan/Teal
  pirate: 'Apply Errl aesthetic to the entire asset: cyan and teal gradients throughout, nautical neon effects, soft rounded shapes, liquid chrome structures, rainbow oil-slick surfaces, gel candy texture, cosmic swirls, drippy cosmic effects. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Ariant (Desert Sand/Brown) → Errl: Electric Blue/Opalescent Purple
  neon: 'Apply Errl aesthetic to the entire asset: electric blue and opalescent purple gradients throughout, cyberpunk urban style, vibrant neon overload, soft rounded shapes, holographic sheens, liquid highlights, festival lantern glow, psychedelic softness. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Classic MapleStory (Pixel Art) → Errl: Glitchy Neon Pixels
  pixel: 'Apply Errl aesthetic to the entire asset: glitchy neon pixels throughout, chunky neon blocks, soft rounded pixel shapes, UV pink and acid blue gradients, liquid highlights, holographic sheens, festival goo energy, cosmic syrup texture. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Aqua Road (Underwater Blue) → Errl: Opalescent Orange/UV Pink
  crystal: 'Apply Errl aesthetic to the entire asset: opalescent orange and UV pink gradients throughout, prismatic neon refraction, soft rounded crystal shapes, iridescent sheens, rainbow oil-slick surfaces, gel candy texture, cosmic swirls, liquid chrome. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Ludibrium (Toy Colorful) → Errl: Dark Glitch with Neon
  glitch: 'Apply Errl aesthetic to the entire asset: dark glitch effects with neon accents throughout, digital corruption in soft rounded shapes, UV pink and acid blue gradients, liquid highlights, holographic sheens, festival goo energy, cosmic syrup. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Magatia (Alchemy Dark/Purple) → Errl: Bright Gold/Lime Glow
  void: 'Apply Errl aesthetic to the entire asset: bright gold and lime glow yellow gradients throughout, ethereal glow in vibrant colors, soft rounded shapes, opalescent purples, iridescent sheens, liquid highlights, cosmic swirls, festival lantern glow. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Herb Town (Poison Green/Nature) → Errl: UV Pink Toxic
  toxic: 'Apply Errl aesthetic to the entire asset: UV pink toxic glow throughout, radioactive neon effects, soft rounded shapes, acid blue accents, holographic sheens, liquid highlights, pastels dipped in neon, festival goo energy, cosmic syrup. Transform the colors and style of the whole asset while keeping the same structure and pose.',
  
  // Orbis (Sky White/Blue) → Errl: Opalescent Purple Vapor
  vapor: 'Apply Errl aesthetic to the entire asset: opalescent purple vaporwave gradients throughout, synthwave in neon, soft rounded shapes, iridescent sheens, liquid chrome structures, rainbow oil-slick surfaces, cosmic swirls, festival lantern glow. Transform the colors and style of the whole asset while keeping the same structure and pose.'
};

// Preset size mapping based on ASSET_SIZES.md
export const PRESET_SIZES: Record<string, { width: number; height: number }> = {
  'slime-base': { width: 32, height: 24 }, // Slime: 32x24
  'mushroom-base': { width: 32, height: 32 }, // Monster base size
  'pig-base': { width: 32, height: 32 }, // NPC Base: 32x32
  'stump-base': { width: 32, height: 32 }, // Monster base size
  'potion-red': { width: 32, height: 32 }, // Item Icons: 32x32
  'platform-brick': { width: 32, height: 32 } // Base Tile Size: 32x32
};

// Style button configuration with area names and color schemes
export const STYLE_BUTTON_CONFIG: Record<keyof typeof STYLE_MODIFIERS, {
  label: string;
  area: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    selectedBg: string;
    selectedBorder: string;
    selectedText: string;
  };
}> = {
  maple: {
    label: 'Henesys',
    area: 'Henesys',
    colors: {
      bg: 'rgba(157, 23, 77, 0.2)',
      border: 'rgba(236, 72, 153, 0.5)',
      text: 'rgb(251, 182, 206)',
      selectedBg: 'rgba(219, 39, 119, 0.3)',
      selectedBorder: 'rgba(244, 114, 182, 1)',
      selectedText: 'rgb(252, 231, 243)'
    }
  },
  chibi: {
    label: 'Ellinia',
    area: 'Ellinia',
    colors: {
      bg: 'rgba(22, 78, 99, 0.2)',
      border: 'rgba(34, 211, 238, 0.5)',
      text: 'rgb(165, 243, 252)',
      selectedBg: 'rgba(8, 145, 178, 0.3)',
      selectedBorder: 'rgba(34, 211, 238, 1)',
      selectedText: 'rgb(207, 250, 254)'
    }
  },
  magic: {
    label: 'Sleepy',
    area: 'Sleepywood',
    colors: {
      bg: 'rgba(113, 63, 18, 0.2)',
      border: 'rgba(234, 179, 8, 0.5)',
      text: 'rgb(253, 224, 71)',
      selectedBg: 'rgba(202, 138, 4, 0.3)',
      selectedBorder: 'rgba(250, 204, 21, 1)',
      selectedText: 'rgb(254, 249, 195)'
    }
  },
  fire: {
    label: 'Perion',
    area: 'Perion',
    colors: {
      bg: 'rgba(88, 28, 135, 0.2)',
      border: 'rgba(168, 85, 247, 0.5)',
      text: 'rgb(221, 214, 254)',
      selectedBg: 'rgba(147, 51, 234, 0.3)',
      selectedBorder: 'rgba(192, 132, 252, 1)',
      selectedText: 'rgb(243, 232, 255)'
    }
  },
  ice: {
    label: 'El Nath',
    area: 'El Nath',
    colors: {
      bg: 'rgba(154, 52, 18, 0.2)',
      border: 'rgba(249, 115, 22, 0.5)',
      text: 'rgb(254, 215, 170)',
      selectedBg: 'rgba(234, 88, 12, 0.3)',
      selectedBorder: 'rgba(251, 146, 60, 1)',
      selectedText: 'rgb(255, 237, 213)'
    }
  },
  shadow: {
    label: 'Kerning',
    area: 'Kerning',
    colors: {
      bg: 'rgba(20, 83, 45, 0.2)',
      border: 'rgba(34, 197, 94, 0.5)',
      text: 'rgb(187, 247, 208)',
      selectedBg: 'rgba(22, 163, 74, 0.3)',
      selectedBorder: 'rgba(74, 222, 128, 1)',
      selectedText: 'rgb(209, 250, 229)'
    }
  },
  warrior: {
    label: 'Leafre',
    area: 'Leafre',
    colors: {
      bg: 'rgba(30, 58, 138, 0.2)',
      border: 'rgba(59, 130, 246, 0.5)',
      text: 'rgb(191, 219, 254)',
      selectedBg: 'rgba(37, 99, 235, 0.3)',
      selectedBorder: 'rgba(96, 165, 250, 1)',
      selectedText: 'rgb(219, 234, 254)'
    }
  },
  archer: {
    label: 'MuLung',
    area: 'Mu Lung',
    colors: {
      bg: 'rgba(22, 78, 99, 0.2)',
      border: 'rgba(34, 211, 238, 0.5)',
      text: 'rgb(165, 243, 252)',
      selectedBg: 'rgba(8, 145, 178, 0.3)',
      selectedBorder: 'rgba(34, 211, 238, 1)',
      selectedText: 'rgb(207, 250, 254)'
    }
  },
  pirate: {
    label: 'Naut',
    area: 'Nautilus',
    colors: {
      bg: 'rgba(19, 78, 74, 0.2)',
      border: 'rgba(20, 184, 166, 0.5)',
      text: 'rgb(153, 246, 228)',
      selectedBg: 'rgba(15, 118, 110, 0.3)',
      selectedBorder: 'rgba(45, 212, 191, 1)',
      selectedText: 'rgb(204, 251, 241)'
    }
  },
  neon: {
    label: 'Ariant',
    area: 'Ariant',
    colors: {
      bg: 'rgba(30, 58, 138, 0.2)',
      border: 'rgba(59, 130, 246, 0.5)',
      text: 'rgb(191, 219, 254)',
      selectedBg: 'rgba(37, 99, 235, 0.3)',
      selectedBorder: 'rgba(96, 165, 250, 1)',
      selectedText: 'rgb(219, 234, 254)'
    }
  },
  pixel: {
    label: 'Classic',
    area: 'Classic',
    colors: {
      bg: 'rgba(55, 48, 163, 0.2)',
      border: 'rgba(99, 102, 241, 0.5)',
      text: 'rgb(199, 210, 254)',
      selectedBg: 'rgba(67, 56, 202, 0.3)',
      selectedBorder: 'rgba(129, 140, 248, 1)',
      selectedText: 'rgb(224, 231, 255)'
    }
  },
  crystal: {
    label: 'Aqua',
    area: 'Aqua Road',
    colors: {
      bg: 'rgba(154, 52, 18, 0.2)',
      border: 'rgba(249, 115, 22, 0.5)',
      text: 'rgb(254, 215, 170)',
      selectedBg: 'rgba(234, 88, 12, 0.3)',
      selectedBorder: 'rgba(251, 146, 60, 1)',
      selectedText: 'rgb(255, 237, 213)'
    }
  },
  glitch: {
    label: 'Ludi',
    area: 'Ludibrium',
    colors: {
      bg: 'rgba(17, 24, 39, 0.2)',
      border: 'rgba(107, 114, 128, 0.5)',
      text: 'rgb(209, 213, 219)',
      selectedBg: 'rgba(75, 85, 99, 0.3)',
      selectedBorder: 'rgba(156, 163, 175, 1)',
      selectedText: 'rgb(229, 231, 235)'
    }
  },
  void: {
    label: 'Magatia',
    area: 'Magatia',
    colors: {
      bg: 'rgba(113, 63, 18, 0.2)',
      border: 'rgba(234, 179, 8, 0.5)',
      text: 'rgb(253, 224, 71)',
      selectedBg: 'rgba(202, 138, 4, 0.3)',
      selectedBorder: 'rgba(250, 204, 21, 1)',
      selectedText: 'rgb(254, 249, 195)'
    }
  },
  toxic: {
    label: 'Herb',
    area: 'Herb Town',
    colors: {
      bg: 'rgba(157, 23, 77, 0.2)',
      border: 'rgba(236, 72, 153, 0.5)',
      text: 'rgb(251, 182, 206)',
      selectedBg: 'rgba(219, 39, 119, 0.3)',
      selectedBorder: 'rgba(244, 114, 182, 1)',
      selectedText: 'rgb(252, 231, 243)'
    }
  },
  vapor: {
    label: 'Orbis',
    area: 'Orbis',
    colors: {
      bg: 'rgba(91, 33, 182, 0.2)',
      border: 'rgba(167, 139, 250, 0.5)',
      text: 'rgb(221, 214, 254)',
      selectedBg: 'rgba(124, 58, 237, 0.3)',
      selectedBorder: 'rgba(196, 181, 253, 1)',
      selectedText: 'rgb(237, 233, 254)'
    }
  }
};
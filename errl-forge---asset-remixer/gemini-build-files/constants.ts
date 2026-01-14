import { Preset } from './types';

export const ASSET_PRESETS: Preset[] = [
  {
    id: 'slime-base',
    name: 'Green Slime',
    type: 'monster',
    basePrompt: 'A cute green slime monster, round gelatinous body, simple face, 2d game sprite, maple story style, white background'
  },
  {
    id: 'mushroom-base',
    name: 'Orange Mushroom',
    type: 'monster',
    basePrompt: 'An orange mushroom monster with spots, cute face, bouncing, 2d game sprite, maple story style, white background'
  },
  {
    id: 'pig-base',
    name: 'Red Ribbon Pig',
    type: 'monster',
    basePrompt: 'A pink pig with a red ribbon, angry expression, 2d game sprite, side scrolling, maple story style, white background'
  },
  {
    id: 'stump-base',
    name: 'Tree Stump',
    type: 'monster',
    basePrompt: 'An animated tree stump with a face, wooden texture, spooky, 2d game sprite, side scrolling, maple story style, white background'
  },
  {
    id: 'potion-red',
    name: 'Health Potion',
    type: 'item',
    basePrompt: 'A red glass potion bottle, glowing liquid, pixel art style, high quality 2d icon, maple story style, white background'
  },
  {
    id: 'platform-brick',
    name: 'Brick Platform',
    type: 'platform',
    basePrompt: 'A seamless brick platform block, mossy, floating island aesthetic, 2d game tile, maple story style'
  }
];

export const STYLE_MODIFIERS = {
  neon: 'neon glowing outlines, cyberpunk aesthetic, high contrast, vibrant colors',
  drip: 'melting texture, gooey drips, liquid effects, graffiti style, street art aesthetic',
  glitch: 'digital glitch effects, chromatic aberration, distorted pixels, corrupt data aesthetic',
  void: 'dark purple and black color scheme, cosmic stars, ethereal glow, shadow monster'
};
import React from 'react';
import { MapleCategory } from '../types';
import { Skull, User, Cat, Map as MapIcon, Box, Shield, Smile, Glasses, Gem, Sparkles, Hand, Footprints, Circle, Heart, Sword } from 'lucide-react';

export const mainCategories: { id: MapleCategory; label: string; icon: React.FC<any> }[] = [
  { id: 'mob', label: 'Mobs', icon: Skull },
  { id: 'npc', label: 'NPCs', icon: User },
  { id: 'pet', label: 'Pets', icon: Cat },
  { id: 'map', label: 'Maps', icon: MapIcon },
  { id: 'item', label: 'Items', icon: Box },
  { id: 'equip', label: 'Equip', icon: Shield },
  { id: 'character', label: 'Character', icon: User },
];

export const itemSubcategories: { id: MapleCategory; label: string; icon: React.FC<any> }[] = [
  { id: 'glasses', label: 'Glasses', icon: Glasses },
  { id: 'earrings', label: 'Earrings', icon: Gem },
  { id: 'hat', label: 'Hat', icon: Box },
  { id: 'cape', label: 'Cape', icon: Sparkles },
  { id: 'top', label: 'Top', icon: Box },
  { id: 'bottom', label: 'Bottom', icon: Box },
  { id: 'overall', label: 'Overall', icon: Box },
  { id: 'gloves', label: 'Gloves', icon: Hand },
  { id: 'shoes', label: 'Shoes', icon: Footprints },
  { id: 'ring', label: 'Ring', icon: Circle },
  { id: 'pendant', label: 'Pendant', icon: Heart },
];

export const characterSubcategories: { id: MapleCategory; label: string; icon: React.FC<any> }[] = [
  { id: 'face', label: 'Face', icon: Smile },
  { id: 'skin', label: 'Skin', icon: User },
  { id: 'pose', label: 'Pose', icon: User },
  { id: 'hair', label: 'Hair', icon: User },
];

export const equipSubcategories: { id: MapleCategory; label: string; icon: React.FC<any> }[] = [
  { id: 'weapon', label: 'Weapon', icon: Sword },
  { id: 'armor', label: 'Armor', icon: Shield },
  { id: 'shield', label: 'Shield', icon: Shield },
];

export const mapSubcategories: { id: string; label: string; searchQuery: string; icon: React.FC<any> }[] = [
  { id: 'henesys', label: 'Henesys', searchQuery: 'Henesys', icon: MapIcon },
  { id: 'ellinia', label: 'Ellinia', searchQuery: 'Ellinia', icon: MapIcon },
  { id: 'perion', label: 'Perion', searchQuery: 'Perion', icon: MapIcon },
  { id: 'kerning', label: 'Kerning', searchQuery: 'Kerning', icon: MapIcon },
  { id: 'sleepywood', label: 'Sleepywood', searchQuery: 'Sleepywood', icon: MapIcon },
  { id: 'elNath', label: 'El Nath', searchQuery: 'El Nath', icon: MapIcon },
  { id: 'ludibrium', label: 'Ludibrium', searchQuery: 'Ludibrium', icon: MapIcon },
  { id: 'orbis', label: 'Orbis', searchQuery: 'Orbis', icon: MapIcon },
  { id: 'ariant', label: 'Ariant', searchQuery: 'Ariant', icon: MapIcon },
  { id: 'leafre', label: 'Leafre', searchQuery: 'Leafre', icon: MapIcon },
  { id: 'mulung', label: 'Mulung', searchQuery: 'Mulung', icon: MapIcon },
  { id: 'herbTown', label: 'Herb Town', searchQuery: 'Herb Town', icon: MapIcon },
];

export const allCategories = [...mainCategories, ...itemSubcategories, ...characterSubcategories];


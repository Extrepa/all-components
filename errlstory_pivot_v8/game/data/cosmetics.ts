
export interface CosmeticDefinition {
    id: string;
    name: string;
    type: 'hat' | 'aura' | 'trail' | 'bodyColor';
    cost: number;
    description: string;
    color?: string; 
}

export const COSMETICS: Record<string, CosmeticDefinition> = {
    // Hats
    'hat_crown': {
        id: 'hat_crown',
        name: 'Paper Crown',
        type: 'hat',
        cost: 500,
        description: 'Fit for a (slime) king.',
        color: '#ffd700'
    },
    'hat_viking': {
        id: 'hat_viking',
        name: 'Viking Helm',
        type: 'hat',
        cost: 750,
        description: 'For the warrior spirit.',
        color: '#ccc'
    },
    'hat_cowboy': {
        id: 'hat_cowboy',
        name: 'Rancher Hat',
        type: 'hat',
        cost: 400,
        description: 'Yee-haw!',
        color: '#8B4513'
    },

    // Body Colors
    'color_midnight': {
        id: 'color_midnight',
        name: 'Midnight Paint',
        type: 'bodyColor',
        cost: 250,
        description: 'Dark as the night.',
        color: '#191970'
    },
    'color_crimson': {
        id: 'color_crimson',
        name: 'Crimson Paint',
        type: 'bodyColor',
        cost: 250,
        description: 'Fierce red.',
        color: '#DC143C'
    },
    'color_gold': {
        id: 'color_gold',
        name: 'Gold Paint',
        type: 'bodyColor',
        cost: 1000,
        description: 'Shiny and chrome.',
        color: '#DAA520'
    },

    // Auras
    'aura_fire': {
        id: 'aura_fire',
        name: 'Burning Aura',
        type: 'aura',
        cost: 1500,
        description: 'You are on fire. Literally.',
        color: '#ff4500'
    },
    'aura_ice': {
        id: 'aura_ice',
        name: 'Frost Aura',
        type: 'aura',
        cost: 1500,
        description: 'Chill out.',
        color: '#00ffff'
    },

    // Trails
    'trail_rainbow': {
        id: 'trail_rainbow',
        name: 'Rainbow Trail',
        type: 'trail',
        cost: 2500,
        description: 'Dash with pride.',
    }
};

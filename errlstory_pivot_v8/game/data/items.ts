// Item descriptions with Flash-game sarcastic humor

export const ITEM_DESCRIPTIONS: Record<string, string> = {
  // Consumables
  'potion': "Red goo in a bottle. Probably safe.",
  'ether': "Blue goo in a bottle. Tastes like static.",
  
  // Equipment
  'iron_sword': "Pointy metal stick. Very effective against goo.",
  'leather_armor': "Made from real leather. The slimes are not happy.",
  
  // Cosmetics (these already have descriptions in cosmetics.ts, but we can override for humor)
  'hat_crown': "Fit for a (slime) king. Made of paper.",
  'hat_viking': "For the warrior spirit. Horns not included.",
  'hat_cowboy': "Yee-haw! Now you're a real goo-slinger.",
  
  'color_midnight': "Dark as the night. And your soul.",
  'color_crimson': "Fierce red. Warning: may attract bulls.",
  'color_gold': "Shiny and chrome. Worthless, but shiny.",
  
  'aura_fire': "You are on fire. Literally. Please seek help.",
  'aura_ice': "Chill out. No, really. You're freezing.",
  
  'trail_rainbow': "Dash with pride. And rainbows.",
  
  // Misc items
  'goo': "Slightly illegal in 12 provinces.",
  'slime_jelly': "The forbidden snack. Don't ask where it came from.",
};

// Helper function to get description, with fallback
export function getItemDescription(itemId: string, defaultDesc?: string): string {
  return ITEM_DESCRIPTIONS[itemId] || defaultDesc || "No description available. It's a mystery.";
}


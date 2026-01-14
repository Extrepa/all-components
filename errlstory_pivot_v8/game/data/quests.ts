
export type QuestType = 'KILL' | 'COLLECT';

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  npcName: string; // Who gives/completes this
  type: QuestType;
  targetId?: string; // Mob ID (for KILL)
  targetLabel?: string; // UI Label for what to hunt/collect (e.g. "Slimes")
  targetCount: number;
  prereq?: string[]; // List of Quest IDs required
  rewards: {
    xp: number;
    goo?: number;
    items?: { id: string; count: number }[];
  };
  dialogue: {
    start: string[];    // When accepting
    active: string[];   // When in progress
    complete: string[]; // When turning in
  };
}

export const QUESTS: Record<string, QuestDefinition> = {
  'q_slime_hunt': {
    id: 'q_slime_hunt',
    name: "Errl's First Hunt",
    description: "Defeat 5 Slimes in the Field.",
    npcName: "Elder Errl",
    type: 'KILL',
    targetId: 'slime',
    targetLabel: "Slimes",
    targetCount: 5,
    rewards: {
      xp: 150,
      goo: 10
    },
    dialogue: {
      start: [
        "Greetings, young Errl.",
        "The Slimes in the hills have gone mad! They are bouncing everywhere!",
        "I need you to thin their numbers. Defeat 5 Slimes to prove your strength."
      ],
      active: [
        "The Slimes are still hopping about.",
        "Return to me when you have defeated 5 of them."
      ],
      complete: [
        "Splendid work!",
        "The town is safer now thanks to you.",
        "Here is a small reward for your trouble."
      ]
    }
  },
  'q_goo_gather': {
    id: 'q_goo_gather',
    name: "Goo Gatherer",
    description: "Collect 10 Goo Bits.",
    npcName: "Elder Errl",
    type: 'COLLECT', // Special case: checks player.gooBits
    targetLabel: "Goo Bits",
    targetCount: 10,
    prereq: ['q_slime_hunt'],
    rewards: {
      xp: 300,
      items: [{ id: 'potion', count: 3 }]
    },
    dialogue: {
      start: [
        "We need resources to repair the town walls.",
        "The Slimes drop Goo Bits when defeated.",
        "Bring me 10 Goo Bits. You can keep the rest you find!"
      ],
      active: [
        "I need 10 Goo Bits for the mortar.",
        "Check your pockets, do you have enough?"
      ],
      complete: [
        "Excellent! This is high quality goo.",
        "Take these potions. You will need them for what comes next."
      ]
    }
  },
  'q_royal_rumble': {
    id: 'q_royal_rumble',
    name: "Royal Trouble",
    description: "Defeat the Royal Slime in the Arena.",
    npcName: "Elder Errl",
    type: 'KILL',
    targetId: 'royal_slime',
    targetLabel: "Royal Slime",
    targetCount: 1,
    prereq: ['q_goo_gather'],
    rewards: {
      xp: 1000,
      goo: 200,
      items: [{ id: 'ether', count: 5 }]
    },
    dialogue: {
      start: [
        "I have grave news.",
        "The Royal Slime has awakened in the Arena (Right Portal).",
        "It is the source of all this chaos. You must defeat it!",
        "Be careful, it is much stronger than normal slimes."
      ],
      active: [
        "The Royal Slime still rules the Arena.",
        "Use your Magic [X] and Potions [H] wisely."
      ],
      complete: [
        "You did it! The Royal Slime is no more!",
        "You are truly the hero of Mayday Plaza.",
        "Rest now, Errl. You have earned it."
      ]
    }
  }
};

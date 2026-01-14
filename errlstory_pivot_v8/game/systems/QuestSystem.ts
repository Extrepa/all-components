
import { Game } from "../core/Game";
import { QUESTS, QuestDefinition } from "../data/quests";
import { QuestProgress } from "../../types";

export type InteractionResult = 
  | { type: 'NONE', lines: string[] }
  | { type: 'TALK', lines: string[], action?: () => void }
  | { type: 'OFFER', lines: string[], questId: string, onAccept: () => void };

export class QuestSystem {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Called when interacting with an NPC.
   */
  public interact(npcName: string): InteractionResult {
    const log = this.game.state.questLog;
    
    // 1. Check for Quests to Turn In (Active & Ready)
    const turnIn = log.active.find(q => {
      const def = QUESTS[q.id];
      return def && def.npcName === npcName && q.isReadyToTurnIn;
    });

    if (turnIn) {
      const def = QUESTS[turnIn.id];
      return {
        type: 'TALK',
        lines: def.dialogue.complete,
        action: () => this.complete(turnIn.id)
      };
    }

    // 2. Check for New Available Quests (OFFER)
    const availableId = Object.keys(QUESTS).find(qid => {
      if (log.completed.includes(qid)) return false;
      if (log.active.find(q => q.id === qid)) return false;
      
      const def = QUESTS[qid];
      if (def.npcName !== npcName) return false;
      
      // Check Prereqs
      if (def.prereq) {
        for (const pid of def.prereq) {
          if (!log.completed.includes(pid)) return false;
        }
      }
      return true;
    });

    if (availableId) {
      const def = QUESTS[availableId];
      // Here we return an OFFER type, the UI will attach the Accept button to the onAccept callback
      return {
        type: 'OFFER',
        lines: def.dialogue.start,
        questId: availableId,
        onAccept: () => this.accept(availableId)
      };
    }

    // 3. Check for Active (In Progress) Quests
    const active = log.active.find(q => {
      const def = QUESTS[q.id];
      return def && def.npcName === npcName;
    });

    if (active) {
       const def = QUESTS[active.id];
       // Special check for COLLECT type (Goo) to see if we update status dynamically
       if (def.type === 'COLLECT' && !active.isReadyToTurnIn) {
           this.checkCollect(); // Force check
           if (active.isReadyToTurnIn) {
               // If it just became ready, recurse to get Turn In dialogue
               return this.interact(npcName);
           }
       }
       
       return { 
           type: 'TALK',
           lines: def.dialogue.active 
       };
    }

    // 4. Default / No Quest
    return {
      type: 'TALK',
      lines: ["Greetings, Errl. Stay safe out there."]
    };
  }

  public getMarker(npcName: string): '!' | '?' | null {
    const log = this.game.state.questLog;

    // Ready to Turn In?
    const turnIn = log.active.find(q => {
      const def = QUESTS[q.id];
      return def && def.npcName === npcName && q.isReadyToTurnIn;
    });
    if (turnIn) return '?'; // Gold ?

    // Active (Waiting)?
    const active = log.active.find(q => {
      const def = QUESTS[q.id];
      return def && def.npcName === npcName;
    });
    if (active) {
        // Update collect status
        if (QUESTS[active.id].type === 'COLLECT') this.checkCollect();
        if (active.isReadyToTurnIn) return '?'; // Gold ?
        return '?'; // Grey ? (Handled in render by color override)
    }

    // Available?
    const available = Object.keys(QUESTS).find(qid => {
      if (log.completed.includes(qid)) return false;
      if (log.active.find(q => q.id === qid)) return false;
      const def = QUESTS[qid];
      if (def.npcName !== npcName) return false;
      if (def.prereq) {
        for (const pid of def.prereq) {
          if (!log.completed.includes(pid)) return false;
        }
      }
      return true;
    });
    if (available) return '!';

    return null;
  }

  public isMarkerGrey(npcName: string): boolean {
      // Helper to distinguish between active-incomplete (?) and active-complete (?)
      const log = this.game.state.questLog;
      const active = log.active.find(q => QUESTS[q.id].npcName === npcName);
      if (active && !active.isReadyToTurnIn) return true;
      return false;
  }

  public accept(id: string) {
    const def = QUESTS[id];
    if (!def) return;

    this.game.state.questLog.active.push({
      id,
      progress: 0,
      isReadyToTurnIn: false
    });
    
    // Initial check for collect quests (might already have items)
    if (def.type === 'COLLECT') {
        this.checkCollect();
    }
    
    this.game.saveSystem.save(this.game.state);
    this.game.audio.playSfx('collect'); // Sound feedback
  }

  public complete(id: string) {
    const log = this.game.state.questLog;
    const idx = log.active.findIndex(q => q.id === id);
    if (idx === -1) return;

    const def = QUESTS[id];
    
    // Remove from active
    log.active.splice(idx, 1);
    // Add to completed
    log.completed.push(id);

    // Rewards
    if (def.rewards.xp) this.game.gainXp(def.rewards.xp);
    if (def.rewards.goo) this.game.state.player.gooBits += def.rewards.goo;
    if (def.rewards.items) {
        for (const itemReward of def.rewards.items) {
            this.game.addItem({ 
                id: itemReward.id, 
                count: itemReward.count, 
                // Hydrate name/type based on known items (simplified here)
                name: itemReward.id === 'potion' ? 'Red Potion' : 'Ether',
                type: 'consumable' 
            });
        }
    }
    
    // For collect quests, do we consume the items?
    // "Bring me 10 Goo Bits". Usually implies taking them.
    if (def.type === 'COLLECT' && def.id === 'q_goo_gather') {
        this.game.state.player.gooBits -= def.targetCount;
    }

    this.game.audio.playSfx('levelup'); // Use levelup sound for quest complete fanfare
    this.game.saveSystem.save(this.game.state);
  }

  public onKill(mobId: string) {
    const log = this.game.state.questLog;
    
    for (const q of log.active) {
      const def = QUESTS[q.id];
      if (def.type === 'KILL' && def.targetId === mobId && !q.isReadyToTurnIn) {
        q.progress++;
        if (q.progress >= def.targetCount) {
          q.progress = def.targetCount;
          q.isReadyToTurnIn = true;
          // Notification? "Quest Ready!"
        }
      }
    }
  }

  public checkCollect() {
    const log = this.game.state.questLog;
    const p = this.game.state.player;

    for (const q of log.active) {
      const def = QUESTS[q.id];
      if (def.type === 'COLLECT') {
          // Hardcoded check for Goo Quest for now, can be genericized later
          if (def.id === 'q_goo_gather') {
              q.progress = p.gooBits;
              if (q.progress >= def.targetCount) {
                  q.isReadyToTurnIn = true;
              } else {
                  q.isReadyToTurnIn = false;
              }
          }
      }
    }
  }
}

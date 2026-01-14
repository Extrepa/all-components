
import { Game } from "../core/Game";
import { DailyChallengeState } from "../../types";

export class DailyChallengeSystem {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    const current = this.game.state.daily;

    if (!current || current.date !== today) {
      this.generateNewChallenge(today);
    }
  }

  private generateNewChallenge(date: string): void {
    const rand = Math.random();
    let challenge: DailyChallengeState;

    if (rand < 0.33) {
      // 1. Slime Rush (Timed)
      challenge = {
        date,
        id: `daily_${date}_slime`,
        type: 'KILL',
        description: "Ritual: Slay 5 Slimes in 60s",
        target: 5,
        progress: 0,
        isCompleted: false,
        rewardClaimed: false,
        timeLimit: 60,
        timer: 60
      };
    } else if (rand < 0.66) {
      // 2. Goo Hoard
      challenge = {
        date,
        id: `daily_${date}_goo`,
        type: 'COLLECT',
        description: "Ritual: Collect 20 Goo Bits",
        target: 20,
        progress: 0,
        isCompleted: false,
        rewardClaimed: false
      };
    } else {
      // 3. Boss
      challenge = {
        date,
        id: `daily_${date}_boss`,
        type: 'BOSS',
        description: "Ritual: Defeat the Royal Slime",
        target: 1,
        progress: 0,
        isCompleted: false,
        rewardClaimed: false
      };
    }

    this.game.state.daily = challenge;
    this.game.saveSystem.save(this.game.state);
  }

  public update(dt: number): void {
    const daily = this.game.state.daily;
    if (daily.isCompleted) return;

    // Handle Timer
    if (daily.timeLimit !== undefined && daily.timer !== undefined) {
       // Only run timer if we have made SOME progress
       if (daily.progress > 0) {
           daily.timer -= dt;
           if (daily.timer <= 0) {
               daily.progress = 0;
               daily.timer = daily.timeLimit;
               // Fail sound?
           }
       }
    }
  }

  public onKill(mobId: string): void {
    const daily = this.game.state.daily;
    if (daily.isCompleted) return;

    if (daily.type === 'KILL' && mobId === 'slime') {
        daily.progress++;
        this.checkCompletion();
    } else if (daily.type === 'BOSS' && mobId === 'royal_slime') {
        daily.progress++;
        this.checkCompletion();
    }
  }

  public onCollect(amount: number): void {
    const daily = this.game.state.daily;
    if (daily.isCompleted) return;

    if (daily.type === 'COLLECT') {
        daily.progress += amount;
        this.checkCompletion();
    }
  }

  private checkCompletion(): void {
      const daily = this.game.state.daily;
      if (daily.progress >= daily.target) {
          daily.progress = daily.target;
          daily.isCompleted = true;
          // Just notify here, do not auto-claim
          this.game.audio.playSfx('collect'); 
          this.game.saveSystem.save(this.game.state);
      }
  }

  public claimReward(): void {
      const daily = this.game.state.daily;
      if (daily.rewardClaimed) return;

      daily.rewardClaimed = true;
      
      // Rewards
      this.game.gainXp(300);
      this.game.state.player.gooBits += 50;
      
      // FX
      this.game.audio.playSfx('levelup');
      const p = this.game.state.player;
      // Should ideally spawn particles near UI, but player location is fine for feedback
      // Or spawn floating text via FieldScene/TownScene? 
      // For now, sound + save is core logic.
      
      this.game.saveSystem.save(this.game.state);
  }
}

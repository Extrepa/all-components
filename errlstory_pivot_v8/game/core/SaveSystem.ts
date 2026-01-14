
import { GameState } from "../../types";

export class SaveSystem {
  private readonly SAVE_KEY = "errl_story_save_v1";

  public save(state: GameState): void {
    try {
      const json = JSON.stringify(state);
      localStorage.setItem(this.SAVE_KEY, json);
      console.log("Game Saved");
    } catch (e) {
      console.error("Failed to save game", e);
    }
  }

  public load(): GameState | null {
    try {
      const json = localStorage.getItem(this.SAVE_KEY);
      if (!json) return null;
      return JSON.parse(json) as GameState;
    } catch (e) {
      console.error("Failed to load game", e);
      return null;
    }
  }

  public hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}

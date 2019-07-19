import { gsMain, MainGameState } from "./gStates/gsMain";
import { gsStart, StartGameState } from "./gStates/gsStart";
// import gData from "./data";
// import store from "../../vuex/store";

export abstract class GameState {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract init(): void;
  abstract receiveInputText(text: string): void;
  abstract redraw(): void;
}

class GameStateManager {
  state?: GameState;

  StartGame() {
    this.state = gsStart;
    this.state.init();
  }

  receiveInputKeyUp(input: string) {
    if (this.state instanceof MainGameState) {
      this.state.keyUp(input);
    }
  }
  receiveInputKeyDown(input: string) {
    if (this.state instanceof MainGameState) {
      this.state.keyDown(input);
    }
  }
  receiveInputText(text: string) {
    console.log(text);
    if (this.state && this.state.receiveInputText) {
      this.state.receiveInputText(text);
    }
  }

  redraw() {
    if (this.state && this.state.redraw) {
      this.state.redraw();
    }
  }

  nextState(caller: GameState) {
    switch (caller.name) {
      case "start":
        this.state = gsMain;
        break;
      case "main":
        break;
      case "end":
        this.state = gsStart;
        break;
      default:
        console.error(`${caller.name} is not a registered game state.`);
    }
    this.state && this.state.init();
  }
}

export const gsMan = new GameStateManager();

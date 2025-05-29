import Character from "./character";
import { IO } from "./types";

/**
 * A Horatio Program
 */
export default class Program {
  io: IO;
  characters: { [key: string]: Character };
  parts: Function[][][];
  stage: Character[];
  globalBool: boolean | null;
  actIndex: number;
  sceneIndex: number;
  lineIndex: number;

  constructor(io: IO) {
    this.io = io;
    this.characters = {};
    this.parts = [];
    this.stage = [];
    this.globalBool = null;
    this.actIndex = 0;
    this.sceneIndex = 0;
    this.lineIndex = 0;
  }

  run(): number {
    let self = this;
    for (; self.actIndex < self.acts().length; self.nextAct()) {
      for (; self.sceneIndex < self.scenes().length; self.nextScene()) {
        for (; self.lineIndex < self.lines().length; self.nextLine()) {
          self.line().call(self);
        }
      }
    }
    return 0;
  }

  acts(): Function[][][] {
    return this.parts;
  }

  scenes(): Function[][] {
    return this.parts[this.actIndex]!!!;
  }

  lines(): Function[] {
    return this.parts[this.actIndex]!!![this.sceneIndex]!!!;
  }

  line(): Function {
    return this.parts[this.actIndex]!!![this.sceneIndex]!!![this.lineIndex]!!!;
  }

  nextAct(): void {
    this.actIndex = this.actIndex + 1;
    this.sceneIndex = 0;
    this.lineIndex = 0;
  }

  nextScene(): void {
    this.sceneIndex = this.sceneIndex + 1;
    this.lineIndex = 0;
  }

  nextLine(): void {
    this.lineIndex = this.lineIndex + 1;
  }

  gotoAct(n: number): void {
    this.actIndex = n;
    this.sceneIndex = 0;
    this.lineIndex = -1;
  }

  gotoScene(n: number): void {
    this.sceneIndex = n;
    this.lineIndex = -1;
  }

  runSub(act: number, start_scene: number, end_scene: number): number {
    let self = this;
    for (let s = start_scene; s < end_scene; s++) {
      for (let f = 0; f < self.parts[act]!!![s]!!!.length; f++) {
        self.parts[act]!!![s]!!![f]!!!.call(self);
      }
    }
    return 0;
  }

  declareCharacter(character_name: string): void {
    this.characters[character_name] = new Character(character_name);
  }

  newAct(): number {
    this.parts.push([]);
    return this.parts.length - 1;
  }

  newScene(act: number): number {
    this.parts[act]!!!.push([]);
    return this.parts[act]!!!.length - 1;
  }

  enterStage(character_name: string): void {
    const c = this.getChatacter(character_name);

    if (this.isOnStage(c)) {
      throw new Error(`Runtime Error: ${character_name} is already on stage`);
    } else {
      this.stage.push(c);
    }
  }

  exitStage(character_name: string): void {
    const c = this.getChatacter(character_name);

    if (this.isOnStage(c)) {
      this.stage.splice(this.stage.indexOf(c), 1);
    } else {
      throw new Error(
        `Runtime Error: ${character_name} is not on stage and consequently cannot exit`,
      );
    }
  }

  exeuntStage(): void {
    this.stage = [];
  }

  interlocutor(character_name: string): Character {
    let c = this.getChatacter(character_name);
    let i = this.stage.filter(function (n) {
      return n !== c;
    });
    
    if (i.length === 0) {
      throw new Error(`Runtime Error: ${character_name} is trying to speak, but there is nobody else on stage`);
    }
    
    if (i.length > 1) {
      throw new Error(`Runtime Error: ${character_name} is trying to speak, but there are too many characters on stage - it's ambiguous who is being addressed`);
    }
    
    return i[0]!!!;
  }

  addCommand(act: number, scene: number, command: Function): void {
    this.parts[act]!!![scene]!!!.push(command);
    let self = this;
  }


  isOnStage(character: Character): Character | undefined {
    return this.stage.find(
      (activeChar) => activeChar.name() == character.name(),
    );
  }

  getChatacter(character_name: string): Character {
    const c = this.characters[character_name];
    if (c) {
      return c;
    } else {
      throw new Error(`Runtime Error: ${character_name} does not exist`);
    }
  }

  setGlobalBool(b: boolean): void {
    this.globalBool = b;
  }

  getGlobalBool() {
    if (this.globalBool === null) {
      throw new Error(
        "Runtime Error: tried to execute a conditional with no prior question",
      );
    } else {
      return this.globalBool;
    }
  }
}

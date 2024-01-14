import Character from "./character";

/**
 * A Horatio Program
 */
export default class Program {
  constructor(io) {
    this.io = io;
    this.characters = {};
    this.parts = [];
    this.stage = [];
    this.globalBool = null;
    this.actIndex = 0;
    this.sceneIndex = 0;
    this.lineIndex = 0;
  }

  run() {
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

  acts() {
    return this.parts;
  }

  scenes() {
    return this.parts[this.actIndex];
  }

  lines() {
    return this.parts[this.actIndex][this.sceneIndex];
  }

  line() {
    return this.parts[this.actIndex][this.sceneIndex][this.lineIndex];
  }

  nextAct() {
    this.actIndex = this.actIndex + 1;
    this.sceneIndex = 0;
    this.lineIndex = 0;
  }

  nextScene() {
    this.sceneIndex = this.sceneIndex + 1;
    this.lineIndex = 0;
  }

  nextLine() {
    this.lineIndex = this.lineIndex + 1;
  }

  gotoScene(n) {
    this.sceneIndex = n;
    this.lineIndex = -1;
  }

  runSub(act, start_scene, end_scene) {
    let self = this;
    for (let s = start_scene; s < end_scene; s++) {
      for (let f = 0; f < self.parts[act][s].length; f++) {
        self.parts[act][s][f].call(self);
      }
    }
    return 0;
  }

  declareCharacter(character_name) {
    this.characters[character_name] = new Character(character_name);
  }

  newAct() {
    this.parts.push([]);
    return this.parts.length - 1;
  }

  newScene(act) {
    this.parts[act].push([]);
    return this.parts[act].length - 1;
  }

  enterStage(character_name) {
    let c = this.characters[character_name];
    this.stage.push(c);
  }

  exitStage(character_name) {
    let c = this.characters[character_name];
    this.stage.splice(this.stage.indexOf(c), 1);
  }

  exeuntStage() {
    this.stage = [];
  }

  interlocutor(character_name) {
    let c = this.characters[character_name];
    let i = this.stage.filter(function (n) {
      return n !== c;
    });
    return i[0];
  }

  addCommand(act, scene, command) {
    this.parts[act][scene].push(command);
    let self = this;
  }

  setGlobalBool(b) {
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

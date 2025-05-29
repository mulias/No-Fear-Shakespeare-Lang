import Semantics from "./semantics";
import * as Ast from "./ast";

/**
 * Horatio Checker
 */
export default class Checker extends Semantics {
  characters: { [key: string]: any };
  parts: { [key: string]: any };

  constructor() {
    super();
    this.characters = {};
    this.parts = {};
  }

  /**
   * Check
   */
  check(program: Ast.Program): void {
    program.visit(this, null);
  }

  /**
   * Character exists
   */
  declared(character: string): boolean {
    return this.characters.hasOwnProperty(character);
  }

  /**
   * Character on stage
   */
  onStage(character: string): boolean {
    if (this.declared(character)) {
      return this.characters[character];
    } else {
      return false;
    }
  }

  /**
   * Solo on stage?
   */
  solo(character: string): boolean {
    if (this.declared(character) && this.characters[character]) {
      for (let k in this.characters) {
        if (k !== character && this.characters[k] === true) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Toggle Stage presence
   */
  toggleStage(character: string): void {
    if (this.declared(character)) {
      this.characters[character] = !this.characters[character];
    }
  }

  /**
   * Exeunt all
   */
  exeuntStage(): void {
    for (let c in this.characters) {
      this.characters[c] = false;
    }
  }

  actExists(act: string): boolean {
    return !!this.parts[act];
  }

  /**
   * Scene exists
   */
  sceneExists(act: string, scene: string): boolean {
    if (!this.parts[act]) {
      return false;
    } else {
      return this.parts[act].indexOf(scene) !== -1;
    }
  }
}

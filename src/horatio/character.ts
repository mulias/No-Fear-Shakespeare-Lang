/**
 * Horatio Program Character
 */
export default class Character {
  private _name: string;
  private _value: number | null;
  private _memory: number[];

  constructor(name: string) {
    this._name = name;
    this._value = null;
    this._memory = [];
  }

  /**
   * @returns {string}
   */
  name(): string {
    return this._name;
  }

  /**
   * @returns {number|null}
   */
  value(): number | null {
    return this._value;
  }

  /**
   * @param {number} val
   */
  setValue(val: number): void {
    this._value = val;
  }

  /**
   * @returns {number}
   */
  memorySize(): number {
    return this._memory.length;
  }

  /**
   * @returns {boolean}
   */
  noMemory(): boolean {
    return this._memory.length === 0;
  }

  /**
   * @param {number}
   */
  remember(val: number): void {
    this._memory.push(val);
  }

  /**
   * set character value from top of stack
   */
  recall(): void {
    if (this.noMemory()) {
      throw new Error("Runtime Error - Trying to recall from empty stack.");
    } else {
      this._value = this._memory.pop()!!!;
    }
  }
}

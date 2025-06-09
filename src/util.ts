export class AssertNeverError extends Error {
  constructor(value: never) {
    super();
    this.message = `Expected branch to never happen, triggered by value: ${value}`;
    this.name = "AssertNeverError";
  }
}

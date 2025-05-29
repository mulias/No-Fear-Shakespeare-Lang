export interface IO {
  print(text: string): void;
  read(callback: (input: string) => void): void;
  debug: boolean;
  printDebug(text: string): void;
  clear(): void;
}

export interface IO {
  print(text: string): void;
  read_char(callback: (input: string) => void): void;
  read_int(callback: (input: string) => void): void;
  debug: boolean;
  printDebug(text: string): void;
  clear(): void;
}

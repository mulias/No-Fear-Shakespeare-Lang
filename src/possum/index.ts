import * as fs from "fs";
import * as Ast from "./ast";

type VM = symbol;

interface WasmLib {
  createVM: () => VM;
  interpret: (
    vm: VM,
    parserPtr: number,
    parserLen: number,
    inputPtr: number,
    inputLen: number,
  ) => void;
  alloc: (size: number) => number;
  dealloc: (ptr: number, len: number) => void;
  destroyVM: (vm: VM) => void;
  memory: any;
}

const wasmCode = fs.readFileSync("src/possum/possum.wasm");
const parser = fs.readFileSync("src/possum/nfspl.possum", { encoding: "utf8" });

export class Possum {
  encoder: TextEncoder;
  decoder: TextDecoder;

  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  async parse(input: string): Promise<Ast.Program> {
    var wasm: WasmLib;
    var out = "";
    var err = "";

    const importObject = {
      env: {
        writeOut: (ptr: number, len: number) => {
          const text = this.decoder.decode(
            new Uint8Array(wasm.memory.buffer.slice(ptr, ptr + len)),
          );
          out += text;
        },
        writeErr: (ptr: number, len: number) => {
          const text = this.decoder.decode(
            new Uint8Array(wasm.memory.buffer.slice(ptr, ptr + len)),
          );
          err += text;
        },
        writeDebug: (ptr: number, len: number) => {
          const text = this.decoder.decode(
            new Uint8Array(wasm.memory.buffer.slice(ptr, ptr + len)),
          );
          console.log(`[debug] ${text}`);
        },
      },
    };

    return WebAssembly.instantiate(wasmCode, importObject).then(
      (wasmModule) => {
        wasm = wasmModule.instance.exports as any;

        var parserSlice = this.allocateString(wasm, parser);
        var inputSlice = this.allocateString(wasm, input);

        var vm = wasm.createVM();
        wasm.interpret(
          vm,
          parserSlice.ptr,
          parserSlice.len,
          inputSlice.ptr,
          inputSlice.len,
        );
        wasm.dealloc(parserSlice.ptr, parserSlice.len);
        wasm.dealloc(inputSlice.ptr, inputSlice.len);
        wasm.destroyVM(vm);

        if (err.length > 0) {
          throw new Error(err);
        } else {
          return JSON.parse(out);
        }
      },
    );
  }

  allocateString(wasm: WasmLib, str: string) {
    // convert source to Uint8Array
    const sourceArray = this.encoder.encode(str);

    // get memory from wasm
    const len = sourceArray.length;

    const ptr = wasm.alloc(len);
    if (ptr === 0) throw "Cannot allocate memory";

    // copy sourceArray to wasm
    var memoryu8 = new Uint8Array(wasm.memory.buffer);
    for (let i = 0; i < len; ++i) {
      memoryu8[ptr + i] = sourceArray[i] as number;
    }

    return { ptr, len };
  }
}

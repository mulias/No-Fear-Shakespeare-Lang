import { Possum } from "./possum";
import { Ophelia } from "./ophelia";
import { Yorick } from "./yorick";
import Horatio from "./horatio/horatio";
import { prettyPrint as splPrettyPrint } from "./horatio/prettyPrint";
import { prettyPrint as nfsplPrettyPrint } from "./ophelia/prettyPrint";
import { Falstaff } from "./falstaff";
import type { IO } from "./horatio/types";

export function executeSpl(source: string, io: IO): void {
  const horatio = Horatio.fromSource(source, io);
  horatio.run();
}

export async function executeNfspl(source: string, io: IO): Promise<void> {
  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  const yorick = new Yorick(opheliaAst);
  const horatioAst = yorick.run();

  const horatio = Horatio.fromAst(horatioAst, io);
  horatio.run();
}

export async function transpileNfsplToSpl(source: string): Promise<string> {
  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  const yorick = new Yorick(opheliaAst);
  const horatioAst = yorick.run();

  return splPrettyPrint(horatioAst);
}

export function transpileSplToNfspl(source: string): string {
  const horatioAst = Horatio.parse(source);
  const falstaff = new Falstaff(horatioAst);
  const opheliaAst = falstaff.run();

  return nfsplPrettyPrint(opheliaAst);
}

export function formatSpl(source: string): string {
  return splPrettyPrint(Horatio.parse(source));
}

export async function formatNfspl(source: string): Promise<string> {
  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  return nfsplPrettyPrint(opheliaAst);
}

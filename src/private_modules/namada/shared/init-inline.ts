import initWasm, { InitOutput } from "./shared";
import wasm from "./shared/shared_bg.wasm";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);

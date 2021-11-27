import got from "got";
import { readFile } from "fs/promises";

export const readFileFromPathToString = async (path: string) => (await readFile(path)).toString();
export const readUrlContentToString = (url: string) => got({ url }).text();

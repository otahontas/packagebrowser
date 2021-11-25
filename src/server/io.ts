import { readFile } from "fs/promises";
import got from "got";

export const readFileFromPathToString = async (path: string) => (await readFile(path)).toString();
export const readUrlContentToString = (url: string) => got({ url }).text();

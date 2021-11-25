import fs, { ReadStream } from "fs";

const createReadStreamFromPath = (path: string) => fs.createReadStream(path);

const readStreamToString = async (stream: ReadStream) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};

export const readFileFromPathToString = (path: string) => readStreamToString(createReadStreamFromPath(path));

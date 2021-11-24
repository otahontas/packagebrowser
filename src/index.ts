import { readFileFromPathToString } from "./io";
import { parsePackagesFromString } from "./parser";
// import { createGraph } from "./graph";

const main = async () => {
  const path = "./examples/status2";
  parsePackagesFromString(await readFileFromPathToString(path));
  // const fileAsString = await readFileFromPathToString(path);
  // const parsed = parsePackagesFromString(fileAsString);
  //createGraph(parsed);
};

main();

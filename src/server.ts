import Fastify, { FastifyInstance } from "fastify";
import { readFileFromPathToString } from "./io";
import { createPackageGraph } from "./parser";
import routes from "./routes";

const server: FastifyInstance = Fastify({ logger: true });
server.register(routes);

const createGraphBeforeStarting = async () => {
  // should be fetched from startup command tms
  const path = "./examples/status";
  createPackageGraph(await readFileFromPathToString(path));
};

export const startServer = async () => {
  try {
    await createGraphBeforeStarting();
    await server.listen(8080);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
